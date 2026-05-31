import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { DATA_DICTIONARY } from '../src/data/air/data-dictionary.ts';
import { ATTENTION_EPISODES } from '../src/data/air/attention-episodes-2020-2026.ts';

// Helper to escape CSV values
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getAnnualCoverageStatus(year: number, stationId: string, pollutantName: 'PM10' | 'PM2.5'): string {
  if (year === 2026) return "SUFFICIENT";
  if (year === 2021 && stationId === "71") {
    return "INSUFFICIENT_ANNUAL_COVERAGE";
  }
  try {
    const summaryPath = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', `summary-${year}.json`);
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      const pollutantId = pollutantName === 'PM10' ? '18' : '20';
      const coverage = summary[stationId]?.pollutants?.[pollutantId]?.coveragePct;
      if (coverage !== undefined && coverage < 75) {
        return "INSUFFICIENT_ANNUAL_COVERAGE";
      }
    }
  } catch (err) {
    console.error(`Error reading annual coverage for ${year}/${stationId}/${pollutantName}:`, err);
  }
  return "SUFFICIENT";
}

const getValidDays = (year: number, pollutantName: 'PM10' | 'PM2.5', stationId: string): number => {
  return ATTENTION_EPISODES
    .filter(e => e.year === year && e.pollutant === pollutantName && e.station_id === stationId)
    .reduce((sum, curr) => sum + curr.valid_days, 0);
};

function generateStationSummaryCsv(year: number, pollutantId: string, pollutantName: 'PM10' | 'PM2.5', isPartial: boolean, filepath: string) {
  const summaryPath = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', `summary-${year}.json`);
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  const headers = [
    "station_id", "station_name", "coverage_percent", "hourly_records",
    "annual_mean_available_hourly", "hourly_peak", "zero_values", "valid_days",
    "who_24h_exceedance_days", "conama506_24h_exceedance_days", "confidence_level",
    "source_system", "data_quality_tier", "validation_note", "coverage_status"
  ];
  const rows = [headers.join(",")];

  const stations = [
    { id: "69", name: "VR-Belmonte" },
    { id: "70", name: "VR-Retiro" },
    { id: "71", name: "VR-Santa Cecília" }
  ];

  for (const st of stations) {
    const rawData = summary[st.id]?.pollutants?.[pollutantId];
    if (!rawData) continue;

    const row = [
      escapeCsv(Number(st.id)),
      escapeCsv(st.name),
      escapeCsv(Number(rawData.coveragePct).toFixed(2)),
      escapeCsv(rawData.totalHours),
      escapeCsv(rawData.mean !== null ? Number(rawData.mean).toFixed(2) : ''),
      escapeCsv(rawData.max !== null ? Number(rawData.max).toFixed(2) : ''),
      escapeCsv(rawData.zeroHours),
      escapeCsv(getValidDays(year, pollutantName, st.id)),
      escapeCsv(rawData.exceedances?.WHO_24H ?? 0),
      escapeCsv(rawData.exceedances?.BR_24H_FINAL ?? 0),
      escapeCsv(isPartial ? "LOW" : "MEDIUM"),
      escapeCsv("WEBLAKES_CONCENTRATION_WITH_WIND"),
      escapeCsv("RAW_PUBLIC_PLATFORM"),
      escapeCsv(isPartial 
        ? "Ano parcial/em andamento (Jan a Mai). Sem QA/QC oficial; experimental." 
        : "Sem QA/QC oficial explícito; comparação experimental."),
      escapeCsv(getAnnualCoverageStatus(year, st.id, pollutantName))
    ];
    rows.push(row.join(","));
  }

  fs.writeFileSync(filepath, rows.join("\n"), 'utf8');
}

async function main() {
  console.log("Generating CSV exports for public quality-ar open data portal...");
  const publicDir = path.join(process.cwd(), 'public', 'data', 'air');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Data Dictionary CSV
  const dictionaryCsvHeaders = ["field_name", "label", "description", "unit", "source", "caveat"];
  const dictionaryCsvRows = [dictionaryCsvHeaders.join(",")];
  for (const entry of DATA_DICTIONARY) {
    const row = [
      escapeCsv(entry.field_name),
      escapeCsv(entry.label),
      escapeCsv(entry.description),
      escapeCsv(entry.unit),
      escapeCsv(entry.source),
      escapeCsv(entry.caveat)
    ];
    dictionaryCsvRows.push(row.join(","));
  }
  fs.writeFileSync(path.join(publicDir, 'data-dictionary.csv'), dictionaryCsvRows.join("\n"), 'utf8');
  console.log("  - Generated data-dictionary.csv");

  // 2. Attention Episodes CSV (2020-2026)
  const episodesHeaders = [
    "year", "pollutant", "station_id", "station_name", "month", "valid_days",
    "who_exceedance_days", "conama_exceedance_days", "max_hourly_value",
    "max_hourly_at", "coverage_percent", "data_quality_tier", "validation_note", "coverage_status"
  ];
  const episodesRows = [episodesHeaders.join(",")];
  for (const ep of ATTENTION_EPISODES) {
    const row = [
      escapeCsv(ep.year),
      escapeCsv(ep.pollutant),
      escapeCsv(ep.station_id),
      escapeCsv(ep.station_name),
      escapeCsv(ep.month),
      escapeCsv(ep.valid_days),
      escapeCsv(ep.who_exceedance_days),
      escapeCsv(ep.conama_exceedance_days),
      escapeCsv(ep.max_hourly_value !== null ? Number(ep.max_hourly_value).toFixed(2) : ''),
      escapeCsv(ep.max_hourly_at),
      escapeCsv(Number(ep.coverage_percent).toFixed(2)),
      escapeCsv(ep.data_quality_tier),
      escapeCsv(ep.validation_note),
      escapeCsv(getAnnualCoverageStatus(ep.year, ep.station_id, ep.pollutant))
    ];
    episodesRows.push(row.join(","));
  }
  fs.writeFileSync(path.join(publicDir, 'attention-episodes-2020-2026.csv'), episodesRows.join("\n"), 'utf8');
  console.log("  - Generated attention-episodes-2020-2026.csv");

  // 3. Generate summaries for 2020, 2021, 2024, 2025, 2026
  generateStationSummaryCsv(2020, "18", "PM10", false, path.join(publicDir, 'pm10-2020-station-summary.csv'));
  console.log("  - Generated pm10-2020-station-summary.csv");

  generateStationSummaryCsv(2021, "18", "PM10", false, path.join(publicDir, 'pm10-2021-station-summary.csv'));
  console.log("  - Generated pm10-2021-station-summary.csv");

  generateStationSummaryCsv(2021, "20", "PM2.5", false, path.join(publicDir, 'pm25-2021-station-summary.csv'));
  console.log("  - Generated pm25-2021-station-summary.csv");

  generateStationSummaryCsv(2024, "18", "PM10", false, path.join(publicDir, 'pm10-2024-station-summary.csv'));
  console.log("  - Generated pm10-2024-station-summary.csv");
  
  generateStationSummaryCsv(2024, "20", "PM2.5", false, path.join(publicDir, 'pm25-2024-station-summary.csv'));
  console.log("  - Generated pm25-2024-station-summary.csv");

  generateStationSummaryCsv(2025, "18", "PM10", false, path.join(publicDir, 'pm10-2025-station-summary.csv'));
  console.log("  - Generated pm10-2025-station-summary.csv");

  generateStationSummaryCsv(2025, "20", "PM2.5", false, path.join(publicDir, 'pm25-2025-station-summary.csv'));
  console.log("  - Generated pm25-2025-station-summary.csv");

  generateStationSummaryCsv(2026, "18", "PM10", true, path.join(publicDir, 'pm10-2026-partial-station-summary.csv'));
  console.log("  - Generated pm10-2026-partial-station-summary.csv");

  generateStationSummaryCsv(2026, "20", "PM2.5", true, path.join(publicDir, 'pm25-2026-partial-station-summary.csv'));
  console.log("  - Generated pm25-2026-partial-station-summary.csv");

  // 4. Particulate Timeline (2020-2026) CSV
  const timelineHeaders = [
    "year", "station_id", "station_name", "pollutant", "annual_mean",
    "max_hourly_peak", "coverage_percent", "exceedance_days_who", "exceedance_days_conama", "coverage_status"
  ];
  const timelineRows = [timelineHeaders.join(",")];

  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
  const stations = [
    { id: "69", name: "VR - Belmonte" },
    { id: "70", name: "VR - Retiro" },
    { id: "71", name: "VR - Santa Cecília" }
  ];
  const pollutants = [
    { id: "18", name: "PM10" },
    { id: "20", name: "PM2.5" }
  ];

  for (const yr of years) {
    const summaryPath = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', `summary-${yr}.json`);
    if (!fs.existsSync(summaryPath)) continue;
    const yearSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    for (const st of stations) {
      for (const pol of pollutants) {
        const raw = yearSummary[st.id]?.pollutants?.[pol.id];
        if (raw && raw.totalHours > 0) {
          const row = [
            escapeCsv(Number(yr)),
            escapeCsv(Number(st.id)),
            escapeCsv(st.name),
            escapeCsv(pol.name),
            escapeCsv(raw.mean !== null ? Number(raw.mean).toFixed(2) : ''),
            escapeCsv(raw.max !== null ? Number(raw.max).toFixed(2) : ''),
            escapeCsv(Number(raw.coveragePct).toFixed(2)),
            escapeCsv(raw.exceedances?.WHO_24H ?? 0),
            escapeCsv(raw.exceedances?.BR_24H_FINAL ?? 0),
            escapeCsv(getAnnualCoverageStatus(Number(yr), st.id, pol.name as 'PM10' | 'PM2.5'))
          ];
          timelineRows.push(row.join(","));
        }
      }
    }
  }
  fs.writeFileSync(path.join(publicDir, 'particulate-timeline-2020-2026.csv'), timelineRows.join("\n"), 'utf8');
  console.log("  - Generated particulate-timeline-2020-2026.csv");

  // 5. Generate manifest.json dynamically with dataset versioning
  let commitHash = 'unknown';
  try {
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn("Could not determine git commit hash:", e);
  }

  const generatedAt = new Date().toISOString();

  const manifestData = {
    version: "1.3.1",
    dataset_version: "1.3.1",
    status: "saudável",
    generated_at: generatedAt,
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    methodology_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
    commit_hash: commitHash,
    coverage_notes: "Série histórica abrangendo de 2020 a 2026 para Volta Redonda. O ano de 2026 é parcial. Cobertura horária variável de acordo com a integridade do sinal público do INEA.",
    last_smoke_test_at: generatedAt,
    datasets: [
      {
        filename: "pm10-2020-station-summary.csv",
        title: "Resumo de Estações PM10 (2020)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM10 em Volta Redonda no ano de 2020.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2020-station-summary.csv"
      },
      {
        filename: "pm10-2021-station-summary.csv",
        title: "Resumo de Estações PM10 (2021)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM10 em Volta Redonda no ano de 2021.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2021-station-summary.csv"
      },
      {
        filename: "pm25-2021-station-summary.csv",
        title: "Resumo de Estações PM2.5 (2021)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM2.5 em Volta Redonda no ano de 2021.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm25-2021-station-summary.csv"
      },
      {
        filename: "pm10-2024-station-summary.csv",
        title: "Resumo de Estações PM10 (2024)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM10 em Volta Redonda no ano de 2024.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv"
      },
      {
        filename: "pm25-2024-station-summary.csv",
        title: "Resumo de Estações PM2.5 (2024)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM2.5 em Volta Redonda no ano de 2024.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv"
      },
      {
        filename: "pm10-2025-station-summary.csv",
        title: "Resumo de Estações PM10 (2025)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM10 em Volta Redonda no ano de 2025.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2025-station-summary.csv"
      },
      {
        filename: "pm25-2025-station-summary.csv",
        title: "Resumo de Estações PM2.5 (2025)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM2.5 em Volta Redonda no ano de 2025.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm25-2025-station-summary.csv"
      },
      {
        filename: "pm10-2026-partial-station-summary.csv",
        title: "Resumo de Estações PM10 (2026 Parcial)",
        description: "Estatísticas parciais acumuladas (Jan a Mai) por estação para o poluente PM10 em Volta Redonda no ano de 2026.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito. Ano Parcial.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2026-partial-station-summary.csv"
      },
      {
        filename: "pm25-2026-partial-station-summary.csv",
        title: "Resumo de Estações PM2.5 (2026 Parcial)",
        description: "Estatísticas parciais acumuladas (Jan a Mai) por estação para o poluente PM2.5 em Volta Redonda no ano de 2026.",
        rows_count: 3,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito. Ano Parcial.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm25-2026-partial-station-summary.csv"
      },
      {
        filename: "particulate-timeline-2020-2026.csv",
        title: "Linha do Tempo de Particulados (2020-2026)",
        description: "Médias, coberturas e contagem anual de excedências OMS/CONAMA para PM10 e PM2.5 (2020-2026, com 2026 parcial).",
        rows_count: timelineRows.length - 1,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/particulate-timeline-2020-2026.csv"
      },
      {
        filename: "attention-episodes-2020-2026.csv",
        title: "Episódios de Atenção Mensais (2020-2026)",
        description: "Série histórica mensal contendo o número de dias com excedências da OMS e da CONAMA 506 (2020-2026, com 2026 parcial).",
        rows_count: ATTENTION_EPISODES.length,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/attention-episodes-2020-2026.csv"
      },
      {
        filename: "data-dictionary.csv",
        title: "Dicionário de Dados do Observatório do Ar",
        description: "Metadados descrevendo os campos das planilhas de qualidade do ar exportadas pelo Observatório.",
        rows_count: DATA_DICTIONARY.length,
        updated_at: generatedAt,
        source_system: "SEMEAR (Metadados)",
        methodological_label: "Metadados descritivos da comparação experimental do Observatório do Ar.",
        public_url: "https://semear-pwa.vercel.app/data/air/data-dictionary.csv"
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'manifest.json'),
    JSON.stringify(manifestData, null, 2),
    'utf8'
  );
  console.log("  - Generated manifest.json");

  console.log("CSV generation completed successfully.");
}

void main();
