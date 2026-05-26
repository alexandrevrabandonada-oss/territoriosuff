# Auditoria de Esquema do Excel do INEA

**Data da Auditoria:** 2026-05-26T17:33:56.111Z
**Caminho do Arquivo:** `C:\Projetos\SEMEAR PWA\.cache\inea\qualidade_ar.xlsx`

## Abas Encontradas
- `Planilha1`

## Estrutura de Colunas por Aba

### Aba: `Planilha1` (Total de 15 colunas)
```json
[
  "Data",
  "Estação",
  "IQA MP10",
  "IQA MP2,5",
  "IQA SO2",
  "IQA NO2",
  "IQA O3",
  "IQA CO",
  "Índice IQAr",
  "Classificação",
  "Controlador",
  "Ocorrência",
  "Cidade",
  "Latitude",
  "Longitude"
]
```

## Conclusão Metodológica
- **Presença de concentrações brutas:** Não (todas as colunas de poluentes contêm o prefixo 'IQA', indicando que são subíndices de qualidade do ar e não medições físicas brutas).
- **Decisão de Design:** Confirmado: O XLSX contém apenas índices adimensionais de qualidade do ar. Todos os registros gerados a partir dessas colunas de poluentes serão salvos com 'metric_type = POLLUTANT_SUBINDEX' e 'unit = null' (adimensional), e os registros da coluna 'Índice IQAr' serão salvos como 'metric_type = GENERAL_AQI'.
