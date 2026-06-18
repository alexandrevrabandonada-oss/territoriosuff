export const AIR_PUBLIC_DATA_BASE_PATH = "/data/air";

export type AirPublicDownload = {
  title: string;
  file: string;
  format: ".CSV" | ".JSON";
  desc: string;
};

export type AirPublicFile = {
  file: string;
  desc: string;
  format: "CSV" | "JSON";
  updated: string;
};

export type AirPublicManifestDataset = {
  filename: string;
  title: string;
  description: string;
  rows_count: number;
  updated_at: string;
  source_system: string;
  methodological_label: string;
  public_url: string;
};

export type AirPublicManifest = {
  version?: string;
  dataset_version?: string;
  status?: string;
  generated_at?: string;
  source_system?: string;
  methodology_label?: string;
  commit_hash?: string;
  coverage_notes?: string;
  last_smoke_test_at?: string;
  datasets?: AirPublicManifestDataset[];
};

export const AIR_PUBLIC_DOWNLOADS: AirPublicDownload[] = [
  {
    title: "Manifesto completo",
    file: "manifest.json",
    format: ".JSON",
    desc: "Lista versionada de todos os arquivos públicos, datas, origem e rótulos metodológicos."
  },
  {
    title: "Changelog do Radar",
    file: "radar-revision-history-2026-06.json",
    format: ".JSON",
    desc: "Histórico público versionado das revisões metodológicas, ciclos e mudanças estruturais do Radar INEA."
  },
  {
    title: "Metadados do release",
    file: "radar-release-metadata.json",
    format: ".JSON",
    desc: "Metadados públicos do ciclo atual do Radar INEA, incluindo versão de dataset, metodologia e estado operacional do release."
  },
  {
    title: "PM10 2013-2026",
    file: "pm10-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Linha do tempo plurianual de PM10 por estação, cobertura e excedências experimentais."
  },
  {
    title: "SO₂ 2013-2026",
    file: "so2-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Série histórica consolidada de dióxido de enxofre em Volta Redonda."
  },
  {
    title: "CO 2013-2026",
    file: "co-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Série histórica consolidada de monóxido de carbono, mantendo a unidade nativa em ppm."
  },
  {
    title: "Episódios 2020-2026",
    file: "attention-episodes-2020-2026.csv",
    format: ".CSV",
    desc: "Base de episódios de atenção para leitura pedagógica de excedências e sazonalidade."
  }
];

export const AIR_PUBLIC_FILES: AirPublicFile[] = [
  {
    file: "manifest.json",
    desc: "Manifesto público versionado com lista de arquivos, datas, origem e rótulos metodológicos.",
    format: "JSON",
    updated: "Junho de 2026"
  },
  {
    file: "radar-revision-history-2026-06.json",
    desc: "Changelog público das revisões metodológicas, ciclos e entregas estruturais do Radar INEA.",
    format: "JSON",
    updated: "Junho de 2026"
  },
  {
    file: "radar-release-metadata.json",
    desc: "Metadados públicos do ciclo atual do Radar INEA, com versão do dataset, metodologia e referência do release.",
    format: "JSON",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-timeline-2013-2026.csv",
    desc: "Série histórica estendida e consolidada de PM10 de 2013 a 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "so2-timeline-2013-2026.csv",
    desc: "Série histórica estendida e consolidada de SO₂ de 2013 a 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "co-timeline-2013-2026.csv",
    desc: "Série histórica estendida e consolidada de CO de 2013 a 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-2020-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2020.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-2021-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2021.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2021-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2021.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2022-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2022.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2023-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2023.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-2024-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2024.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2024-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2024.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "so2-2024-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o SO₂ experimental em 2024.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "co-2024-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o CO experimental em 2024.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-2025-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2025.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2025-station-summary.csv",
    desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2025.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm10-2026-partial-station-summary.csv",
    desc: "Estatísticas parciais acumuladas de janeiro a maio por estação para o PM10 em 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "pm25-2026-partial-station-summary.csv",
    desc: "Estatísticas parciais acumuladas de janeiro a maio por estação para o PM2.5 em 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "particulate-timeline-2020-2026.csv",
    desc: "Linha do tempo plurianual de médias, coberturas e excedências anuais de particulados de 2020 a 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "weather/weather-vr-2013-2026.csv",
    desc: "Dataset meteorológico horário completo para Volta Redonda, incluindo vento real e variáveis auxiliares experimentais.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "weather/weather-dictionary.csv",
    desc: "Metadados dos campos meteorológicos exportados pelo Observatório.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "attention-episodes-2020-2026.csv",
    desc: "Série mensal de excedências OMS/CONAMA e picos horários de concentração de 2020 a 2026.",
    format: "CSV",
    updated: "Junho de 2026"
  },
  {
    file: "data-dictionary.csv",
    desc: "Metadados descrevendo os campos das planilhas exportadas.",
    format: "CSV",
    updated: "Junho de 2026"
  }
];

export function getAirPublicDataPath(file: string) {
  return `${AIR_PUBLIC_DATA_BASE_PATH}/${file}`;
}
