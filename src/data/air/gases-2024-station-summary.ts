export interface GasStationSummary {
  station_id: number;
  station_name: string;
  pollutant: 'SO2' | 'CO';
  unit: string;
  coverage_percent: number;
  hourly_records: number;
  period_mean: number;
  hourly_peak: number;
  valid_days: number;
  who_exceedance_days: number;
  conama_exceedance_events: number;
  methodology_note: string;
  status: 'PUBLICÁVEL COM CAUTELA';
  native_unit?: string;
  who_conversion_factor?: number;
  conama_averaging?: string;
  moving_8h_max?: number;
}

export const gases2024StationSummary: GasStationSummary[] = [
  {
    station_id: 69,
    station_name: 'VR - Belmonte',
    pollutant: 'SO2',
    unit: 'µg/m³',
    coverage_percent: 89.33,
    hourly_records: 7847,
    period_mean: 4.059,
    hourly_peak: 14.179,
    valid_days: 321,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média diária calculada com base em pelo menos 18h válidas. Concentração estável, cobertura adequada.',
    status: 'PUBLICÁVEL COM CAUTELA'
  },
  {
    station_id: 70,
    station_name: 'VR - Retiro',
    pollutant: 'SO2',
    unit: 'µg/m³',
    coverage_percent: 99.61,
    hourly_records: 8750,
    period_mean: 4.672,
    hourly_peak: 7.754,
    valid_days: 366,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média diária calculada com base em pelo menos 18h válidas. Excelente cobertura anual, sem excedências.',
    status: 'PUBLICÁVEL COM CAUTELA'
  },
  {
    station_id: 71,
    station_name: 'VR - Santa Cecília',
    pollutant: 'SO2',
    unit: 'µg/m³',
    coverage_percent: 80.16,
    hourly_records: 7041,
    period_mean: 5.868,
    hourly_peak: 12.452,
    valid_days: 290,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média diária calculada com base em pelo menos 18h válidas. Cobertura acima de 75% e sem excedências.',
    status: 'PUBLICÁVEL COM CAUTELA'
  },
  {
    station_id: 69,
    station_name: 'VR - Belmonte',
    pollutant: 'CO',
    unit: 'ppm',
    coverage_percent: 96.17,
    hourly_records: 8448,
    period_mean: 0.375,
    hourly_peak: 8.434,
    valid_days: 346,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média móvel de 8h deslizantes (mínimo de 6h válidas por janela) em ppm para CONAMA e média diária convertida para mg/m³ (fator 1.145) para OMS.',
    status: 'PUBLICÁVEL COM CAUTELA',
    native_unit: 'ppm',
    who_conversion_factor: 1.145,
    conama_averaging: 'moving_8h',
    moving_8h_max: 1.645
  },
  {
    station_id: 70,
    station_name: 'VR - Retiro',
    pollutant: 'CO',
    unit: 'ppm',
    coverage_percent: 99.57,
    hourly_records: 8746,
    period_mean: 1.007,
    hourly_peak: 1.927,
    valid_days: 366,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média móvel de 8h deslizantes (mínimo de 6h válidas por janela) em ppm para CONAMA e média diária convertida para mg/m³ (fator 1.145) para OMS.',
    status: 'PUBLICÁVEL COM CAUTELA',
    native_unit: 'ppm',
    who_conversion_factor: 1.145,
    conama_averaging: 'moving_8h',
    moving_8h_max: 1.420
  },
  {
    station_id: 71,
    station_name: 'VR - Santa Cecília',
    pollutant: 'CO',
    unit: 'ppm',
    coverage_percent: 99.16,
    hourly_records: 8710,
    period_mean: 0.362,
    hourly_peak: 10.561,
    valid_days: 361,
    who_exceedance_days: 0,
    conama_exceedance_events: 0,
    methodology_note: 'Média móvel de 8h deslizantes (mínimo de 6h válidas por janela) em ppm para CONAMA e média diária convertida para mg/m³ (fator 1.145) para OMS.',
    status: 'PUBLICÁVEL COM CAUTELA',
    native_unit: 'ppm',
    who_conversion_factor: 1.145,
    conama_averaging: 'moving_8h',
    moving_8h_max: 2.467
  }
];
