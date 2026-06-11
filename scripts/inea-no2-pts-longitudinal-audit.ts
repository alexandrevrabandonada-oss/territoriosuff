import * as fs from 'node:fs';
import * as path from 'node:path';

interface NormalizedRow {
  datetime: string;
  value: number | null;
  station_id: string;
  parameter_id: string;
  pollutant: string;
}

interface YearlyStats {
  year: number;
  totalRecords: number;
  validRecords: number;
  nullRecords: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  whoExceedances?: number;
  conamaExceedances?: number;
  validDays?: number;
}

function getPercentile(arr: number[], percentile: number): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.floor((sorted.length - 1) * (percentile / 100));
  return sorted[index];
}

function processPollutantYear(stationId: string, paramId: string, year: number): YearlyStats | null {
  const filePath = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', stationId, paramId, `${year}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rows: NormalizedRow[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const validValues = rows.map(r => r.value).filter((v): v is number => v !== null && v >= 0);
  
  if (validValues.length === 0) {
    return {
      year,
      totalRecords: rows.length,
      validRecords: 0,
      nullRecords: rows.length,
      mean: null,
      min: null,
      max: null,
      p10: null,
      p25: null,
      p50: null,
      p75: null,
      p90: null
    };
  }

  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const p10 = getPercentile(validValues, 10);
  const p25 = getPercentile(validValues, 25);
  const p50 = getPercentile(validValues, 50);
  const p75 = getPercentile(validValues, 75);
  const p90 = getPercentile(validValues, 90);

  // Group by day for daily averages
  const dailyGroups: Record<string, number[]> = {};
  for (const r of rows) {
    if (r.datetime && r.value !== null && r.value >= 0) {
      const day = r.datetime.split('T')[0];
      if (!dailyGroups[day]) dailyGroups[day] = [];
      dailyGroups[day].push(r.value);
    }
  }

  let validDays = 0;
  let whoExceedances = 0;
  let conamaExceedances = 0;

  for (const [, vals] of Object.entries(dailyGroups)) {
    if (vals.length >= 18) {
      validDays++;
      const dailyMean = vals.reduce((a, b) => a + b, 0) / vals.length;
      
      if (paramId === '1465') { // NO2
        if (dailyMean > 25) whoExceedances++; // WHO daily > 25 µg/m³
      } else if (paramId === '1955') { // PTS
        if (dailyMean > 240) conamaExceedances++; // CONAMA daily > 240 µg/m³
      }
    }
  }

  if (paramId === '1465') { // NO2 hourly exceedances for CONAMA
    conamaExceedances = rows.filter(r => r.value !== null && r.value > 200).length; // 1h > 200 µg/m³
  }

  return {
    year,
    totalRecords: rows.length,
    validRecords: validValues.length,
    nullRecords: rows.length - validValues.length,
    mean,
    min,
    max,
    p10,
    p25,
    p50,
    p75,
    p90,
    whoExceedances,
    conamaExceedances,
    validDays
  };
}

async function run() {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  console.log("Starting longitudinal audit of Retiro (70) NO2 and PTS...");

  // 1. NO2 Audit
  const no2RetiroStats: YearlyStats[] = [];
  const no2Belmonte2024 = processPollutantYear('69', '1465', 2024);
  const no2SantaCecilia2024 = processPollutantYear('71', '1465', 2024);

  for (const yr of years) {
    const s = processPollutantYear('70', '1465', yr);
    if (s) no2RetiroStats.push(s);
  }

  let no2Report = `# Estado da Nação — Auditoria Longitudinal de NO₂ em Retiro (2020–2026)
## Estação VR-Retiro (ID 70) vs. Belmonte e Santa Cecília

**Data da Auditoria:** ${new Date().toISOString().split('T')[0]}  
**Parâmetro:** Dióxido de Nitrogênio (NO₂ — ID 1465)  
**Status de Publicação:** BLOQUEADO EM AUDITORIA

---

## 1. Estatísticas Longitudinais de NO₂ em Retiro

| Ano | Registros Válidos | Média (µg/m³) | Mín (µg/m³) | P10 (µg/m³) | P25 (µg/m³) | Mediana (µg/m³) | P75 (µg/m³) | P90 (µg/m³) | Máx (µg/m³) | Dias Exced. OMS | Horas Exced. CONAMA |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
`;

  for (const s of no2RetiroStats) {
    const mean = s.mean !== null ? s.mean.toFixed(2) : 'N/D';
    const min = s.min !== null ? s.min.toFixed(2) : 'N/D';
    const p10 = s.p10 !== null ? s.p10.toFixed(2) : 'N/D';
    const p25 = s.p25 !== null ? s.p25.toFixed(2) : 'N/D';
    const p50 = s.p50 !== null ? s.p50.toFixed(2) : 'N/D';
    const p75 = s.p75 !== null ? s.p75.toFixed(2) : 'N/D';
    const p90 = s.p90 !== null ? s.p90.toFixed(2) : 'N/D';
    const max = s.max !== null ? s.max.toFixed(2) : 'N/D';
    const partialSuffix = s.year === 2026 ? ' (parcial)' : '';
    no2Report += `| **${s.year}${partialSuffix}** | ${s.validRecords} | ${mean} | ${min} | ${p10} | ${p25} | ${p50} | ${p75} | ${p90} | ${max} | ${s.whoExceedances}d | ${s.conamaExceedances}h |\n`;
  }

  no2Report += `
---

## 2. Comparação de Baseline com Outras Estações (Linha de Base 2024)

*   **Belmonte (2024):** Média = ${no2Belmonte2024?.mean?.toFixed(2) ?? 'N/D'} µg/m³, P10 = ${no2Belmonte2024?.p10?.toFixed(2) ?? 'N/D'} µg/m³, Mediana = ${no2Belmonte2024?.p50?.toFixed(2) ?? 'N/D'} µg/m³, Máx = ${no2Belmonte2024?.max?.toFixed(2) ?? 'N/D'} µg/m³
*   **Santa Cecília (2024):** Média = ${no2SantaCecilia2024?.mean?.toFixed(2) ?? 'N/D'} µg/m³, P10 = ${no2SantaCecilia2024?.p10?.toFixed(2) ?? 'N/D'} µg/m³, Mediana = ${no2SantaCecilia2024?.p50?.toFixed(2) ?? 'N/D'} µg/m³, Máx = ${no2SantaCecilia2024?.max?.toFixed(2) ?? 'N/D'} µg/m³

---

## 3. Respostas aos Questionamentos de Auditoria

### 3.1. O offset do NO₂ no Retiro aparece em todos os anos?
*(Nota: O offset será analisado com base no P10/P25 e mínimos históricos acima)*
*(Veredito a ser preenchido reativamente com base nos dados reais)*

### 3.2. Há mudança brusca em algum ano/mês?
*(Análise reativa)*

### 3.3. Belmonte e Santa Cecília seguem padrões coerentes?
*(Comparação com as linhas de base de 2024)*

### 3.4. Veredito final de auditoria: O parâmetro pode ser recuperado parcialmente ou deve ficar bloqueado?
*(Veredito final)*
`;

  fs.writeFileSync(path.join(reportsDir, 'estado-da-nacao-inea-no2-retiro-auditoria-longitudinal.md'), no2Report, 'utf8');
  console.log("Created draft reports/estado-da-nacao-inea-no2-retiro-auditoria-longitudinal.md");

  // 2. PTS Audit
  const ptsRetiroStats: YearlyStats[] = [];
  const ptsBelmonte2024 = processPollutantYear('69', '1955', 2024);
  const ptsSantaCecilia2024 = processPollutantYear('71', '1955', 2024);

  for (const yr of years) {
    const s = processPollutantYear('70', '1955', yr);
    if (s) ptsRetiroStats.push(s);
  }

  let ptsReport = `# Estado da Nação — Auditoria Longitudinal de PTS em Retiro (2020–2026)
## Estação VR-Retiro (ID 70) vs. Belmonte e Santa Cecília

**Data da Auditoria:** ${new Date().toISOString().split('T')[0]}  
**Parâmetro:** Partículas Totais em Suspensão (PTS — ID 1955)  
**Status de Publicação:** BLOQUEADO / HISTÓRICO-TÉCNICO EM AUDITORIA

---

## 1. Estatísticas Longitudinais de PTS em Retiro

| Ano | Registros Válidos | Média (µg/m³) | Mín (µg/m³) | P10 (µg/m³) | P25 (µg/m³) | Mediana (µg/m³) | P75 (µg/m³) | P90 (µg/m³) | Máx (µg/m³) | Dias Exced. CONAMA |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
`;

  for (const s of ptsRetiroStats) {
    const mean = s.mean !== null ? s.mean.toFixed(2) : 'N/D';
    const min = s.min !== null ? s.min.toFixed(2) : 'N/D';
    const p10 = s.p10 !== null ? s.p10.toFixed(2) : 'N/D';
    const p25 = s.p25 !== null ? s.p25.toFixed(2) : 'N/D';
    const p50 = s.p50 !== null ? s.p50.toFixed(2) : 'N/D';
    const p75 = s.p75 !== null ? s.p75.toFixed(2) : 'N/D';
    const p90 = s.p90 !== null ? s.p90.toFixed(2) : 'N/D';
    const max = s.max !== null ? s.max.toFixed(2) : 'N/D';
    const partialSuffix = s.year === 2026 ? ' (parcial)' : '';
    ptsReport += `| **${s.year}${partialSuffix}** | ${s.validRecords} | ${mean} | ${min} | ${p10} | ${p25} | ${p50} | ${p75} | ${p90} | ${max} | ${s.conamaExceedances}d |\n`;
  }

  ptsReport += `
---

## 2. Comparação de Baseline com Outras Estações (Linha de Base 2024)

*   **Belmonte (2024):** Média = ${ptsBelmonte2024?.mean?.toFixed(2) ?? 'N/D'} µg/m³, P10 = ${ptsBelmonte2024?.p10?.toFixed(2) ?? 'N/D'} µg/m³, Mediana = ${ptsBelmonte2024?.p50?.toFixed(2) ?? 'N/D'} µg/m³, Máx = ${ptsBelmonte2024?.max?.toFixed(2) ?? 'N/D'} µg/m³
*   **Santa Cecília (2024):** Média = ${ptsSantaCecilia2024?.mean?.toFixed(2) ?? 'N/D'} µg/m³, P10 = ${ptsSantaCecilia2024?.p10?.toFixed(2) ?? 'N/D'} µg/m³, Mediana = ${ptsSantaCecilia2024?.p50?.toFixed(2) ?? 'N/D'} µg/m³, Máx = ${ptsSantaCecilia2024?.max?.toFixed(2) ?? 'N/D'} µg/m³

---

## 3. Respostas aos Questionamentos de Auditoria

### 3.1. O salto de escala do PTS no Retiro aparece só em 2024 ou é histórico?
*(Análise reativa)*

### 3.2. Há mudança brusca em algum ano/mês?
*(Análise reativa)*

### 3.3. Belmonte e Santa Cecília seguem padrões coerentes?
*(Comparação com as linhas de base de 2024)*

### 3.4. Veredito final de auditoria: O parâmetro pode ser recuperado parcialmente ou deve ficar bloqueado?
*(Veredito final)*
`;

  fs.writeFileSync(path.join(reportsDir, 'estado-da-nacao-inea-pts-retiro-auditoria-longitudinal.md'), ptsReport, 'utf8');
  console.log("Created draft reports/estado-da-nacao-inea-pts-retiro-auditoria-longitudinal.md");
}

run().catch(console.error);
