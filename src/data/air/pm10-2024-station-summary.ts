export interface PM10StationSummary {
  station_id: number;
  station_name: string;
  coverage_percent: number;
  hourly_records: number;
  annual_mean_available_hourly: number;
  hourly_peak: number;
  zero_values: number;
  valid_days: number;
  who_24h_exceedance_days: number;
  conama506_24h_exceedance_days: number;
  confidence_level: "MEDIUM" | "HIGH" | "LOW";
  source_system: string;
  data_quality_tier: string;
  validation_note: string;
}

export const pm102024StationSummary: PM10StationSummary[] = [
  {
    station_id: 69,
    station_name: "VR-Belmonte",
    coverage_percent: 93.53,
    hourly_records: 8216,
    annual_mean_available_hourly: 30.97,
    hourly_peak: 367.52,
    zero_values: 45,
    valid_days: 341,
    who_24h_exceedance_days: 48,
    conama506_24h_exceedance_days: 28,
    confidence_level: "MEDIUM",
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    data_quality_tier: "RAW_PUBLIC_PLATFORM",
    validation_note: "Sem QA/QC oficial explícito; comparação experimental."
  },
  {
    station_id: 70,
    station_name: "VR-Retiro",
    coverage_percent: 96.74,
    hourly_records: 8498,
    annual_mean_available_hourly: 29.70,
    hourly_peak: 300.76,
    zero_values: 53,
    valid_days: 366,
    who_24h_exceedance_days: 46,
    conama506_24h_exceedance_days: 32,
    confidence_level: "MEDIUM",
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    data_quality_tier: "RAW_PUBLIC_PLATFORM",
    validation_note: "Sem QA/QC oficial explícito; comparação experimental."
  },
  {
    station_id: 71,
    station_name: "VR-Santa Cecília",
    coverage_percent: 96.90,
    hourly_records: 8512,
    annual_mean_available_hourly: 18.01,
    hourly_peak: 212.70,
    zero_values: 255,
    valid_days: 358,
    who_24h_exceedance_days: 5,
    conama506_24h_exceedance_days: 2,
    confidence_level: "MEDIUM",
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    data_quality_tier: "RAW_PUBLIC_PLATFORM",
    validation_note: "Sem QA/QC oficial explícito; comparação experimental."
  }
];
