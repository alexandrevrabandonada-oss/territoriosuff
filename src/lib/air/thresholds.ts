export interface Threshold {
  pollutant: string;
  regime: 'WHO' | 'BR';
  averaging_period: 'HOUR' | 'DAY' | 'YEAR' | 'MOVING_8H';
  threshold_value: number;
  unit: string;
  label: string;
  legal_status: string;
  source_url: string;
  notes: string;
}

export const THRESHOLDS: Threshold[] = [
  // --- WHO 2021 Guidelines ---
  {
    pollutant: "PM10",
    regime: "WHO",
    averaging_period: "DAY",
    threshold_value: 45,
    unit: "µg/m³",
    label: "Diretriz de 24h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Valor diário médio para proteção da saúde humana contra particulados grossos."
  },
  {
    pollutant: "PM10",
    regime: "WHO",
    averaging_period: "YEAR",
    threshold_value: 15,
    unit: "µg/m³",
    label: "Diretriz Anual da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Limite de exposição crônica anual sugerido pela OMS."
  },
  {
    pollutant: "PM2.5",
    regime: "WHO",
    averaging_period: "DAY",
    threshold_value: 15,
    unit: "µg/m³",
    label: "Diretriz de 24h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Limite diário recomendado para particulados finos respiráveis."
  },
  {
    pollutant: "PM2.5",
    regime: "WHO",
    averaging_period: "YEAR",
    threshold_value: 5,
    unit: "µg/m³",
    label: "Diretriz Anual da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Exposição crônica máxima recomendada para PM2.5."
  },
  {
    pollutant: "SO2",
    regime: "WHO",
    averaging_period: "DAY",
    threshold_value: 40,
    unit: "µg/m³",
    label: "Diretriz de 24h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Limite diário para Dióxido de Enxofre."
  },
  {
    pollutant: "NO2",
    regime: "WHO",
    averaging_period: "DAY",
    threshold_value: 25,
    unit: "µg/m³",
    label: "Diretriz de 24h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Limite diário para Dióxido de Nitrogênio."
  },
  {
    pollutant: "NO2",
    regime: "WHO",
    averaging_period: "YEAR",
    threshold_value: 10,
    unit: "µg/m³",
    label: "Diretriz Anual da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Limite anual sugerido para NO2."
  },
  {
    pollutant: "O3",
    regime: "WHO",
    averaging_period: "MOVING_8H",
    threshold_value: 100,
    unit: "µg/m³",
    label: "Diretriz de 8h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Média móvel de 8h diária máxima para Ozônio."
  },
  {
    pollutant: "CO",
    regime: "WHO",
    averaging_period: "DAY",
    threshold_value: 4,
    unit: "mg/m³", // equivalent to ~3.49 ppm (fator 1.145 a 25°C, 1 atm)
    label: "Diretriz de 24h da OMS (2021)",
    legal_status: "Recomendação Internacional de Saúde",
    source_url: "https://www.who.int/publications/i/item/9789240034228",
    notes: "Monóxido de Carbono (4 mg/m³ equivale a ~3.49 ppm usando fator de conversão 1.145 a 25°C e 1 atm)."
  },

  // --- Brasil / CONAMA 506/2024 (vigente) — substitui CONAMA 491/2018 ---
  // Os valores numéricos finais são idênticos à 491/2018, mas a referência legal correta é a 506/2024.
  // URL oficial: https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024
  // A CONAMA 491/2018 é mantida como referência histórica/legado nos dados de 2018-2023.
  // PM10
  {
    pollutant: "PM10",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 50,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (24h)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão de qualidade final definido na Resolução CONAMA 506/2024, que revogou e substituiu a 491/2018. Valor numérico idêntico ao padrão final da 491/2018."
  },
  {
    pollutant: "PM10",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 120,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (24h)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Primeiro padrão intermediário de transição (menos restritivo). Referência CONAMA 506/2024."
  },
  {
    pollutant: "PM10",
    regime: "BR",
    averaging_period: "YEAR",
    threshold_value: 20,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (Anual)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão anual final definitivo. CONAMA 506/2024."
  },
  {
    pollutant: "PM10",
    regime: "BR",
    averaging_period: "YEAR",
    threshold_value: 40,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (Anual)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Primeiro limite anual intermediário. CONAMA 506/2024."
  },
  // PM2.5
  {
    pollutant: "PM2.5",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 25,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (24h)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão de qualidade final definido na Resolução CONAMA 506/2024, que revogou e substituiu a 491/2018. Valor numérico idêntico ao padrão final da 491/2018."
  },
  {
    pollutant: "PM2.5",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 60,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (24h)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Primeiro padrão intermediário de transição (menos restritivo) para PM2.5. Referência CONAMA 506/2024."
  },
  {
    pollutant: "PM2.5",
    regime: "BR",
    averaging_period: "YEAR",
    threshold_value: 10,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (Anual)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão anual final definitivo para PM2.5. Referência CONAMA 506/2024."
  },
  {
    pollutant: "PM2.5",
    regime: "BR",
    averaging_period: "YEAR",
    threshold_value: 20,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (Anual)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Primeiro limite anual intermediário para PM2.5. Referência CONAMA 506/2024."
  },
  // SO2
  {
    pollutant: "SO2",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 20,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (24h)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão de 24h definitivo para SO2. Resolução CONAMA 506/2024."
  },
  {
    pollutant: "SO2",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 125,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (24h)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "PI-1 diário para SO2. Resolução CONAMA 506/2024."
  },
  // NO2
  {
    pollutant: "NO2",
    regime: "BR",
    averaging_period: "HOUR",
    threshold_value: 200,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (1h)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Padrão horário definitivo para NO2. Resolução CONAMA 506/2024."
  },
  {
    pollutant: "NO2",
    regime: "BR",
    averaging_period: "HOUR",
    threshold_value: 260,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (1h)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "PI-1 de 1 hora para NO2. Resolução CONAMA 506/2024."
  },
  // O3
  {
    pollutant: "O3",
    regime: "BR",
    averaging_period: "MOVING_8H",
    threshold_value: 100,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Final (8h)",
    legal_status: "Padrão de Qualidade do Ar Nacional — Vigente",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "Limite de média móvel de 8h diária máxima definitivo para Ozônio. Resolução CONAMA 506/2024."
  },
  {
    pollutant: "O3",
    regime: "BR",
    averaging_period: "MOVING_8H",
    threshold_value: 140,
    unit: "µg/m³",
    label: "CONAMA 506/2024 Padrão Intermediário PI-1 (8h)",
    legal_status: "Padrão Vigente Transitório",
    source_url: "https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024",
    notes: "PI-1 de 8h para Ozônio. Resolução CONAMA 506/2024."
  },
  // CO
  {
    pollutant: "CO",
    regime: "BR",
    averaging_period: "MOVING_8H",
    threshold_value: 9,
    unit: "ppm",
    label: "CONAMA Padrão Final (8h)",
    legal_status: "Padrão de Qualidade do Ar Nacional",
    source_url: "https://www.in.gov.br/materia/-/asset_publisher/KujY0DBegcZ3/content/id/51528654",
    notes: "Limite de 8h diária máxima de Monóxido de Carbono (9 ppm)."
  },
  // PTS
  {
    pollutant: "PTS",
    regime: "BR",
    averaging_period: "DAY",
    threshold_value: 240,
    unit: "µg/m³",
    label: "Histórico CONAMA 03/1990 (24h)",
    legal_status: "Padrão Histórico — Revogado pela CONAMA 491/2018",
    source_url: "https://www.ibama.gov.br/sophia/cnia/legislacao/MMA/RE0003-300690.PDF",
    notes: "Partículas Totais em Suspensão (limite diário histórico estabelecido pela CONAMA 03/1990, revogado pela 491/2018 e substituído por PM10/PM2.5). Utilizado apenas para fins de referência histórica de engenharia."
  },
  {
    pollutant: "PTS",
    regime: "BR",
    averaging_period: "YEAR",
    threshold_value: 80,
    unit: "µg/m³",
    label: "Histórico CONAMA 03/1990 (Anual)",
    legal_status: "Padrão Histórico — Revogado pela CONAMA 491/2018",
    source_url: "https://www.ibama.gov.br/sophia/cnia/legislacao/MMA/RE0003-300690.PDF",
    notes: "Partículas Totais em Suspensão (limite anual histórico estabelecido pela CONAMA 03/1990). Utilizado apenas para fins de referência histórica de engenharia."
  }
];
