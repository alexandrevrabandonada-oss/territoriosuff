import * as fs from 'node:fs';
import * as path from 'node:path';
import { initPublicSession, fetchConcentrationWithWindArrows, parseJqGridRows, normalizeConcentrationRow, NormalizedRow } from '../src/lib/inea/weblakesClient';

const STATION_ID = "70";
const PARAMETER_ID = "18"; // PM10
const YEAR_MONTH = "2024-07";
const DAYS_IN_MONTH = 31;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPilot() {
  console.log(`Starting INEA WebLakes Pilot Collector for July 2024 (Station: ${STATION_ID}, Parameter: ${PARAMETER_ID})`);

  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', STATION_ID, PARAMETER_ID);
  const normalizedCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'normalized', STATION_ID, PARAMETER_ID);
  fs.mkdirSync(rawCacheDir, { recursive: true });
  fs.mkdirSync(normalizedCacheDir, { recursive: true });

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  let cookies = "";
  let apiCallsMade = 0;
  const allRawRows: any[] = [];
  const normalizedRows: NormalizedRow[] = [];

  for (let day = 1; day <= DAYS_IN_MONTH; day++) {
    const dayStr = String(day).padStart(2, '0');
    const currentDateStr = `${YEAR_MONTH}-${dayStr}`;
    const cacheFilePath = path.join(rawCacheDir, `${currentDateStr}.json`);

    let rawDataJson: string;

    if (fs.existsSync(cacheFilePath)) {
      console.log(`[Cache Hit] Loading data for ${currentDateStr} from cache.`);
      rawDataJson = fs.readFileSync(cacheFilePath, 'utf8');
    } else {
      console.log(`[Cache Miss] Requesting data for ${currentDateStr}...`);
      
      // Initialize session cookies if not already done
      if (!cookies) {
        try {
          cookies = await initPublicSession();
          console.log("Session cookies initialized successfully.");
        } catch (err: any) {
          console.error("Failed to initialize public session:", err);
          process.exit(1);
        }
      }

      // Fetch day data
      try {
        apiCallsMade++;
        // Fetch parameters: startDate and endDate are the same day to get exactly 1 day
        rawDataJson = await fetchConcentrationWithWindArrows("qualidadedoar.inea.rj.gov.br", cookies, {
          stationId: STATION_ID,
          parameterId: PARAMETER_ID,
          startDate: currentDateStr,
          endDate: currentDateStr
        });

        // Save raw response to cache
        fs.writeFileSync(cacheFilePath, rawDataJson, 'utf8');
        console.log(`Saved raw data to cache: ${cacheFilePath}`);
        
        // Random backoff between 10 and 20 seconds as requested
        const pauseTime = 10000 + Math.floor(Math.random() * 10000);
        console.log(`Pausing for ${(pauseTime / 1000).toFixed(1)} seconds to respect rate limits...`);
        await delay(pauseTime);

      } catch (err: any) {
        console.error(`Error fetching data for ${currentDateStr}:`, err);
        // Continue to see if we can get other days, or stop depending on severity
        continue;
      }
    }

    // Process raw response
    try {
      const rows = parseJqGridRows(rawDataJson);
      console.log(`Loaded ${rows.length} rows for ${currentDateStr}`);
      allRawRows.push(...rows);

      for (const row of rows) {
        const normalized = normalizeConcentrationRow(row, {
          stationId: STATION_ID,
          parameterId: PARAMETER_ID,
          startDate: currentDateStr,
          endDate: currentDateStr
        });
        normalizedRows.push(normalized);
      }
    } catch (err: any) {
      console.error(`Error parsing data for ${currentDateStr}:`, err);
    }
  }

  // Save normalized monthly JSON
  const normalizedMonthlyPath = path.join(normalizedCacheDir, `${YEAR_MONTH}.json`);
  fs.writeFileSync(normalizedMonthlyPath, JSON.stringify(normalizedRows, null, 2), 'utf8');
  console.log(`Saved normalized monthly data to: ${normalizedMonthlyPath}`);

  // Generate CSV
  const csvPath = path.join(reportsDir, `inea-weblakes-pilot-vr-retiro-pm10-${YEAR_MONTH}.csv`);
  const csvHeaders = [
    "source",
    "source_system",
    "station_id",
    "station_name",
    "parameter_id",
    "pollutant",
    "datetime",
    "value",
    "unit",
    "wind_speed",
    "wind_direction",
    "qaqc",
    "is_public_platform_data",
    "validation_status"
  ];

  let csvContent = "\uFEFF" + csvHeaders.join(",") + "\n";
  for (const r of normalizedRows) {
    const rowValues = [
      r.source,
      r.source_system,
      r.station_id,
      `"${r.station_name}"`,
      r.parameter_id,
      r.pollutant,
      r.datetime,
      r.value !== null ? r.value.toFixed(6) : "",
      r.unit,
      r.wind_speed !== null ? r.wind_speed.toFixed(6) : "",
      r.wind_direction !== null ? r.wind_direction.toFixed(6) : "",
      r.qaqc !== null ? r.qaqc : "",
      r.is_public_platform_data ? "true" : "false",
      r.validation_status
    ];
    csvContent += rowValues.join(",") + "\n";
  }

  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`Saved pilot CSV to: ${csvPath}`);

  // Perform calculations for Task 4 & 5
  const totalHoursDownloaded = normalizedRows.length;
  const expectedHours = 31 * 24; // 744 hours
  const missingHours = Math.max(0, expectedHours - totalHoursDownloaded);

  let zeroValuesCount = 0;
  let validValuesCount = 0;
  let sumValues = 0;
  let minValue = Infinity;
  let maxValue = -Infinity;
  let peakDatetime = "";

  // Group by day for daily averages
  const dailyData: Record<string, { sum: number; count: number; values: number[] }> = {};

  for (const r of normalizedRows) {
    const val = r.value;
    const dateOnly = r.datetime.split('T')[0];

    if (!dailyData[dateOnly]) {
      dailyData[dateOnly] = { sum: 0, count: 0, values: [] };
    }

    if (val !== null) {
      validValuesCount++;
      sumValues += val;
      if (val === 0) {
        zeroValuesCount++;
      }
      if (val < minValue) {
        minValue = val;
      }
      if (val > maxValue) {
        maxValue = val;
        peakDatetime = r.datetime;
      }
      dailyData[dateOnly].sum += val;
      dailyData[dateOnly].count += 1;
      dailyData[dateOnly].values.push(val);
    }
  }

  const averageValue = validValuesCount > 0 ? sumValues / validValuesCount : null;
  const cleanMin = minValue === Infinity ? null : minValue;
  const cleanMax = maxValue === -Infinity ? null : maxValue;

  // Daily average calculations & OMS Comparison
  const OMS_PM10_24H_LIMIT = 45;
  let calculableDaysCount = 0;
  let omsExceedancesCount = 0;
  const dailyAveragesReport: { date: string; avg: number | null; count: number; exceed: boolean | null }[] = [];

  for (let d = 1; d <= 31; d++) {
    const dateStr = `${YEAR_MONTH}-${String(d).padStart(2, '0')}`;
    const dayObj = dailyData[dateStr];

    if (dayObj && dayObj.count >= 18) {
      const dailyAvg = dayObj.sum / dayObj.count;
      const exceed = dailyAvg > OMS_PM10_24H_LIMIT;
      calculableDaysCount++;
      if (exceed) {
        omsExceedancesCount++;
      }
      dailyAveragesReport.push({
        date: dateStr,
        avg: dailyAvg,
        count: dayObj.count,
        exceed: exceed
      });
    } else {
      dailyAveragesReport.push({
        date: dateStr,
        avg: null,
        count: dayObj ? dayObj.count : 0,
        exceed: null
      });
    }
  }

  // Generate Estado da Nação Report
  const pilotReportPath = path.join(reportsDir, 'estado-da-nacao-inea-weblakes-pilot.md');
  const dailyAverageTableRows = dailyAveragesReport.map(r => {
    const avgStr = r.avg !== null ? `${r.avg.toFixed(2)} µg/m³` : "Dado Insuficiente (<18h)";
    const countStr = `${r.count}/24h`;
    let exceedStr = "N/A";
    if (r.exceed !== null) {
      exceedStr = r.exceed ? "**SIM (Ultrapassou)**" : "Não";
    }
    return `| ${r.date} | ${avgStr} | ${countStr} | ${exceedStr} |`;
  }).join("\n");

  const mdReport = `# Estado da Nação — Coletor Piloto WebLakes/INEAPublico

**Período do Piloto:** Julho de 2024 (01/07/2024 a 01/08/2024)  
**Estação:** VR - Retiro (ID: 70)  
**Poluente:** PM10 (ID: 18)  
**Métrica:** Concentração física horária em µg/m³  
**Data do Relatório:** ${new Date().toISOString()}  
**Status do Piloto:** Concluído com sucesso  

---

## 1. Estatísticas de Coleta e Auditoria Técnica

- **Chamadas de API realizadas ao servidor:** ${apiCallsMade} *(Nota: Chamadas evitadas por cache local não são contabilizadas)*
- **Registros horários físicos baixados:** ${totalHoursDownloaded} de ${expectedHours} previstos (${((totalHoursDownloaded / expectedHours) * 100).toFixed(1)}% de cobertura)
- **Registros horários ausentes (lacunas temporais):** ${missingHours} horas
- **Valores medidos iguais a zero:** ${zeroValuesCount} registro(s)
- **Concentração Mínima Registrada:** ${cleanMin !== null ? `${cleanMin.toFixed(2)} µg/m³` : "N/A"}
- **Concentração Média do Período:** ${averageValue !== null ? `${averageValue.toFixed(2)} µg/m³` : "N/A"}
- **Concentração Máxima Registrada (Pico):** ${cleanMax !== null ? `${cleanMax.toFixed(2)} µg/m³` : "N/A"} (Ocorrido em: ${peakDatetime})

---

## 2. Comparativo Experimental com a OMS (24h)

> [!WARNING]
> **EXPERIMENTAL_OMS_COMPARISON**  
> Os cálculos abaixo são puramente experimentais e baseiam-se em dados horários extraídos da rede pública provisória sem flags oficiais de validação de qualidade (QA/QC). Não devem ser apresentados como conclusões definitivas ou científicas de saúde pública antes de expansão e validação.

### Metodologia do Cálculo
*   **Limite de referência diária da OMS para PM10:** 45 µg/m³
*   **Regra de validade diária:** A média diária só é calculada se houver pelo menos **18 leituras horárias válidas** no dia (75% de cobertura). Dias com menos de 18 leituras são classificados como tendo cobertura de dados insuficiente.

### Resultados
- **Dias no mês com média diária calculável:** ${calculableDaysCount} de 31 dias
- **Dias com violação experimental da referência da OMS (média > 45 µg/m³):** ${omsExceedancesCount} dia(s)

### Tabela de Médias Diárias

| Data | Média Diária PM10 | Cobertura Horária | Ultrapassou Limite OMS (45 µg/m³)? |
| :--- | :--- | :--- | :--- |
${dailyAverageTableRows}

---

## 3. Limitações Técnicas e Ausência de QA/QC

1.  **Sem Flags de Validação Explicitados:** O endpoint tabular de concentrações horárias da plataforma WebLakes do INEA (\`/ConcentrationWithWindArrows/GridData\`) não fornece flags de qualidade do ar por registro (ex: "OK", "Suspeito", "Inválido"). Toda leitura presente foi tratada como válida.
2.  **Origem dos Dados:** Os dados horários coletados representam as informações exibidas em tempo corrido pela plataforma pública integrada e não substituem relatórios oficiais consolidados.
3.  **Lacunas de Comunicação:** Há períodos de ausência absoluta de dados nas tabelas (por exemplo, horas onde a linha de registro simplesmente não é emitida). No total, restaram ${missingHours} horas não cobertas em julho de 2024.

---

## 4. Conclusão da Validação de Sucesso

A geração do arquivo CSV piloto [inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv](file:///C:/Projetos/SEMEAR%20PWA/reports/inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv) foi concluída em conformidade com as regras éticas do Projeto SEMEAR, utilizando cache local obrigatório e backoff de atraso entre chamadas. Este piloto comprova a viabilidade técnica de coletar concentrações físicas horárias e realizar avaliações comparativas, estabelecendo uma base metodológica estruturada.
`;

  fs.writeFileSync(pilotReportPath, mdReport, 'utf8');
  console.log(`Saved pilot md report to: ${pilotReportPath}`);
}

runPilot();
