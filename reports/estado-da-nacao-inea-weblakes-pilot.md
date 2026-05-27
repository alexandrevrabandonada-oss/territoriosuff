# Estado da Nação — Coletor Piloto WebLakes/INEAPublico

**Período do Piloto:** Julho de 2024 (01/07/2024 a 01/08/2024)  
**Estação:** VR - Retiro (ID: 70)  
**Poluente:** PM10 (ID: 18)  
**Métrica:** Concentração física horária em µg/m³  
**Data do Relatório:** 2026-05-27T23:09:17.916Z  
**Status do Piloto:** Concluído com sucesso  

---

## 1. Estatísticas de Coleta e Auditoria Técnica

- **Chamadas de API realizadas ao servidor:** 31 *(Nota: Chamadas evitadas por cache local não são contabilizadas)*
- **Registros horários físicos baixados:** 719 de 744 previstos (96.6% de cobertura)
- **Registros horários ausentes (lacunas temporais):** 25 horas
- **Valores medidos iguais a zero:** 2 registro(s)
- **Concentração Mínima Registrada:** 0.00 µg/m³
- **Concentração Média do Período:** 35.09 µg/m³
- **Concentração Máxima Registrada (Pico):** 177.71 µg/m³ (Ocorrido em: 2024-07-24T11:00:00)

---

## 2. Comparativo Experimental com a OMS (24h)

> [!WARNING]
> **EXPERIMENTAL_OMS_COMPARISON**  
> Os cálculos abaixo são puramente experimentais e baseiam-se em dados horários extraídos da rede pública provisória sem flags oficiais de validação de qualidade (QA/QC). Não devem ser apresentados como conclusões definitivas ou científicas de saúde pública antes de expansão e validação.

### Metodologia do Cálculo
*   **Limite de referência diária da OMS para PM10:** 45 µg/m³
*   **Regra de validade diária:** A média diária só é calculada se houver pelo menos **18 leituras horárias válidas** no dia (75% de cobertura). Dias com menos de 18 leituras são classificados como tendo cobertura de dados insuficiente.

### Resultados
- **Dias no mês com média diária calculável:** 29 de 31 dias
- **Dias com violação experimental da referência da OMS (média > 45 µg/m³):** 4 dia(s)

### Tabela de Médias Diárias

| Data | Média Diária PM10 | Cobertura Horária | Ultrapassou Limite OMS (45 µg/m³)? |
| :--- | :--- | :--- | :--- |
| 2024-07-01 | 14.53 µg/m³ | 24/24h | Não |
| 2024-07-02 | 22.86 µg/m³ | 24/24h | Não |
| 2024-07-03 | 29.30 µg/m³ | 24/24h | Não |
| 2024-07-04 | 32.88 µg/m³ | 24/24h | Não |
| 2024-07-05 | 38.98 µg/m³ | 24/24h | Não |
| 2024-07-06 | 39.68 µg/m³ | 24/24h | Não |
| 2024-07-07 | 30.04 µg/m³ | 24/24h | Não |
| 2024-07-08 | 32.09 µg/m³ | 24/24h | Não |
| 2024-07-09 | 24.28 µg/m³ | 24/24h | Não |
| 2024-07-10 | 28.99 µg/m³ | 24/24h | Não |
| 2024-07-11 | 44.90 µg/m³ | 24/24h | Não |
| 2024-07-12 | 28.56 µg/m³ | 24/24h | Não |
| 2024-07-13 | 14.41 µg/m³ | 24/24h | Não |
| 2024-07-14 | 17.34 µg/m³ | 24/24h | Não |
| 2024-07-15 | 31.01 µg/m³ | 24/24h | Não |
| 2024-07-16 | 27.90 µg/m³ | 24/24h | Não |
| 2024-07-17 | 37.00 µg/m³ | 24/24h | Não |
| 2024-07-18 | 39.63 µg/m³ | 23/24h | Não |
| 2024-07-19 | 38.05 µg/m³ | 24/24h | Não |
| 2024-07-20 | 42.71 µg/m³ | 24/24h | Não |
| 2024-07-21 | 43.09 µg/m³ | 24/24h | Não |
| 2024-07-22 | 36.79 µg/m³ | 24/24h | Não |
| 2024-07-23 | 55.74 µg/m³ | 24/24h | **SIM (Ultrapassou)** |
| 2024-07-24 | 54.06 µg/m³ | 24/24h | **SIM (Ultrapassou)** |
| 2024-07-25 | 38.83 µg/m³ | 24/24h | Não |
| 2024-07-26 | 45.25 µg/m³ | 24/24h | **SIM (Ultrapassou)** |
| 2024-07-27 | 58.15 µg/m³ | 24/24h | **SIM (Ultrapassou)** |
| 2024-07-28 | 43.50 µg/m³ | 24/24h | Não |
| 2024-07-29 | Dado Insuficiente (<18h) | 13/24h | N/A |
| 2024-07-30 | Dado Insuficiente (<18h) | 11/24h | N/A |
| 2024-07-31 | 27.06 µg/m³ | 24/24h | Não |

---

## 3. Limitações Técnicas e Ausência de QA/QC

1.  **Sem Flags de Validação Explicitados:** O endpoint tabular de concentrações horárias da plataforma WebLakes do INEA (`/ConcentrationWithWindArrows/GridData`) não fornece flags de qualidade do ar por registro (ex: "OK", "Suspeito", "Inválido"). Toda leitura presente foi tratada como válida.
2.  **Origem dos Dados:** Os dados horários coletados representam as informações exibidas em tempo corrido pela plataforma pública integrada e não substituem relatórios oficiais consolidados.
3.  **Lacunas de Comunicação:** Há períodos de ausência absoluta de dados nas tabelas (por exemplo, horas onde a linha de registro simplesmente não é emitida). No total, restaram 25 horas não cobertas em julho de 2024.

---

## 4. Conclusão da Validação de Sucesso

A geração do arquivo CSV piloto [inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv](file:///C:/Projetos/SEMEAR%20PWA/reports/inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv) foi concluída em conformidade com as regras éticas do Projeto SEMEAR, utilizando cache local obrigatório e backoff de atraso entre chamadas. Este piloto comprova a viabilidade técnica de coletar concentrações físicas horárias e realizar avaliações comparativas, estabelecendo uma base metodológica estruturada.
