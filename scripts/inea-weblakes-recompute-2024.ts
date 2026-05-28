/**
 * inea-weblakes-recompute-2024.ts
 *
 * Tijolo 23 — QA de consistência do Observatório do Ar
 *
 * Audita o cache raw WebLakes/INEAPublico para site 70 (VR-Retiro) / PM10 (parâmetro 18)
 * para o ano de 2024, recalculando:
 *   - cobertura horária (records × mês)
 *   - médias horárias e diárias
 *   - excedências OMS 2021 (45 µg/m³ / 24h)
 *   - excedências CONAMA 506/2024 (50 µg/m³ / 24h — Padrão de Qualidade Final)
 *   - zeros e registros suspeitos
 *   - consistência do parser (data-value span)
 *
 * Regras metodológicas:
 *   - Média diária só calculada se ≥18 leituras horárias válidas no dia (75%)
 *   - Valor zero tratado como suspeito (ZERO_VALUE_REVIEW), excluído das médias
 *   - Sem QA/QC explícito: todos os resultados são experimentais
 *
 * Saída:
 *   - reports/inea-weblakes-recompute-2024-pm10-site70.json  (dados estruturados)
 *   - reports/estado-da-nacao-inea-cache-audit-2024.md       (relatório legível)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Constantes ────────────────────────────────────────────────────────────

const STATION_ID = '70';
const PARAMETER_ID = '18';
const STATION_NAME = 'VR - Retiro';
const POLLUTANT = 'PM10';
const UNIT = 'µg/m³';
const YEAR = 2024;

// Thresholds — CONAMA 506/2024 PM10 24h Padrão Final = 50 µg/m³ (idêntico ao 491/2018)
// OMS 2021 PM10 24h = 45 µg/m³
const THRESHOLD_WHO_24H = 45.0;
const THRESHOLD_BR_24H_CONAMA506 = 50.0;  // CONAMA 506/2024 (Padrão de Qualidade Final)
const _THRESHOLD_BR_24H_CONAMA491_PI1 = 120.0; // Padrão Intermediário PI-1 histórico (referência documental)

// Mínimo de leituras horárias válidas para calcular média diária (75% de 24h)
const MIN_HOURLY_FOR_DAILY_MEAN = 18;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// ─── Utilitários de parser (espelho de weblakesClient.ts) ─────────────────

function extractDataValue(html: string): string | null {
  const match = html.match(/data-value=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseDataValueSpan(html: string): string {
  const attr = extractDataValue(html);
  return attr !== null ? attr : cleanHtml(html);
}

function parseNumber(html: string): number | null {
  const str = parseDataValueSpan(html);
  if (!str) return null;
  const normalizedStr = str.replace(',', '.');
  const num = parseFloat(normalizedStr);
  return isNaN(num) ? null : num;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ─── Interfaces ────────────────────────────────────────────────────────────

interface RawRow {
  id: number;
  cell: string[];
}

interface ParsedHour {
  datetime: string;   // ISO 8601
  value: number | null;
  windSpeed: number | null;
  windDir: number | null;
  parseStatus: 'OK' | 'ZERO_VALUE_REVIEW' | 'INVALID' | 'NULL_VALUE';
}

interface MonthStats {
  month: string;          // YYYY-MM
  expectedHours: number;
  foundRecords: number;
  validValues: number;
  zeroValues: number;
  nullValues: number;
  coveragePct: number;
  hourlyMean: number | null;
  hourlyMax: number | null;
  hourlyMin: number | null;
  daysWithSufficientData: number;
  daysExceedingWHO: number;
  daysExceedingBR506: number;
  dailyMeans: Record<string, number | null>;
  cacheFileExists: boolean;
  cacheRecordsField: number;
  parserConsistencyOk: boolean;
}

interface AnnualSummary {
  station: string;
  stationId: string;
  parameter: string;
  parameterId: string;
  year: number;
  generatedAt: string;
  auditNotes: string[];
  totalExpectedHours: number;
  totalFoundRecords: number;
  totalValidValues: number;
  totalZeroValues: number;
  totalNullValues: number;
  annualCoveragePct: number;
  annualHourlyMean: number | null;
  annualHourlyMax: number | null;
  totalDaysWithSufficientData: number;
  totalDaysExceedingWHO: number;
  totalDaysExceedingBR506: number;
  months: MonthStats[];
  confidenceLevel: 'ALTO' | 'MEDIO' | 'BAIXO';
  confidenceReason: string;
}

// ─── Lógica principal ──────────────────────────────────────────────────────

async function runRecompute() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Tijolo 23 — QA Recompute 2024: VR-Retiro / PM10         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', STATION_ID, PARAMETER_ID);
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const auditNotes: string[] = [];
  const monthsStats: MonthStats[] = [];

  let totalFound = 0;
  let totalValid = 0;
  let totalZero = 0;
  let totalNull = 0;
  let totalExpected = 0;
  let totalDaysWithData = 0;
  let totalDaysWHO = 0;
  let totalDaysBR506 = 0;

  const allValidValues: number[] = [];

  for (const month of MONTHS) {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${YEAR}-${monthStr}`;
    const lastDay = getLastDayOfMonth(YEAR, month);
    const expectedHours = lastDay * 24;
    totalExpected += expectedHours;

    const rawCacheFile = path.join(rawCacheDir, `${yearMonth}.json`);
    const fileExists = fs.existsSync(rawCacheFile);

    console.log(`\n[${yearMonth}] Auditando...`);

    if (!fileExists) {
      console.warn(`  ⚠ Arquivo de cache NÃO encontrado: ${rawCacheFile}`);
      auditNotes.push(`${yearMonth}: arquivo de cache ausente — dados não disponíveis para este mês.`);
      monthsStats.push({
        month: yearMonth,
        expectedHours,
        foundRecords: 0,
        validValues: 0,
        zeroValues: 0,
        nullValues: 0,
        coveragePct: 0,
        hourlyMean: null,
        hourlyMax: null,
        hourlyMin: null,
        daysWithSufficientData: 0,
        daysExceedingWHO: 0,
        daysExceedingBR506: 0,
        dailyMeans: {},
        cacheFileExists: false,
        cacheRecordsField: 0,
        parserConsistencyOk: false,
      });
      continue;
    }

    let rawJson: string;
    try {
      rawJson = fs.readFileSync(rawCacheFile, 'utf8');
    } catch (err: any) {
      console.error(`  ✗ Erro ao ler arquivo: ${err.message}`);
      auditNotes.push(`${yearMonth}: erro ao ler arquivo de cache — ${err.message}`);
      continue;
    }

    let parsed: { total: number; page: number; records: number; rows: RawRow[] };
    try {
      parsed = JSON.parse(rawJson);
    } catch (err: any) {
      console.error(`  ✗ Erro ao parsear JSON: ${err.message}`);
      auditNotes.push(`${yearMonth}: JSON inválido no cache — ${err.message}`);
      continue;
    }

    const cacheRecordsField = parsed.records || 0;
    const rows: RawRow[] = parsed.rows || [];
    const foundRecords = rows.length;

    console.log(`  Cache: records=${cacheRecordsField}, rows.length=${foundRecords}, expected=${expectedHours}`);

    if (cacheRecordsField !== foundRecords) {
      auditNotes.push(`${yearMonth}: campo 'records'=${cacheRecordsField} diverge de rows.length=${foundRecords} — possível truncamento de resposta.`);
      console.warn(`  ⚠ Divergência: records=${cacheRecordsField} vs rows.length=${foundRecords}`);
    }

    // Parsear cada linha
    const parsedHours: ParsedHour[] = [];
    let parserConsistencyOk = true;
    let parserErrors = 0;

    for (const row of rows) {
      try {
        if (!Array.isArray(row.cell) || row.cell.length < 8) {
          parserErrors++;
          parserConsistencyOk = false;
          parsedHours.push({ datetime: '', value: null, windSpeed: null, windDir: null, parseStatus: 'INVALID' });
          continue;
        }

        const cellDateHtml = String(row.cell[2]);
        const cellValHtml = String(row.cell[5]);
        const cellWindSpeedHtml = String(row.cell[6]);
        const cellWindDirHtml = String(row.cell[7]);

        const datetime = parseDataValueSpan(cellDateHtml);
        const value = parseNumber(cellValHtml);
        const windSpeed = parseNumber(cellWindSpeedHtml);
        const windDir = parseNumber(cellWindDirHtml);

        let parseStatus: ParsedHour['parseStatus'] = 'OK';
        if (value === null) {
          parseStatus = 'NULL_VALUE';
        } else if (value < 0) {
          parseStatus = 'INVALID';
          parserErrors++;
        } else if (value === 0) {
          parseStatus = 'ZERO_VALUE_REVIEW';
        }

        parsedHours.push({ datetime, value, windSpeed, windDir, parseStatus });
      } catch (_err: unknown) {
        parserErrors++;
        parserConsistencyOk = false;
        parsedHours.push({ datetime: '', value: null, windSpeed: null, windDir: null, parseStatus: 'INVALID' });
      }
    }

    if (parserErrors > 0) {
      auditNotes.push(`${yearMonth}: ${parserErrors} erros de parser encontrados (células inválidas ou negativos).`);
    }

    // Calcular estatísticas
    const validHours = parsedHours.filter(h => h.parseStatus === 'OK');
    const zeroHours = parsedHours.filter(h => h.parseStatus === 'ZERO_VALUE_REVIEW');
    const nullHours = parsedHours.filter(h => h.parseStatus === 'NULL_VALUE' || h.parseStatus === 'INVALID');

    const validValues = validHours.map(h => h.value as number);

    const hourlyMean = validValues.length > 0
      ? validValues.reduce((a, b) => a + b, 0) / validValues.length
      : null;
    const hourlyMax = validValues.length > 0 ? Math.max(...validValues) : null;
    const hourlyMin = validValues.length > 0 ? Math.min(...validValues) : null;

    // Agrupar por dia para médias diárias
    const dailyGroups: Record<string, number[]> = {};
    for (const h of parsedHours) {
      if (h.parseStatus === 'OK' && h.datetime && h.value !== null) {
        const date = h.datetime.split('T')[0];
        if (!dailyGroups[date]) dailyGroups[date] = [];
        dailyGroups[date].push(h.value as number);
      }
    }

    const dailyMeans: Record<string, number | null> = {};
    let daysWithSufficientData = 0;
    let daysExceedingWHO = 0;
    let daysExceedingBR506 = 0;

    for (const [date, vals] of Object.entries(dailyGroups)) {
      if (vals.length >= MIN_HOURLY_FOR_DAILY_MEAN) {
        const dailyMean = vals.reduce((a, b) => a + b, 0) / vals.length;
        dailyMeans[date] = dailyMean;
        daysWithSufficientData++;
        if (dailyMean > THRESHOLD_WHO_24H) daysExceedingWHO++;
        if (dailyMean > THRESHOLD_BR_24H_CONAMA506) daysExceedingBR506++;
      } else {
        dailyMeans[date] = null;
        auditNotes.push(`${date}: apenas ${vals.length} leituras horárias — média diária não calculável (mínimo ${MIN_HOURLY_FOR_DAILY_MEAN}).`);
      }
    }

    const coveragePct = (foundRecords / expectedHours) * 100;

    console.log(`  Cobertura: ${foundRecords}/${expectedHours} (${coveragePct.toFixed(1)}%)`);
    console.log(`  Válidos: ${validValues.length}, Zeros: ${zeroHours.length}, Nulos: ${nullHours.length}`);
    console.log(`  Média horária: ${hourlyMean !== null ? hourlyMean.toFixed(2) : 'N/A'} ${UNIT}`);
    console.log(`  Dias com dados: ${daysWithSufficientData} | Excedências OMS: ${daysExceedingWHO} | BR/506: ${daysExceedingBR506}`);

    // Acumular globais
    totalFound += foundRecords;
    totalValid += validValues.length;
    totalZero += zeroHours.length;
    totalNull += nullHours.length;
    totalDaysWithData += daysWithSufficientData;
    totalDaysWHO += daysExceedingWHO;
    totalDaysBR506 += daysExceedingBR506;
    allValidValues.push(...validValues);

    monthsStats.push({
      month: yearMonth,
      expectedHours,
      foundRecords,
      validValues: validValues.length,
      zeroValues: zeroHours.length,
      nullValues: nullHours.length,
      coveragePct,
      hourlyMean,
      hourlyMax,
      hourlyMin,
      daysWithSufficientData,
      daysExceedingWHO,
      daysExceedingBR506,
      dailyMeans,
      cacheFileExists: true,
      cacheRecordsField,
      parserConsistencyOk,
    });
  }

  // Calcular resumo anual
  const annualMean = allValidValues.length > 0
    ? allValidValues.reduce((a, b) => a + b, 0) / allValidValues.length
    : null;
  const annualMax = allValidValues.length > 0 ? Math.max(...allValidValues) : null;
  const annualCoveragePct = (totalFound / totalExpected) * 100;

  // Nível de confiança
  let confidenceLevel: 'ALTO' | 'MEDIO' | 'BAIXO' = 'ALTO';
  let confidenceReason = 'Cobertura ≥90%, parser consistente em todos os meses, sem truncamento detectado.';

  if (annualCoveragePct < 75) {
    confidenceLevel = 'BAIXO';
    confidenceReason = `Cobertura anual de ${annualCoveragePct.toFixed(1)}% está abaixo do limiar de 75% para análise confiável.`;
  } else if (annualCoveragePct < 90) {
    confidenceLevel = 'MEDIO';
    confidenceReason = `Cobertura anual de ${annualCoveragePct.toFixed(1)}% está entre 75%–90%; resultados devem ser interpretados com cautela.`;
  } else if (auditNotes.filter(n => n.includes('diverge') || n.includes('truncamento') || n.includes('inválido')).length > 0) {
    confidenceLevel = 'MEDIO';
    confidenceReason = 'Cobertura ≥90%, mas há notas de auditoria sobre divergências de parser ou truncamento.';
  }

  const summary: AnnualSummary = {
    station: STATION_NAME,
    stationId: STATION_ID,
    parameter: POLLUTANT,
    parameterId: PARAMETER_ID,
    year: YEAR,
    generatedAt: new Date().toISOString(),
    auditNotes,
    totalExpectedHours: totalExpected,
    totalFoundRecords: totalFound,
    totalValidValues: totalValid,
    totalZeroValues: totalZero,
    totalNullValues: totalNull,
    annualCoveragePct,
    annualHourlyMean: annualMean,
    annualHourlyMax: annualMax,
    totalDaysWithSufficientData: totalDaysWithData,
    totalDaysExceedingWHO: totalDaysWHO,
    totalDaysExceedingBR506: totalDaysBR506,
    months: monthsStats,
    confidenceLevel,
    confidenceReason,
  };

  // Salvar JSON estruturado
  const jsonReportPath = path.join(reportsDir, 'inea-weblakes-recompute-2024-pm10-site70.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\n✓ JSON de auditoria salvo em: ${jsonReportPath}`);

  // ─── Gerar relatório markdown ─────────────────────────────────────────

  const confidenceEmoji = confidenceLevel === 'ALTO' ? '🟢' : confidenceLevel === 'MEDIO' ? '🟡' : '🔴';

  let md = `# Estado da Nação — QA de Consistência do Cache WebLakes 2024
## VR-Retiro / PM10 (Parâmetro 18)

**Data de auditoria:** ${new Date().toISOString().split('T')[0]}  
**Fonte dos dados:** Cache local WebLakes/INEAPublico (sem chamadas adicionais à API)  
**Metodologia:** Experimental — sem QA/QC explícito da plataforma WebLakes  
**Resolução:** Dados brutos com média horária, agregados em diária com mínimo de ${MIN_HOURLY_FOR_DAILY_MEAN} leituras  

> ⚠ **Aviso metodológico:** Os dados provêm de plataforma pública sem validação explícita.
> Todos os resultados devem ser tratados como experimentais. Ausência de dado não é ar bom.

---

## 1. Diagnóstico do Cache Raw

| Mês | Esperado | Encontrado | Cobertura | Válidos | Zeros | Nulos | Cache OK |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
`;

  for (const m of monthsStats) {
    const cacheIcon = m.cacheFileExists ? '✓' : '✗';
    md += `| ${m.month} | ${m.expectedHours}h | ${m.foundRecords}h | ${m.coveragePct.toFixed(1)}% | ${m.validValues} | ${m.zeroValues} | ${m.nullValues} | ${cacheIcon} |\n`;
  }

  md += `
**Total:** ${totalFound}/${totalExpected} horas encontradas — cobertura anual: **${annualCoveragePct.toFixed(1)}%**

---

## 2. Consistência do Parser (data-value span)

`;

  const parserFailMonths = monthsStats.filter(m => m.cacheFileExists && !m.parserConsistencyOk);
  if (parserFailMonths.length === 0) {
    md += `✅ **Parser consistente** em todos os ${MONTHS.length} meses analisados.  
O método \`parseDataValueSpan()\` extraiu corretamente o atributo \`data-value\` de todos os spans HTML nos arquivos de cache.\n\n`;
  } else {
    md += `⚠ **Parser com falhas** nos seguintes meses:\n`;
    for (const m of parserFailMonths) {
      md += `- **${m.month}**: inconsistências detectadas (ver notas de auditoria abaixo)\n`;
    }
    md += `\n`;
  }

  md += `---

## 3. Recálculo de Métricas PM10 Mensais

| Mês | Média Horária | Máxima Horária | Dias c/ Dados | Excedências OMS (>45 µg/m³) | Excedências CONAMA 506 (>50 µg/m³) |
| :--- | ---: | ---: | ---: | ---: | ---: |
`;

  for (const m of monthsStats) {
    const mean = m.hourlyMean !== null ? `${m.hourlyMean.toFixed(2)} ${UNIT}` : 'N/D';
    const max = m.hourlyMax !== null ? `${m.hourlyMax.toFixed(2)} ${UNIT}` : 'N/D';
    md += `| ${m.month} | ${mean} | ${max} | ${m.daysWithSufficientData} | ${m.daysExceedingWHO} | ${m.daysExceedingBR506} |\n`;
  }

  md += `
**Resumo anual PM10 — VR-Retiro 2024 (dados experimentais):**
- Média horária anual: **${annualMean !== null ? annualMean.toFixed(2) + ' ' + UNIT : 'N/D'}**
- Pico horário anual: **${annualMax !== null ? annualMax.toFixed(2) + ' ' + UNIT : 'N/D'}**
- Dias com dados suficientes: **${totalDaysWithData}**
- Excedências experimentais OMS 24h (>45 µg/m³): **${totalDaysWHO} dias**
- Excedências experimentais CONAMA 506/2024 (>50 µg/m³): **${totalDaysBR506} dias**

---

## 4. Régua Legal — CONAMA 506/2024

A resolução CONAMA 506/2024 substituiu a CONAMA 491/2018. Para PM10:

| Regime | Período | Valor (µg/m³) | Status Legal |
| :--- | :--- | ---: | :--- |
| CONAMA 506/2024 Padrão Final | 24h | 50 | Vigente |
| OMS 2021 | 24h | 45 | Recomendação internacional |
| OMS 2021 | Anual | 15 | Recomendação internacional |

> O valor CONAMA 506/2024 de 50 µg/m³ (24h) é numericamente idêntico ao Padrão Final da CONAMA 491/2018.
> A migração de régua legal não altera os valores-limite do padrão final para PM10,
> mas contextualiza a referência normativa correta vigente em 2024.

---

## 5. Nível de Confiança dos Resultados

${confidenceEmoji} **Nível de confiança: ${confidenceLevel}**

${confidenceReason}

---

## 6. Notas de Auditoria

`;

  if (auditNotes.length === 0) {
    md += `✅ Nenhuma nota de auditoria — todos os meses processados sem irregularidades detectadas.\n\n`;
  } else {
    for (const note of auditNotes) {
      md += `- ${note}\n`;
    }
    md += `\n`;
  }

  md += `---

## 7. Origem e Integridade do Cache

- **Fonte das chamadas originais:** \`scripts/inea-weblakes-historical-extract.ts\` e piloto \`scripts/inea-weblakes-pilot.ts\`
- **Localização do cache:** \`.cache/inea/weblakes/raw/${STATION_ID}/${PARAMETER_ID}/\`
- **Total de arquivos mensais verificados:** ${MONTHS.length}
- **API calls adicionais realizadas nesta auditoria:** 0 (100% de cache local)
- **Nenhum dado foi modificado no cache** durante esta auditoria — leitura somente.

---

## 8. Próximos Passos Recomendados

1. Validar que os zeros (${totalZero} horas) correspondem a lacunas reais de medição ou falhas de sensor.
2. Antes de publicar excedências como afirmação definitiva, verificar via cruzamento com fonte IQAr/Dados Abertos RJ para o mesmo período.
3. Atualizar todos os relatórios e componentes do Observatório para referenciar CONAMA 506/2024 como régua legal vigente.
4. Implementar rótulo de nível de confiança (${confidenceLevel}) na interface pública do Observatório.
`;

  const mdReportPath = path.join(reportsDir, 'estado-da-nacao-inea-cache-audit-2024.md');
  fs.writeFileSync(mdReportPath, md, 'utf8');
  console.log(`✓ Relatório markdown salvo em: ${mdReportPath}`);

  // ─── Verificação cross-format: comparar cache diário vs mensal de julho ────

  const dailyCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', STATION_ID, PARAMETER_ID);
  const julyDailyFile = path.join(dailyCacheDir, '2024-07-01.json');
  
  if (fs.existsSync(julyDailyFile)) {
    console.log('\n─── Verificação Cross-Format: Cache Diário vs Mensal (julho 2024) ───');
    const dailyRaw = JSON.parse(fs.readFileSync(julyDailyFile, 'utf8'));
    const dailyRows = dailyRaw.rows || [];
    
    if (dailyRows.length > 0) {
      const firstDailyRow = dailyRows[0];
      const dailyCellValue = String(firstDailyRow.cell[5]);
      const dailyDataValue = dailyCellValue.match(/data-value=['"]([^'"]+)['"]/);
      
      console.log(`  Formato data-value (diário):  ${dailyDataValue?.[1] || 'N/A'}`);
      
      // Compare with monthly cache
      const monthlyFile = path.join(dailyCacheDir, '2024-07.json');
      if (fs.existsSync(monthlyFile)) {
        const monthlyRaw = JSON.parse(fs.readFileSync(monthlyFile, 'utf8'));
        const monthlyRows = monthlyRaw.rows || [];
        if (monthlyRows.length > 0) {
          const firstMonthlyRow = monthlyRows[0];
          const monthlyCellValue = String(firstMonthlyRow.cell[5]);
          const monthlyDataValue = monthlyCellValue.match(/data-value=['"]([^'"]+)['"]/);
          console.log(`  Formato data-value (mensal): ${monthlyDataValue?.[1] || 'N/A'}`);
          
          // Parse both
          const dailyVal = dailyDataValue ? parseFloat(dailyDataValue[1].replace(',', '.')) : null;
          const monthlyVal = monthlyDataValue ? parseFloat(monthlyDataValue[1]) : null;
          
          console.log(`  Valor diário 2024-07-01T00:  ${dailyVal !== null ? dailyVal.toFixed(2) + ' ' + UNIT : 'N/A'}`);
          console.log(`  Valor mensal 2024-07-01T00:  ${monthlyVal !== null ? monthlyVal.toFixed(2) + ' ' + UNIT : 'N/A'}`);
          
          if (dailyVal !== null && monthlyVal !== null) {
            const ratio = monthlyVal / dailyVal;
            if (ratio > 5 || ratio < 0.2) {
              console.log(`  ⚠ DIVERGÊNCIA CRÍTICA: razão mensal/diário = ${ratio.toFixed(1)}x`);
              console.log(`    Os dois caches podem representar poluentes diferentes ou configurações de sessão distintas.`);
              auditNotes.push(`DIVERGÊNCIA CRÍTICA: valor mensal de julho (${monthlyVal.toFixed(2)} µg/m³) é ${ratio.toFixed(1)}x maior que o valor diário do mesmo horário (${dailyVal.toFixed(2)} µg/m³). Os arquivos mensais podem não representar PM10 puro — verificação manual necessária antes de qualquer publicação.`);
              
              // Append to markdown report
              let updatedMd = fs.readFileSync(mdReportPath, 'utf8');
              updatedMd += `
---

## 9. ⚠ DIVERGÊNCIA CRÍTICA: Cache Diário vs Mensal

| | Valor 2024-07-01T00:00 | Formato data-value |
| :--- | ---: | :--- |
| Cache **diário** (piloto) | **${dailyVal.toFixed(2)} ${UNIT}** | \`${dailyDataValue?.[1]}\` |
| Cache **mensal** (extração anual) | **${monthlyVal.toFixed(2)} ${UNIT}** | \`${monthlyDataValue?.[1]}\` |
| **Razão mensal/diário** | **${ratio.toFixed(1)}x** | — |

> ⚠ **Esta divergência compromete a validade dos dados mensais de 2024 para publicação pública.**
>
> **Hipótese mais provável:** O endpoint WebLakes é stateful. O parâmetro selecionado via  
> \`StoreSelectedFieldKey\` pode não estar sendo respeitado corretamente quando múltiplos poluentes  
> são consultados na mesma sessão. Os arquivos mensais podem corresponder a um poluente diferente  
> do que PM10 (parâmetro 18), apesar de estarem na pasta \`raw/70/18/\`.
>
> **Ação recomendada:** Bloquear afirmações públicas sobre PM10 com base nos dados mensais de 2024  
> até que uma verificação manual cruzada com a interface WebLakes pública seja realizada.  
> O piloto de julho 2024 (dados diários, média 35,09 µg/m³) é o único conjunto validado.

`;
              fs.writeFileSync(mdReportPath, updatedMd, 'utf8');
              console.log('  → Relatório atualizado com nota de divergência crítica.');
            } else {
              console.log(`  ✓ Razão mensal/diário dentro do esperado: ${ratio.toFixed(2)}x`);
            }
          }
        }
      }
    }
  }

  // ─── Resumo final no console ──────────────────────────────────────────

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  RESUMO DA AUDITORIA                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`  Cobertura anual:   ${annualCoveragePct.toFixed(1)}%`);
  console.log(`  Média horária:     ${annualMean !== null ? annualMean.toFixed(2) + ' ' + UNIT : 'N/D'}`);
  console.log(`  Pico horário:      ${annualMax !== null ? annualMax.toFixed(2) + ' ' + UNIT : 'N/D'}`);
  console.log(`  Dias OMS >45:      ${totalDaysWHO}`);
  console.log(`  Dias CONAMA 506:   ${totalDaysBR506} (>50 µg/m³)`);
  console.log(`  Confiança:         ${confidenceLevel}`);
  console.log(`  Notas de audit.:   ${auditNotes.length}`);
  console.log('');
}

runRecompute().catch(err => {
  console.error('Erro fatal na auditoria:', err);
  process.exit(1);
});
