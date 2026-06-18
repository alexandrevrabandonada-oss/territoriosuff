export interface StationSummary {
  id: string;
  name: string;
  code: string;
  lat: number | null;
  lng: number | null;
  active: boolean;
  city?: string | null;
  neighborhood?: string | null;
}

export interface RadarMeasurement {
  metric_type: string;
  value?: number | null;
  unit?: string | null;
  pollutant?: string | null;
  air_quality_classification?: string | null;
  pollutant_name?: string | null;
  controlling_pollutant?: string | null;
  measured_at?: string | null;
}

export interface LatestResult {
  station: StationSummary;
  measured_at: string | null;
  measurements: RadarMeasurement[];
}

export interface RadarChartPoint {
  ts: string;
  value: number;
}

export interface RadarTimeseriesPoint {
  measured_at: string;
  air_quality_index: number;
  controlling_pollutant?: string | null;
}

export interface RadarTimeseriesResponse {
  items: RadarTimeseriesPoint[];
  total: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
  truncated: boolean;
}

export interface MonthlyProfileItem {
  month: number | string;
  month_name: string;
  degraded_days: number;
  measured_days: number;
  degraded_percent_of_measured_days: number;
}

export interface ControllerFrequencyItem {
  pollutant: string;
  count: number;
  percentage: number;
}

export interface DataGapItem {
  station_id: string;
  station_name: string;
  measured_days: number;
  expected_days: number;
  insufficient_data_days: number;
  coverage_percent: number;
  gap_count: number;
  max_gap_hours: number;
  expected_start_date?: string | null;
  expected_end_date?: string | null;
  window_is_inferred?: boolean;
  operation_window_source?: string | null;
}

export interface SummaryStats {
  totalStations: number;
  timeRange: { minDate: string; maxDate: string };
  totalMeasurements: number;
  moderateOrWorseDaysCount: number;
  mostFrequentControllingPollutant: string;
  source_system?: string;
  data_freshness_label?: string;
  latest_measured_at?: string | null;
  latest_ingested_at?: string | null;
  is_realtime?: boolean;
}

export interface StationMetadataItem {
  station_id: string;
  station_name: string;
  station_code: string;
  city: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  active: boolean;
  operation_window: {
    start_date: string | null;
    end_date: string | null;
    source: string | null;
    is_inferred: boolean;
  };
  provenance: {
    station_source_table: string;
    measurement_source_filter: string;
    methodology_version: string;
    notes: string[];
  };
}

export interface StationMetadataResponse {
  dataset: string;
  description: string;
  filters: {
    stationId: string;
  };
  items: StationMetadataItem[];
  total: number;
  version: string;
}

export interface BreakdownItem {
  BOA: number;
  MODERADA: number;
  RUIM: number;
  "MUITO RUIM": number;
  "PÉSSIMA": number;
  moderateOrWorseDays: number;
  totalDays: number;
}

export type RadarMode =
  | "OVERVIEW"
  | "MAP"
  | "TIME"
  | "TERRITORY"
  | "STATIONS"
  | "METHODOLOGY";

export type RadarComparisonTab = "TREND" | "EXCEEDANCE" | "COVERAGE";

export const RADAR_MODES: Array<{ id: RadarMode; label: string; icon: string }> = [
  { id: "OVERVIEW", label: "Visão Geral", icon: "📊" },
  { id: "MAP", label: "Mapa", icon: "🗺️" },
  { id: "TIME", label: "Tempo", icon: "⏱️" },
  { id: "TERRITORY", label: "Território", icon: "👥" },
  { id: "STATIONS", label: "Estações", icon: "📡" },
  { id: "METHODOLOGY", label: "Metodologia e Dados", icon: "📚" }
];

export const RADAR_TIME_TABS: Array<{ id: RadarComparisonTab; label: string; icon: string }> = [
  { id: "TREND", label: "Tendências Anuais", icon: "📈" },
  { id: "EXCEEDANCE", label: "Excedências & Sazonalidade", icon: "⚠️" },
  { id: "COVERAGE", label: "Cobertura & Silêncio", icon: "🔇" }
];

export const LAI_TEMPLATE = `Prezados,

Com amparo na Lei Federal de Acesso à Informação (Lei nº 12.527/2011) e na Lei Estadual do Rio de Janeiro nº 9.176/2021 (que rege as obrigações de transparência ativa), solicito o fornecimento, em formato aberto, estruturado e legível por máquina (como CSV, XLSX ou equivalente), da série histórica de dados de monitoramento de qualidade do ar obtidos pelas estações automáticas oficiais localizadas no município de Volta Redonda/RJ.

Especificamente, requerem-se as informações conforme as seguintes especificações:

1. Estações Monitoradas:
   - VR-Retiro (localização aproximada: Av. Jaraguá, nº 800, bairro Retiro - Lat: -22.502349, Long: -44.122810);
   - VR-Belmonte (localização aproximada: Bairro Belmonte - Lat: -22.517677, Long: -44.132540);
   - VR-Santa Cecília (localização aproximada: Av. Vinte e Um, Vila Santa Cecília - Lat: -22.522530, Long: -44.106564).

2. Período dos Dados:
   - De 01 de janeiro de 2010 (ou desde a data de instalação/início de operação de cada estação, caso posterior) até 31 de dezembro de 2021.

3. Variáveis e Parâmetros Requeridos:
   - Registros com resolução temporal de médias horárias e médias diárias contendo:
     - Concentrações físicas dos poluentes monitorados em suas respectivas unidades físicas de medida (µg/m³ ou ppm), incluindo Material Particulado (MP10 e MP2.5), Dióxido de Enxofre (SO2), Dióxido de Nitrogênio (NO2), Ozônio (O3) e Monóxido de Carbono (CO);
     - Subíndices de qualidade do ar calculados para cada poluente e o Índice de Qualidade do Ar consolidado (IQAr) diário;
     - Sinalizações de validação técnica do registro (flags de qualidade) e identificação de dados ausentes ou inválidos por falha técnica.

Solicito também os microdados que deram origem aos relatórios RQAr, ao diagnóstico de rede e aos estudos acadêmicos que utilizaram dados das estações de Volta Redonda.

Solicito que os dados sejam enviados por meio de arquivos digitais anexos ou disponibilização de link de download direto, conforme preconiza o art. 8º, § 3º, inciso II da Lei nº 12.527/2011, evitando o envio de arquivos digitalizados em formato de imagem ou documentos PDF que impeçam o tratamento computacional dos dados.

Agradeço a atenção e aguardo o retorno no prazo legal.`;

export function getIneaClassificationStyle(classification: string | null | undefined) {
  const cls = (classification || "").toUpperCase().trim();
  switch (cls) {
    case "BOA":
      return "border-emerald-500/20 bg-emerald-50 text-emerald-800";
    case "MODERADA":
      return "border-amber-500/20 bg-amber-50 text-amber-900";
    case "RUIM":
      return "border-orange-500/20 bg-orange-50 text-orange-950";
    case "MUITO RUIM":
      return "border-red-500/20 bg-red-50 text-red-900";
    case "PÉSSIMA":
      return "border-purple-500/20 bg-purple-50 text-purple-900";
    default:
      return "border-slate-300 bg-slate-50 text-slate-700";
  }
}
