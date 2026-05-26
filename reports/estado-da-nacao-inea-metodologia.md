# Estado da Nação — INEA Validation Methodology Report

**Data do Backfill:** 2026-05-26T17:34:14.985Z
**Banco de Dados:** `https://ojedgswernwbzrcfomqq.supabase.co`

## Resumo Executivo
Este relatório valida e detalha a classificação metodológica dos dados de qualidade do ar importados do INEA, distinguindo corretamente índices gerais e subíndices de poluentes de concentrações físicas.

## Contagem de Registros Ingeridos por Tipo de Métrica
- **Subíndices de Poluentes (`POLLUTANT_SUBINDEX`):** 13237 registros (unidade: `null` / adimensional)
- **Índice Geral de Qualidade do Ar (`GENERAL_AQI`):** 2459 registros (unidade: `null` / adimensional)
- **Concentrações de Poluentes (`POLLUTANT_CONCENTRATION`):** 0 registros
- **Total Ingerido:** **15696** registros no banco de dados.

## Auditoria de Unidades
- O sistema removeu com sucesso a atribuição de unidades como `µg/m³` ou `ppm` para os registros cujo valor é derivado de colunas de IQA (que são índices adimensionais de 0 a 500).
- Todos os registros contendo o subíndice do poluente possuem a classificação de qualidade vinculada a metadados, e o índice consolidado geral (`GENERAL_AQI`) aponta o poluente controlador e a classificação global da estação.

## Conclusão
A validação metodológica foi concluída com sucesso. Os dados no Supabase agora refletem a física real da coleta pública do INEA sem erros científicos de unidades de medida.
