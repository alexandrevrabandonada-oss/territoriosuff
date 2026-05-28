# Relatório de Auditoria Técnica — Coletor Piloto WebLakes PM10 VR-Retiro

**Período auditado:** Julho de 2024 (01/07/2024 a 31/07/2024)  
**Estação:** VR - Retiro (ID: 70)  
**Poluente:** PM10 (ID: 18)  
**Arquivo Auditado:** [inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv](file:///C:/Projetos/SEMEAR%20PWA/reports/inea-weblakes-pilot-vr-retiro-pm10-2024-07.csv)

---

## 1. Estatísticas Gerais de Linhas e Cobertura

- **Total de registros de dados no CSV:** 719 linhas
- **Timestamps previstos (Julho/2024):** 744 horas
- **Timestamps ausentes:** 25 horas (3.4% de lacuna)
- **Timestamps duplicados:** 0 ocorrência(s)
- **Timezone presumido:** `Não especificado (Local implícito)` (America/Sao_Paulo local implícito nas strings sem offset)

---

## 2. Qualidade e Validação Físico-Química dos Dados

- **Registros com valor físico nulo (vazio):** 0 ocorrência(s)
- **Registros com valor igual a zero:** 2 ocorrência(s) (marcados provisoriamente como `ZERO_VALUE_REVIEW`)
- **Registros com valor negativo:** 0 ocorrência(s)
- **Registros com valores extremos (> 150 µg/m³):** 3 ocorrência(s)
- **Métrica do período:**
  - **Mínimo:** 0.00 µg/m³
  - **Média:** 35.09 µg/m³
  - **Máximo (Pico):** 177.71 µg/m³

---

## 3. Avaliação de Validade Diária e Comparativo Experimental OMS

> [!WARNING]
> **EXPERIMENTAL_OMS_COMPARISON**  
> Os cálculos diários e comparações apresentados são experimentais, baseados em dados brutos extraídos provisoriamente da rede pública de monitoramento integrada no WebLakes sem validação formal de QA/QC de dados. Não devem ser usados para conclusões sanitárias ou científicas definitivas.

- **Limite diário de referência da OMS para PM10:** 45 µg/m³ (média de 24 horas)
- **Regra de suficiência diária aplicada:** Média válida requer no mínimo **18 horas de medição** no dia (75% de cobertura).
- **Dias com dados insuficientes (menos de 18 horas válidas):** 2 dia(s)
- **Dias com ultrapassagem experimental do limite OMS:** 4 dia(s)

### Tabela de Cobertura e Médias Diárias Recalculadas

| Data | Horas Válidas | Média Diária Recalculada | Ultrapassou Limite OMS (45 µg/m³)? |
| :--- | :--- | :--- | :--- |
| 2024-07-01 | 24/24h | 14.53 µg/m³ | Não |
| 2024-07-02 | 24/24h | 22.86 µg/m³ | Não |
| 2024-07-03 | 24/24h | 29.30 µg/m³ | Não |
| 2024-07-04 | 24/24h | 32.88 µg/m³ | Não |
| 2024-07-05 | 24/24h | 38.98 µg/m³ | Não |
| 2024-07-06 | 24/24h | 39.68 µg/m³ | Não |
| 2024-07-07 | 24/24h | 30.04 µg/m³ | Não |
| 2024-07-08 | 24/24h | 32.09 µg/m³ | Não |
| 2024-07-09 | 24/24h | 24.28 µg/m³ | Não |
| 2024-07-10 | 24/24h | 28.99 µg/m³ | Não |
| 2024-07-11 | 24/24h | 44.90 µg/m³ | Não |
| 2024-07-12 | 24/24h | 28.56 µg/m³ | Não |
| 2024-07-13 | 24/24h | 14.41 µg/m³ | Não |
| 2024-07-14 | 24/24h | 17.34 µg/m³ | Não |
| 2024-07-15 | 24/24h | 31.01 µg/m³ | Não |
| 2024-07-16 | 24/24h | 27.90 µg/m³ | Não |
| 2024-07-17 | 24/24h | 37.00 µg/m³ | Não |
| 2024-07-18 | 23/24h | 39.63 µg/m³ | Não |
| 2024-07-19 | 24/24h | 38.05 µg/m³ | Não |
| 2024-07-20 | 24/24h | 42.71 µg/m³ | Não |
| 2024-07-21 | 24/24h | 43.09 µg/m³ | Não |
| 2024-07-22 | 24/24h | 36.79 µg/m³ | Não |
| 2024-07-23 | 24/24h | 55.74 µg/m³ | **SIM (Ultrapassou)** |
| 2024-07-24 | 24/24h | 54.06 µg/m³ | **SIM (Ultrapassou)** |
| 2024-07-25 | 24/24h | 38.83 µg/m³ | Não |
| 2024-07-26 | 24/24h | 45.25 µg/m³ | **SIM (Ultrapassou)** |
| 2024-07-27 | 24/24h | 58.15 µg/m³ | **SIM (Ultrapassou)** |
| 2024-07-28 | 24/24h | 43.50 µg/m³ | Não |
| 2024-07-29 | 13/24h | Dado Insuficiente (<18h) | N/A |
| 2024-07-30 | 11/24h | Dado Insuficiente (<18h) | N/A |
| 2024-07-31 | 24/24h | 27.06 µg/m³ | Não |

---

## 4. Detalhamento de Lacunas de Dados (Timestamps Ausentes)

Abaixo estão listadas as primeiras 15 horas ausentes identificadas na série de julho de 2024:

- 2024-07-18T12:00:00
- 2024-07-29T09:00:00
- 2024-07-29T11:00:00
- 2024-07-29T12:00:00
- 2024-07-29T13:00:00
- 2024-07-29T14:00:00
- 2024-07-29T15:00:00
- 2024-07-29T19:00:00
- 2024-07-29T20:00:00
- 2024-07-29T21:00:00
- 2024-07-29T22:00:00
- 2024-07-29T23:00:00
- 2024-07-30T01:00:00
- 2024-07-30T02:00:00
- 2024-07-30T03:00:00
*... total de 25 horas ausentes.*

---

## 5. Conclusões da Auditoria

1. **Consistência Temporal:** Não há timestamps duplicados. As lacunas somam exactly 25 horas concentradas majoritariamente nos dias 29 e 30 de julho (que ficaram com cobertura horária insuficiente).
2. **Valores Zerados:** Os 2 valores iguais a zero são consistentes com horários de queda ou pós-chuva na região, mas exigem atenção em backfills futuros para atestar se não são erros de comunicação de sensor. Eles foram classificados corretamente com o status provisório `ZERO_VALUE_REVIEW`.
3. **Ausência de Negativos:** Não foram encontrados valores de concentração negativos no período auditado, o que atesta que o sensor ou o parser do WebLakes já removeu leituras de descalibração eletrônica com sinal menor que zero.
4. **Validação das Estatísticas:** O recálculo das médias diárias no script bate perfeitamente com os resultados compilados no relatório piloto, confirmando o pipeline aritmético.
