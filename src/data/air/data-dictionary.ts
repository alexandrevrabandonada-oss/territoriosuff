export interface DataDictionaryEntry {
  field_name: string;
  label: string;
  description: string;
  unit: string;
  source: string;
  caveat: string;
}

export const DATA_DICTIONARY: DataDictionaryEntry[] = [
  {
    field_name: "station_id",
    label: "ID da Estação",
    description: "Identificador numérico ou textual exclusivo da estação de monitoramento automático na plataforma pública original.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Os IDs correspondem às estações VR-Belmonte (69), VR-Retiro (70) e VR-Santa Cecília (71)."
  },
  {
    field_name: "station_name",
    label: "Nome da Estação",
    description: "Nome de exibição público associado à estação de monitoramento.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Corresponde às estações oficiais instaladas no município de Volta Redonda-RJ."
  },
  {
    field_name: "year",
    label: "Ano de Referência",
    description: "Ano civil ao qual se referem as leituras e estatísticas agregadas.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "As análises plurianuais cobrem o período de 2022 a 2024."
  },
  {
    field_name: "pollutant",
    label: "Poluente",
    description: "Nome do poluente medido (PM10 ou PM2.5).",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "PM10 refere-se a partículas inaláveis; PM2.5 refere-se a partículas finas de maior penetração pulmonar."
  },
  {
    field_name: "month",
    label: "Mês",
    description: "Mês da série temporal no formato YYYY-MM para o qual os dados mensais foram compilados.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Utilizado nas matrizes de sazonalidade e análise mensal de episódios de atenção."
  },
  {
    field_name: "coverage_percent",
    label: "Cobertura de Dados (%)",
    description: "Percentual de registros horários válidos recebidos em relação ao total de horas teóricas do período (ex: 8760 horas por ano).",
    unit: "%",
    source: "SEMEAR (Computado)",
    caveat: "Uma cobertura acima de 90% é recomendada para consistência estatística anual; coberturas mensais abaixo de 30% são descartadas e exibidas como N/A."
  },
  {
    field_name: "hourly_records",
    label: "Total de Registros Horários",
    description: "Contagem absoluta das leituras horárias válidas presentes na base.",
    unit: "Registros",
    source: "SEMEAR (Computado)",
    caveat: "Não inclui períodos com falha de transmissão ou ausência de leituras físicas."
  },
  {
    field_name: "annual_mean_available_hourly",
    label: "Média Geral Calculada (µg/m³)",
    description: "Média aritmética simples calculada com base em todas as leituras horárias disponíveis no período.",
    unit: "µg/m³",
    source: "SEMEAR (Computado)",
    caveat: "A média geral utiliza apenas as horas válidas, sem preenchimento ou imputação de lacunas. Como comparação experimental, não representa dados oficialmente homologados."
  },
  {
    field_name: "hourly_peak",
    label: "Pico Máximo Horário (µg/m³)",
    description: "Maior leitura de concentração horária individual registrada para o poluente na estação durante o ano.",
    unit: "µg/m³",
    source: "INEA/WebLakes",
    caveat: "Representa eventos pontuais de atenção elevada e picos de concentração horários curtos."
  },
  {
    field_name: "max_hourly_value",
    label: "Pico Horário Mensal (µg/m³)",
    description: "Maior leitura de concentração horária individual registrada para o poluente na estação durante o mês específico.",
    unit: "µg/m³",
    source: "INEA/WebLakes",
    caveat: "Identifica a intensidade de picos horários pontuais de concentração em escala mensal."
  },
  {
    field_name: "max_hourly_at",
    label: "Data/Hora do Pico Horário",
    description: "Carimbo de data e hora exata em formato ISO (YYYY-MM-DDTHH:MM:SS) do pico de concentração horária.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Utiliza a marcação temporal original da base pública WebLakes."
  },
  {
    field_name: "zero_values",
    label: "Registros com Valor Zero",
    description: "Quantidade de registros horários contendo exatamente o valor 0.0.",
    unit: "Registros",
    source: "SEMEAR (Computado)",
    caveat: "Os zeros são preservados para fidelidade aos dados de origem, embora marcados tecnicamente como sob suspeição de calibragem (ZERO_VALUE_REVIEW)."
  },
  {
    field_name: "valid_days",
    label: "Total de Dias Válidos",
    description: "Número de dias no período que atenderam ao critério metodológico de ter pelo menos 18 horas de leituras válidas.",
    unit: "Dias",
    source: "SEMEAR (Computado)",
    caveat: "Dias com menos de 18 horas válidas são descartados da análise de médias diárias para evitar distorções."
  },
  {
    field_name: "who_24h_exceedance_days",
    label: "Dias acima da OMS (24h)",
    description: "Contagem de dias em que a média diária ultrapassou as recomendações de saúde da OMS 2021 (45 µg/m³ para PM10 e 15 µg/m³ para PM2.5).",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Trata-se de uma comparação experimental de referência de saúde, não de padrão legal obrigatório nacional."
  },
  {
    field_name: "conama506_24h_exceedance_days",
    label: "Dias acima da CONAMA 506 (24h)",
    description: "Contagem de dias em que a média diária de 24 horas excedeu os limites legais brasileiros regulamentados pela Resolução CONAMA 506/2024 (50 µg/m³ para PM10 e 25 µg/m³ para PM2.5).",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Esta comparação é experimental e de finalidade cívica, sem auditoria oficial por registro."
  },
  {
    field_name: "confidence_level",
    label: "Nível de Confiança Técnica",
    description: "Classificação qualitativa do conjunto de dados baseado estritamente na cobertura horária e consistência anual (HIGH, MEDIUM, LOW).",
    unit: "N/A",
    source: "SEMEAR (Avaliação)",
    caveat: "Representa a validade estatística do período; anos com cobertura abaixo de 75% recebem classificação LOW."
  },
  {
    field_name: "source_system",
    label: "Sistema de Origem",
    description: "Nome técnico da plataforma governamental ou espelho público de onde os microdados originais foram coletados.",
    unit: "N/A",
    source: "SEMEAR (Metadados)",
    caveat: "Série histórica extraída dos dados horários públicos exibidos pela plataforma INEA/WebLakes."
  },
  {
    field_name: "data_quality_tier",
    label: "Nível de Qualidade de Dados",
    description: "Camada metodológica em que a série está classificada dentro do repositório SEMEAR.",
    unit: "N/A",
    source: "SEMEAR (Classificação)",
    caveat: "As séries públicas do INEA estão na camada RAW_PUBLIC_PLATFORM, indicando dados horários brutos sem QA/QC oficial por registro."
  },
  {
    field_name: "validation_note",
    label: "Aviso de Validação",
    description: "Nota técnica ressaltando o escopo experimental e as restrições da análise.",
    unit: "N/A",
    source: "SEMEAR (Nota)",
    caveat: "Informa o usuário sobre a ausência de homologação e a necessidade de ler as ressalvas metodológicas."
  }
];
