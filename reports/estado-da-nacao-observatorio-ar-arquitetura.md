# Estado da Nação — Arquitetura de Dados do Observatório do Ar

Este relatório estabelece os três conjuntos de dados canônicos que compõem o ecossistema de informações de qualidade do ar de Volta Redonda no Portal SEMEAR.

---

## 1. As Três Camadas de Dados Canônicos

Para assegurar honestidade intelectual e rigor científico, os dados são categorizados em três camadas mutuamente exclusivas:

### Camada A: INEA_WEBLAKES_RAW_HOURLY
*   **Identificador de Qualidade (Tier):** \`RAW_PUBLIC_PLATFORM\`
*   **Descrição:** Dados brutos horários de concentrações físicas e direções de ventos extraídos de forma transparente e ética da plataforma de relatórios públicos do INEA (WebLakes).
*   **Campos Mínimos:**
    - \`source\`: "INEA"
    - \`source_system\`: "WEBLAKES_CONCENTRATION_WITH_WIND"
    - \`station_id\`: string (ex: "70")
    - \`station_name\`: string (ex: "VR - Retiro")
    - \`parameter_id\`: string (ex: "18")
    - \`pollutant\`: string (ex: "PM10")
    - \`datetime\`: string (ISO 8601, ex: "2024-07-01T00:00:00")
    - \`value\`: number | null (concentração física)
    - \`unit\`: string (ex: "µg/m³" ou "ppm")
    - \`wind_speed\`: number | null
    - \`wind_direction\`: number | null
    - \`validation_status\`: string (ex: "NO_EXPLICIT_QAQC_IN_TABLE", "ZERO_VALUE_REVIEW")
    - \`raw_json\`: object (payload original da célula JqGrid)

### Camada B: INEA_IQAR_PUBLIC_INDEX
*   **Identificador de Qualidade (Tier):** \`PUBLIC_INDEX\`
*   **Descrição:** Índices e subíndices de qualidade do ar dimensionais (IQAr) oficiais, ingeridos a partir de planilhas consolidadas do INEA/Dados Abertos RJ.
*   **Campos Mínimos:**
    - \`station_name\`: string
    - \`measured_at\`: string (data)
    - \`metric_type\`: "GENERAL_AQI" | "POLLUTANT_SUBINDEX"
    - \`air_quality_index\`: number
    - \`air_quality_classification\`: string (ex: "BOA", "MODERADA")
    - \`controlling_pollutant\`: string
    - \`pollutant_subindex\`: object (subíndices por poluente)

### Camada C: INEA_HISTORICAL_AGGREGATED_EVIDENCE
*   **Identificador de Qualidade (Tier):** \`HISTORICAL_AGGREGATE\`
*   **Descrição:** Evidências de concentrações físicas agregadas (médias anuais, picos, dias excedidos) obtidas de artigos científicos, dissertações e relatórios técnicos pretéritos.
*   **Campos Mínimos:**
    - \`source_id\`: string (identificador único da fonte)
    - \`source_title\`: string
    - \`source_type\`: "SCIENTIFIC_ARTICLE" | "INEA_REPORT" | "IEMA_REPORT"
    - \`source_url\`: string (DOI ou link institucional)
    - \`station_name\`: string
    - \`pollutant\`: string
    - \`metric\`: string (ex: "DAILY_MEAN_SUMMARY", "DAILY_MAX")
    - \`year\`: number | null
    - \`period_start\`: string
    - \`period_end\`: string
    - \`value\`: number
    - \`unit\`: string
    - \`confidence\`: "HIGH" | "MEDIUM" | "LOW"
    - \`notes\`: string

---

## 2. Padrões de Rótulos Cidadãos na UI

Toda visualização (tabelas, mapas, gráficos) deve exibir claramente os metadados de procedência com um dos seguintes rótulos:
1.  **"Dado bruto horário público"** (para a Camada A)
2.  **"Índice oficial"** (para a Camada B)
3.  **"Dado agregado de relatório"** (para a Camada C)
4.  **"Sem QA/QC explícito"** (aviso para a Camada A)
5.  **"Comparação experimental"** (aviso para excedências da OMS/CONAMA calculadas sobre dados não oficiais homologados)
