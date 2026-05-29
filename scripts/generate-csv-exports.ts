import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { DATA_DICTIONARY } from '../src/data/air/data-dictionary.ts';
import { ATTENTION_EPISODES } from '../src/data/air/attention-episodes-2022-2024.ts';
import { pm102024StationSummary } from '../src/data/air/pm10-2024-station-summary.ts';

// Helper to escape CSV values
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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

  // 2. Attention Episodes CSV
  const episodesHeaders = [
    "year", "pollutant", "station_id", "station_name", "month", "valid_days",
    "who_exceedance_days", "conama_exceedance_days", "max_hourly_value",
    "max_hourly_at", "coverage_percent", "data_quality_tier", "validation_note"
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
      escapeCsv(ep.validation_note)
    ];
    episodesRows.push(row.join(","));
  }
  fs.writeFileSync(path.join(publicDir, 'attention-episodes-2022-2024.csv'), episodesRows.join("\n"), 'utf8');
  console.log("  - Generated attention-episodes-2022-2024.csv");

  // 3. PM10 2024 Station Summary CSV
  const pm10Headers = [
    "station_id", "station_name", "coverage_percent", "hourly_records",
    "annual_mean_available_hourly", "hourly_peak", "zero_values", "valid_days",
    "who_24h_exceedance_days", "conama506_24h_exceedance_days", "confidence_level",
    "source_system", "data_quality_tier", "validation_note"
  ];
  const pm10Rows = [pm10Headers.join(",")];
  for (const st of pm102024StationSummary) {
    const row = [
      escapeCsv(st.station_id),
      escapeCsv(st.station_name),
      escapeCsv(Number(st.coverage_percent).toFixed(2)),
      escapeCsv(st.hourly_records),
      escapeCsv(Number(st.annual_mean_available_hourly).toFixed(2)),
      escapeCsv(Number(st.hourly_peak).toFixed(2)),
      escapeCsv(st.zero_values),
      escapeCsv(st.valid_days),
      escapeCsv(st.who_24h_exceedance_days),
      escapeCsv(st.conama506_24h_exceedance_days),
      escapeCsv(st.confidence_level),
      escapeCsv(st.source_system),
      escapeCsv(st.data_quality_tier),
      escapeCsv(st.validation_note)
    ];
    pm10Rows.push(row.join(","));
  }
  fs.writeFileSync(path.join(publicDir, 'pm10-2024-station-summary.csv'), pm10Rows.join("\n"), 'utf8');
  console.log("  - Generated pm10-2024-station-summary.csv");

  // Load summary-2024.json for PM2.5 summary generation
  const summary2024 = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'inea_weblakes_normalized', 'summary-2024.json'), 'utf8')
  );

  // Compute PM2.5 2024 valid days sum from episodes
  const getPm25ValidDays2024 = (stationId: string): number => {
    return ATTENTION_EPISODES
      .filter(e => e.year === 2024 && e.pollutant === 'PM2.5' && e.station_id === stationId)
      .reduce((sum, curr) => sum + curr.valid_days, 0);
  };

  // 4. PM2.5 2024 Station Summary CSV
  const pm25Data = [
    { id: "69", name: "VR-Belmonte" },
    { id: "70", name: "VR-Retiro" },
    { id: "71", name: "VR-Santa Cecília" }
  ].map(st => {
    const rawData = summary2024[st.id]?.pollutants?.["20"];
    return {
      station_id: Number(st.id),
      station_name: st.name,
      coverage_percent: Number(rawData?.coveragePct ?? 0),
      hourly_records: Number(rawData?.totalHours ?? 0),
      annual_mean_available_hourly: Number(rawData?.mean ?? 0),
      hourly_peak: Number(rawData?.max ?? 0),
      zero_values: Number(rawData?.zeroHours ?? 0),
      valid_days: getPm25ValidDays2024(st.id),
      who_24h_exceedance_days: Number(rawData?.exceedances?.WHO_24H ?? 0),
      conama506_24h_exceedance_days: Number(rawData?.exceedances?.BR_24H_FINAL ?? 0),
      confidence_level: "MEDIUM",
      source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
      data_quality_tier: "RAW_PUBLIC_PLATFORM",
      validation_note: "Sem QA/QC oficial explícito; comparação experimental."
    };
  });

  const pm25Rows = [pm10Headers.join(",")];
  for (const st of pm25Data) {
    const row = [
      escapeCsv(st.station_id),
      escapeCsv(st.station_name),
      escapeCsv(Number(st.coverage_percent).toFixed(2)),
      escapeCsv(st.hourly_records),
      escapeCsv(Number(st.annual_mean_available_hourly).toFixed(2)),
      escapeCsv(Number(st.hourly_peak).toFixed(2)),
      escapeCsv(st.zero_values),
      escapeCsv(st.valid_days),
      escapeCsv(st.who_24h_exceedance_days),
      escapeCsv(st.conama506_24h_exceedance_days),
      escapeCsv(st.confidence_level),
      escapeCsv(st.source_system),
      escapeCsv(st.data_quality_tier),
      escapeCsv(st.validation_note)
    ];
    pm25Rows.push(row.join(","));
  }
  fs.writeFileSync(path.join(publicDir, 'pm25-2024-station-summary.csv'), pm25Rows.join("\n"), 'utf8');
  console.log("  - Generated pm25-2024-station-summary.csv");

  // 5. Particulate Timeline (2022-2024) CSV
  const timelineHeaders = [
    "year", "station_id", "station_name", "pollutant", "annual_mean",
    "max_hourly_peak", "coverage_percent", "exceedance_days_who", "exceedance_days_conama"
  ];
  const timelineRows = [timelineHeaders.join(",")];

  const years = ["2022", "2023", "2024"];
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
    const yearSummary = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'inea_weblakes_normalized', `summary-${yr}.json`), 'utf8')
    );
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
            escapeCsv(raw.exceedances?.BR_24H_FINAL ?? 0)
          ];
          timelineRows.push(row.join(","));
        }
      }
    }
  }
  fs.writeFileSync(path.join(publicDir, 'particulate-timeline-2022-2024.csv'), timelineRows.join("\n"), 'utf8');
  console.log("  - Generated particulate-timeline-2022-2024.csv");

  // 6. Generate manifest.json dynamically with dataset versioning
  let commitHash = 'unknown';
  try {
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn("Could not determine git commit hash:", e);
  }

  const generatedAt = new Date().toISOString();

  const manifestData = {
    version: "1.1.0",
    dataset_version: "1.1.0",
    status: "saudável",
    generated_at: generatedAt,
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    methodology_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
    commit_hash: commitHash,
    coverage_notes: "Série histórica abrangendo de 2022 a 2024 para Volta Redonda. Cobertura horária variável de acordo com a integridade do sinal público do INEA.",
    last_smoke_test_at: generatedAt,
    datasets: [
      {
        filename: "pm10-2024-station-summary.csv",
        title: "Resumo de Estações PM10 (2024)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM10 em Volta Redonda no ano de 2024.",
        rows_count: pm102024StationSummary.length,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv"
      },
      {
        filename: "pm25-2024-station-summary.csv",
        title: "Resumo de Estações PM2.5 (2024)",
        description: "Estatísticas anuais consolidadas por estação para o poluente PM2.5 em Volta Redonda no ano de 2024.",
        rows_count: pm25Data.length,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv"
      },
      {
        filename: "particulate-timeline-2022-2024.csv",
        title: "Linha do Tempo de Particulados (2022-2024)",
        description: "Médias, coberturas e contagem anual de excedências OMS/CONAMA para PM10 e PM2.5 (2022-2024).",
        rows_count: timelineRows.length - 1,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/particulate-timeline-2022-2024.csv"
      },
      {
        filename: "attention-episodes-2022-2024.csv",
        title: "Episódios de Atenção Mensais (2022-2024)",
        description: "Série histórica mensal contendo o número de dias com excedências da OMS e da CONAMA 506 (2022-2024).",
        rows_count: ATTENTION_EPISODES.length,
        updated_at: generatedAt,
        source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
        methodological_label: "Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.",
        public_url: "https://semear-pwa.vercel.app/data/air/attention-episodes-2022-2024.csv"
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
