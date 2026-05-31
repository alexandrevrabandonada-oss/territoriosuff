export interface DataDictionaryEntry {
  field_name: string;
  label: string;
  description: string;
  unit: string;
  source: string;
  caveat: string;
  files?: string;       // quais arquivos CSV contêm este campo
  status?: 'published' | 'reserved'; // published = está nos CSVs; reserved = documentado mas não exportado ainda
}

export const DATA_DICTIONARY: DataDictionaryEntry[] = [
  // ─── Campos de identificação ───────────────────────────────────────────────
  {
    field_name: "station_id",
    label: "ID da Estação",
    description: "Identificador numérico exclusivo da estação de monitoramento automático na plataforma pública original.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Os IDs correspondem às estações VR-Belmonte (69), VR-Retiro (70) e VR-Santa Cecília (71).",
    files: "todos",
    status: "published"
  },
  {
    field_name: "station_name",
    label: "Nome da Estação",
    description: "Nome de exibição público associado à estação de monitoramento.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Corresponde às estações oficiais instaladas no município de Volta Redonda-RJ.",
    files: "todos",
    status: "published"
  },
  {
    field_name: "year",
    label: "Ano de Referência",
    description: "Ano civil ao qual se referem as leituras e estatísticas agregadas. O ano de 2026 é parcial.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "As análises plurianuais cobrem o período de 2020 a 2026 (com 2026 parcial).",
    files: "timelines, station-summaries",
    status: "published"
  },
  {
    field_name: "pollutant",
    label: "Poluente",
    description: "Nome do poluente medido. Valores possíveis: PM10, PM2.5, SO2, CO, NO2, O3, PTS.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "PM10 = partículas inaláveis; PM2.5 = partículas finas; SO2 = dióxido de enxofre; CO = monóxido de carbono (em ppm nativo). NO2, O3 e PTS bloqueados/quarentenados.",
    files: "timelines",
    status: "published"
  },
  {
    field_name: "month",
    label: "Mês",
    description: "Mês da série temporal no formato YYYY-MM para o qual os dados mensais foram compilados.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Utilizado nas matrizes de sazonalidade e análise mensal de episódios de atenção.",
    files: "attention-episodes-2020-2026.csv",
    status: "published"
  },

  // ─── Campos de cobertura ───────────────────────────────────────────────────
  {
    field_name: "coverage_percent",
    label: "Cobertura de Dados (%)",
    description: "Percentual de registros horários válidos recebidos em relação ao total de horas teóricas do período (ex: 8760h/ano).",
    unit: "%",
    source: "SEMEAR (Computado)",
    caveat: "Cobertura acima de 75% é o limiar mínimo para inclusão. Acima de 90% é recomendada para consistência estatística anual.",
    files: "todos",
    status: "published"
  },
  {
    field_name: "coverage_status",
    label: "Status de Cobertura",
    description: "Classificação binária da cobertura temporal do período. SUFFICIENT = cobertura ≥ 75%; INSUFFICIENT_ANNUAL_COVERAGE = cobertura < 75%.",
    unit: "N/A",
    source: "SEMEAR (Computado)",
    caveat: "Combinações estação × ano com status INSUFFICIENT_ANNUAL_COVERAGE devem ser interpretadas com ressalva explícita. Não é recomendável extrapolar estatísticas anuais a partir desses recortes.",
    files: "timelines, station-summaries",
    status: "published"
  },

  // ─── Campos de registros ───────────────────────────────────────────────────
  {
    field_name: "hourly_records",
    label: "Total de Registros Horários",
    description: "Contagem absoluta das leituras horárias válidas presentes na base.",
    unit: "Registros",
    source: "SEMEAR (Computado)",
    caveat: "Não inclui períodos com falha de transmissão ou ausência de leituras físicas.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "annual_mean_available_hourly",
    label: "Média Geral Calculada (µg/m³ ou ppm)",
    description: "Média aritmética simples calculada com base em todas as leituras horárias disponíveis no período. Usado nos CSVs de resumo por estação.",
    unit: "µg/m³ (PM10, PM2.5, SO2) ou ppm (CO)",
    source: "SEMEAR (Computado)",
    caveat: "Utiliza apenas as horas válidas, sem imputação de lacunas. Como comparação experimental, não representa dados oficialmente homologados. CO é exibido em ppm (unidade nativa da plataforma INEA/WebLakes).",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "annual_mean",
    label: "Média Anual (µg/m³ ou ppm)",
    description: "Média aritmética anual calculada. Nome usado nos arquivos de timeline plurianuais (equivalente a annual_mean_available_hourly nos station-summaries).",
    unit: "µg/m³ (PM10, PM2.5, SO2) ou ppm (CO)",
    source: "SEMEAR (Computado)",
    caveat: "Veja annual_mean_available_hourly. O CO é exibido em ppm (unidade nativa).",
    files: "timelines",
    status: "published"
  },
  {
    field_name: "hourly_peak",
    label: "Pico Máximo Horário (µg/m³ ou ppm)",
    description: "Maior leitura de concentração horária individual registrada para o poluente na estação durante o ano. Nome usado nos station-summaries.",
    unit: "µg/m³ (PM10, PM2.5, SO2) ou ppm (CO)",
    source: "INEA/WebLakes",
    caveat: "Representa eventos pontuais de atenção elevada. Picos horários não implicam automaticamente excedência de limites baseados em médias diárias.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "max_hourly_peak",
    label: "Pico Horário Máximo Anual (µg/m³ ou ppm)",
    description: "Maior leitura de concentração horária individual registrada no ano. Nome usado nos arquivos de timeline plurianuais (equivalente a hourly_peak nos station-summaries).",
    unit: "µg/m³ (PM10, PM2.5, SO2) ou ppm (CO)",
    source: "INEA/WebLakes",
    caveat: "Veja hourly_peak.",
    files: "timelines",
    status: "published"
  },
  {
    field_name: "max_hourly_value",
    label: "Pico Horário Mensal (µg/m³ ou ppm)",
    description: "Maior leitura de concentração horária individual registrada durante o mês específico.",
    unit: "µg/m³ ou ppm",
    source: "INEA/WebLakes",
    caveat: "Identifica a intensidade de picos horários pontuais de concentração em escala mensal.",
    files: "attention-episodes-2020-2026.csv",
    status: "published"
  },
  {
    field_name: "max_hourly_at",
    label: "Data/Hora do Pico Horário",
    description: "Carimbo de data e hora exata em formato ISO (YYYY-MM-DDTHH:MM:SS) do pico de concentração horária.",
    unit: "N/A",
    source: "INEA/WebLakes",
    caveat: "Utiliza a marcação temporal original da base pública WebLakes.",
    files: "attention-episodes-2020-2026.csv",
    status: "published"
  },
  {
    field_name: "zero_values",
    label: "Registros com Valor Zero",
    description: "Quantidade de registros horários contendo exatamente o valor 0.0.",
    unit: "Registros",
    source: "SEMEAR (Computado)",
    caveat: "Os zeros são preservados para fidelidade aos dados de origem, embora marcados tecnicamente como sob suspeição de calibragem (ZERO_VALUE_REVIEW).",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "valid_days",
    label: "Total de Dias Válidos",
    description: "Número de dias no período que atenderam ao critério metodológico de ter pelo menos 18 horas de leituras válidas.",
    unit: "Dias",
    source: "SEMEAR (Computado)",
    caveat: "Dias com menos de 18 horas válidas são descartados da análise de médias diárias para evitar distorções estatísticas.",
    files: "station-summaries",
    status: "published"
  },

  // ─── Campos de excedências ─────────────────────────────────────────────────
  {
    field_name: "who_24h_exceedance_days",
    label: "Dias acima da OMS (24h) — station-summaries",
    description: "Contagem de dias em que a média diária ultrapassou as recomendações de saúde da OMS 2021 (45 µg/m³ para PM10; 15 µg/m³ para PM2.5; 40 µg/m³ para SO2; 4 mg/m³ para CO).",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Comparação experimental de referência de saúde. Não é padrão legal obrigatório nacional. CO é convertido de ppm para mg/m³ usando fator 1,145 antes da comparação.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "exceedance_days_who",
    label: "Dias acima da OMS (24h) — timelines",
    description: "Mesmo indicador de who_24h_exceedance_days, com o nome usado nos arquivos de timeline plurianuais.",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Veja who_24h_exceedance_days.",
    files: "timelines",
    status: "published"
  },
  {
    field_name: "conama506_24h_exceedance_days",
    label: "Dias acima da CONAMA 506 (24h) — station-summaries",
    description: "Contagem de dias em que a média diária de 24h excedeu os limites legais brasileiros da CONAMA 506/2024 (120 µg/m³ PI-1 para PM10; 60 µg/m³ PI-1 para PM2.5; 125 µg/m³ PI-1 para SO2; 9 ppm em 8h para CO).",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Comparação experimental de finalidade cívica. A régua aplicada é o Padrão Intermediário PI-1 (menos restritivo), não o Padrão Final da CONAMA 506/2024.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "exceedance_days_conama",
    label: "Dias acima da CONAMA (24h) — timelines",
    description: "Mesmo indicador de conama506_24h_exceedance_days, com o nome usado nos arquivos de timeline plurianuais.",
    unit: "Dias",
    source: "SEMEAR (Comparação)",
    caveat: "Veja conama506_24h_exceedance_days.",
    files: "timelines",
    status: "published"
  },

  // ─── Campos de qualidade e metadados ──────────────────────────────────────
  {
    field_name: "confidence_level",
    label: "Nível de Confiança Técnica",
    description: "Classificação qualitativa do conjunto de dados baseado na cobertura horária e consistência anual (HIGH ≥ 90%; MEDIUM ≥ 75%; LOW < 75%).",
    unit: "N/A",
    source: "SEMEAR (Avaliação)",
    caveat: "Representa a validade estatística do período. Anos com cobertura abaixo de 75% recebem classificação LOW.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "source_system",
    label: "Sistema de Origem",
    description: "Nome técnico da plataforma governamental de onde os microdados originais foram coletados.",
    unit: "N/A",
    source: "SEMEAR (Metadados)",
    caveat: "Série histórica extraída dos dados horários públicos exibidos pela plataforma INEA/WebLakes.",
    files: "todos",
    status: "published"
  },
  {
    field_name: "data_quality_tier",
    label: "Nível de Qualidade de Dados",
    description: "Camada metodológica em que a série está classificada (RAW_PUBLIC_PLATFORM = dados brutos sem QA/QC oficial por registro).",
    unit: "N/A",
    source: "SEMEAR (Classificação)",
    caveat: "As séries públicas do INEA estão na camada RAW_PUBLIC_PLATFORM.",
    files: "station-summaries",
    status: "published"
  },
  {
    field_name: "validation_note",
    label: "Aviso de Validação",
    description: "Nota técnica ressaltando o escopo experimental e as restrições da análise.",
    unit: "N/A",
    source: "SEMEAR (Nota)",
    caveat: "Informa o usuário sobre a ausência de homologação e a necessidade de ler as ressalvas metodológicas.",
    files: "station-summaries",
    status: "published"
  },

  // ─── Campos reservados — documentados mas ainda não exportados nos CSVs ───
  {
    field_name: "native_unit",
    label: "Unidade Nativa do Sensor",
    description: "Unidade na qual o poluente é originalmente medido e transmitido pela plataforma INEA/WebLakes (ex: ppm para CO, µg/m³ para PM10).",
    unit: "N/A",
    source: "SEMEAR (Metadados)",
    caveat: "Campo reservado para exportação futura. O CO é medido em ppm na plataforma nativa; a conversão para mg/m³ é aplicada exclusivamente para comparação com a OMS.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "who_conversion_factor",
    label: "Fator de Conversão para Comparação OMS",
    description: "Fator numérico aplicado para converter a unidade nativa para a unidade usada pela OMS (ex: 1.145 para CO: ppm → mg/m³).",
    unit: "N/A",
    source: "SEMEAR (Metodológico)",
    caveat: "Campo reservado. Aplicável apenas quando a unidade nativa difere da usada pelo limiar OMS.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "conama_averaging",
    label: "Período de Média da CONAMA",
    description: "Período de média usado para comparação com o limite CONAMA (ex: DAY = média de 24h; MOVING_8H = média móvel de 8h; HOUR = pico horário).",
    unit: "N/A",
    source: "SEMEAR (Metodológico)",
    caveat: "Campo reservado. Documentar o período de média é essencial para distinguir comparações de pico horário (NO2) de médias diárias (PM10/PM2.5/SO2) e médias móveis (CO/O3).",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "moving_8h_max",
    label: "Máxima Média Móvel de 8h",
    description: "Maior valor de média móvel de 8 horas consecutivas registrado no período. Relevante para CO (CONAMA 506) e O3 (OMS e CONAMA).",
    unit: "ppm (CO) ou µg/m³ (O3)",
    source: "SEMEAR (Computado)",
    caveat: "Campo reservado para exportação futura. Mínimo de 6 horas válidas por janela de 8h para calcular a média.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "partial_year",
    label: "Ano Parcial",
    description: "Indica se o registro corresponde a um ano com dados incompletos (true = parcial; false = ano completo).",
    unit: "Booleano",
    source: "SEMEAR (Metadados)",
    caveat: "Campo reservado. O ano de 2026 é sempre marcado como parcial.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "threshold_regime",
    label: "Regime de Comparação",
    description: "Identifica o conjunto de diretrizes usado para a comparação (WHO_2021, CONAMA_506_FINAL, CONAMA_506_PI1, HISTORICAL_CONAMA_03).",
    unit: "N/A",
    source: "SEMEAR (Metodológico)",
    caveat: "Campo reservado. Fundamental para distinguir entre padrão final (mais restritivo) e padrão intermediário (PI-1, menos restritivo) nas comparações CONAMA.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "threshold_period",
    label: "Período de Média do Threshold",
    description: "Período de média associado ao threshold aplicado (ex: 24h, 8h móvel, 1h, Anual).",
    unit: "N/A",
    source: "SEMEAR (Metodológico)",
    caveat: "Campo reservado.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "threshold_source",
    label: "Fonte Legal do Threshold",
    description: "Resolução ou publicação de origem do threshold de qualidade do ar aplicado.",
    unit: "N/A",
    source: "SEMEAR (Metodológico)",
    caveat: "Campo reservado. Exemplos: 'OMS 2021', 'CONAMA 506/2024', 'CONAMA 03/1990'.",
    files: "reservado",
    status: "reserved"
  },
  {
    field_name: "status",
    label: "Status de Publicação do Parâmetro",
    description: "Status atual do parâmetro no Observatório (PUBLISHED, BLOCKED_AUDIT, QUARANTINE, UNAVAILABLE).",
    unit: "N/A",
    source: "SEMEAR (Governança)",
    caveat: "Campo reservado para exportação futura. Distingue parâmetros publicáveis de parâmetros bloqueados por anomalias instrumentais.",
    files: "reservado",
    status: "reserved"
  }
];
