export type HistoricalMemoryStatus = "ready" | "technical" | "quarantine";

export interface HistoricalMemoryPollutant {
  pollutant: "PM10" | "PTS" | "O3";
  label: string;
  status: HistoricalMemoryStatus;
  statusLabel: string;
  publicReading: string;
  articleMean: number;
  previewMean: number;
  maxDailyMean: number;
  maxHourly: number;
  validDays: number;
  minCoverage: number;
  maxCoverage: number;
  decision: string;
}

export interface HistoricalMemoryStationYear {
  station: string;
  year: number;
  pm10: number | null;
  pts: number | null;
  o3: number | null;
}

export const historicalMemoryPollutants: HistoricalMemoryPollutant[] = [
  {
    pollutant: "PM10",
    label: "Particulas inalaveis",
    status: "ready",
    statusLabel: "Candidato a publicacao",
    publicReading:
      "A serie de PM10 do trienio 2013-2015 foi recuperada com alta coerencia frente ao artigo cientifico usado como validacao cruzada.",
    articleMean: 29.45,
    previewMean: 29.65,
    maxDailyMean: 144.73,
    maxHourly: 575.41,
    validDays: 3013,
    minCoverage: 87.09,
    maxCoverage: 95.23,
    decision: "Pode avancar para dataset historico auditado, mantendo aviso de comparacao experimental."
  },
  {
    pollutant: "PTS",
    label: "Particulas totais em suspensao",
    status: "technical",
    statusLabel: "Memoria tecnica",
    publicReading:
      "PTS aparece de forma consistente no periodo historico, mas deve ser tratado como poeira total e memoria tecnica, nao como IQAr.",
    articleMean: 43.28,
    previewMean: 44.05,
    maxDailyMean: 194.82,
    maxHourly: 837.31,
    validDays: 2773,
    minCoverage: 54.78,
    maxCoverage: 95.4,
    decision: "Pode sustentar memoria historica e auditoria tecnica, separado de alertas operacionais."
  },
  {
    pollutant: "O3",
    label: "Ozonio",
    status: "quarantine",
    statusLabel: "Em auditoria",
    publicReading:
      "O3 foi recuperado para 2013-2015, mas a metrica ainda diverge do artigo. A diferenca nao parece vir da regra de 18 horas.",
    articleMean: 41.34,
    previewMean: 35.25,
    maxDailyMean: 92.81,
    maxHourly: 197.56,
    validDays: 2966,
    minCoverage: 84.41,
    maxCoverage: 98.05,
    decision: "Manter fora de publicacao consolidada ate confirmar a janela estatistica usada pela literatura ou relatorio oficial."
  }
];

export const historicalMemoryStationYears: HistoricalMemoryStationYear[] = [
  { station: "Belmonte", year: 2013, pm10: 35.93, pts: 51.17, o3: 27.49 },
  { station: "Belmonte", year: 2014, pm10: 38.29, pts: 54.82, o3: 36.19 },
  { station: "Belmonte", year: 2015, pm10: 33.66, pts: 44.24, o3: 31.44 },
  { station: "Retiro", year: 2013, pm10: 24.84, pts: 37.32, o3: 35.49 },
  { station: "Retiro", year: 2014, pm10: 32.82, pts: 50.67, o3: 39.69 },
  { station: "Retiro", year: 2015, pm10: 28.86, pts: 39.68, o3: 34.91 },
  { station: "Santa Cecilia", year: 2013, pm10: 21.51, pts: 35.01, o3: 40.12 },
  { station: "Santa Cecilia", year: 2014, pm10: 26.12, pts: 45.21, o3: 36.13 },
  { station: "Santa Cecilia", year: 2015, pm10: 24.69, pts: 34.63, o3: 36.76 }
];

export const historicalMemoryReports = [
  {
    label: "Coleta preview 2013-2015",
    href: "/reports/estado-da-nacao-radar-inea-coleta-preview-2013-2015-comparacao-rbciamb.md"
  },
  {
    label: "Auditoria de metricas",
    href: "/reports/estado-da-nacao-radar-inea-auditoria-metricas-o3-pm10-pts-2013-2015.md"
  },
  {
    label: "Agregados CSV",
    href: "/reports/open-data-preview/inea-2013-2015-daily/aggregate-summary.csv"
  },
  {
    label: "Metricas CSV",
    href: "/reports/open-data-preview/inea-2013-2015-daily/metric-audit.csv"
  }
];
