# Relatório de QA Metodológico Final do Coletor INEA

**Data de Conclusão:** 2026-05-26  
**Status do QA:** aprovado (100% pass)  
**Banco de Dados:** Supabase local (Postgres)  

---

## 1. Introdução e Contexto

Este relatório documenta a homologação metodológica e o controle de qualidade (QA) final executado no coletor de dados públicos de qualidade do ar do INEA para Volta Redonda-RJ (SEMEAR / VR Abandonada).
Os dados são ingeridos a partir da fonte oficial do portal de Dados Abertos do RJ contendo as medições em planilha Excel (`qualidade_ar.xlsx`).

---

## 2. Resumo das Regras de QA Validadas

Todas as seguintes diretrizes científicas e estruturais foram validadas e cobertas pelo script de asserções automatizadas `scripts/inea-methodology-assert.ts`:

1. **Unidades Físicas vs. Subíndices de Poluentes**:
   - Todas as colunas do tipo `"IQA ..."` representam subíndices de poluentes, que são adimensionais. O banco de dados foi saneado e garante que para estas medições `unit = null`.
2. **Unidade do Índice Geral (IQAr)**:
   - A coluna `"Índice IQAr"` representa o índice geral global da estação. O banco de dados foi saneado e garante que `unit = null` para esses registros.
3. **Mapeamento de `metric_type`**:
   - As colunas de subíndice `"IQA ..."` são inseridas com `metric_type = 'POLLUTANT_SUBINDEX'`.
   - O índice geral `"Índice IQAr"` é inserido com `metric_type = 'GENERAL_AQI'`.
   - Nenhuma medição é classificada como concentração física bruta (`POLLUTANT_CONCENTRATION = 0`) uma vez que o arquivo contém apenas valores processados de IQA.
4. **Mapeamento de Classificações e Status**:
   - A coluna `"Classificação"` do Excel é corretamente gravada na coluna `air_quality_classification` do banco (e.g., `BOA`, `MODERADA`, etc.), em vez de preencher com `"OK"`.
   - O campo `quality_flag` representa a consistência operacional da linha e é gravado como `"OK"` para todas as linhas válidas processadas.
5. **Auditoria de Falsos Positivos**:
   - A detecção de candidatos de concentração física bruta foi corrigida para usar expressão regular exata (`/^(MP10|MP2[.,]5|O3|SO2|NO2|CO)$/i`), evitando falsos positivos no termo `"CO"` que incorretamente associavam as colunas `"Controlador"` e `"Ocorrência"`.

---

## 3. Resultados da Execução das Asserções (QA Suite)

A execução do comando `npm run inea:qa:methodology` obteve aprovação total em todas as 9 asserções de QA:

```text
Starting INEA methodology QA assertion suite...
PASS: Found total of 15696 INEA measurements in database.
PASS: 0 records have null metric_type.
PASS: Found 0 records with metric_type = 'POLLUTANT_CONCENTRATION' for INEA.
PASS: All POLLUTANT_SUBINDEX records have unit = null.
PASS: All GENERAL_AQI records have unit = null.
PASS: All raw_columns starting with 'IQA ' are mapped to POLLUTANT_SUBINDEX.
PASS: All raw_columns matching 'Índice IQAr' are mapped to GENERAL_AQI.
PASS: No records have air_quality_classification = 'OK'.
PASS: Found valid air quality classifications in sample: BOA, MODERADA
PASS: All records have quality_flag = 'OK'.

------------------------------------------------
QA METHODOLOGY PASSED: All assertions completed successfully.
```

---

## 4. Estatísticas de Ingestão e Banco de Dados

* **Total de estações identificadas**: 4 estações
* **Total de linhas de Volta Redonda importadas**: 2.459 linhas temporais
* **Registros de medição normalizados salvos**: 15.696 registros
  * **Subíndices de Poluentes (`POLLUTANT_SUBINDEX`)**: 13.237 registros
  * **Índices Gerais (`GENERAL_AQI`)**: 2.459 registros
  * **Concentrações (`POLLUTANT_CONCENTRATION`)**: 0 registros
  * **Registros obsoletos sem tipo de métrica (`metric_type IS NULL`)**: 0 registros (removidos e limpos do banco de dados).

---

## 5. Conclusão e Próximos Passos

Os coletores e validadores metodológicos do INEA estão operando em plena conformidade científica e metodológica. Os dados de Volta Redonda-RJ estão integrados de forma precisa no Supabase local do PWA SEMEAR, prontos para consumo seguro pelas APIs de visualização pública.
