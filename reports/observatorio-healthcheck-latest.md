# Relatório de Healthcheck do Observatório do Ar

Este relatório apresenta o status operacional automatizado das rotas públicas, APIs de backend e datasets abertos do Observatório do Ar em Volta Redonda.

---

## 1. Resumo do Diagnóstico

*   **Host Alvo:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
*   **Data e Hora Local:** 11/06/2026, 13:28:04 (Horário de Brasília)
*   **Data e Hora UTC:** `2026-06-11T16:28:04.115Z`
*   **Total de Testes:** 33
*   **Aprovados:** 33 ✅
*   **Falhas:** 0
*   **Status de Saúde Geral:** **PASS (SAUDÁVEL)** 🟢

---

## 2. Detalhamento dos Componentes

| Recurso | Tipo | URL Testada | Status HTTP | Tempo de Resp. | Status | Notas |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Portal - Radar INEA** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea) | 200 | 131 ms | ✅ PASS |  |
| **Portal - Metodologia** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia) | 200 | 32 ms | ✅ PASS |  |
| **Portal - Dados Gerais** | `page` | [Link](https://semear-pwa.vercel.app/dados) | 200 | 18 ms | ✅ PASS |  |
| **Dataset Manifest** | `manifest` | [Link](https://semear-pwa.vercel.app/data/air/manifest.json) | 200 | 67 ms | ✅ PASS | Manifest parsed. Version: 1.6.1, datasets: 21 |
| **API: Resumo Geral** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/summary) | 200 | 606 ms | ✅ PASS | API JSON parsed successfully |
| **API: Últimas Leituras** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/latest) | 200 | 597 ms | ✅ PASS | API JSON parsed successfully |
| **API: Classificação IQAr** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/classification-days) | 200 | 562 ms | ✅ PASS | API JSON parsed successfully |
| **API: Lacunas (Gaps)** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/analytics/data-gaps) | 200 | 536 ms | ✅ PASS | API JSON parsed successfully |
| **Social Dataset Manifest** | `manifest` | [Link](https://semear-pwa.vercel.app/data/social/manifest.json) | 200 | 27 ms | ✅ PASS | Manifest parsed. Version: 1.1.0, datasets: 3 |
| **CSV: Setores Censitários de Vulnerabilidade** | `csv` | [Link](https://semear-pwa.vercel.app/data/social/vr-vulnerabilidade-setores-2022.csv) | 200 | 24 ms | ✅ PASS | CSV content valid. Row count parsed: 30 (excluding headers) |
| **CSV: Equipamentos Sensíveis** | `csv` | [Link](https://semear-pwa.vercel.app/data/social/equipamentos-sensiveis-vr.csv) | 200 | 16 ms | ✅ PASS | CSV content valid. Row count parsed: 25 (excluding headers) |
| **CSV: Dicionário de Dados Sociais** | `csv` | [Link](https://semear-pwa.vercel.app/data/social/social-data-dictionary.csv) | 200 | 18 ms | ✅ PASS | CSV content valid. Row count parsed: 18 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2020)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2020-station-summary.csv) | 200 | 28 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2021)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2021-station-summary.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2021)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2021-station-summary.csv) | 200 | 13 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2022)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2022-station-summary.csv) | 200 | 22 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2023)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2023-station-summary.csv) | 200 | 18 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv) | 200 | 26 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv) | 200 | 17 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações SO2 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/so2-2024-station-summary.csv) | 200 | 80 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações CO (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/co-2024-station-summary.csv) | 200 | 21 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2025)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2025-station-summary.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2025)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2025-station-summary.csv) | 200 | 18 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2026 Parcial)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2026-partial-station-summary.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2026 Parcial)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2026-partial-station-summary.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Linha do Tempo de Particulados (2020-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/particulate-timeline-2020-2026.csv) | 200 | 56 ms | ✅ PASS | CSV content valid. Row count parsed: 39 (excluding headers) |
| **CSV: Dataset Meteorológico Horário Completo (2013-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/weather/weather-vr-2013-2026.csv) | 200 | 22 ms | ✅ PASS | CSV content valid. Row count parsed: 117576 (excluding headers) |
| **CSV: Dicionário de Dados Meteorológicos** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/weather/weather-dictionary.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 12 (excluding headers) |
| **CSV: Linha do Tempo de PM10 (2013-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-timeline-2013-2026.csv) | 200 | 13 ms | ✅ PASS | CSV content valid. Row count parsed: 42 (excluding headers) |
| **CSV: Linha do Tempo de SO2 (2013-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/so2-timeline-2013-2026.csv) | 200 | 15 ms | ✅ PASS | CSV content valid. Row count parsed: 22 (excluding headers) |
| **CSV: Linha do Tempo de CO (2013-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/co-timeline-2013-2026.csv) | 200 | 17 ms | ✅ PASS | CSV content valid. Row count parsed: 22 (excluding headers) |
| **CSV: Episódios de Atenção Mensais (2020-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/attention-episodes-2020-2026.csv) | 200 | 14 ms | ✅ PASS | CSV content valid. Row count parsed: 462 (excluding headers) |
| **CSV: Dicionário de Dados do Observatório do Ar** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/data-dictionary.csv) | 200 | 17 ms | ✅ PASS | CSV content valid. Row count parsed: 33 (excluding headers) |

---

## 3. Veredito Operacional

> [!TIP]
> **VEREDITO: SISTEMA 100% OPERACIONAL E SAUDÁVEL**
> Todos os serviços de API, páginas estáticas, manifesto e downloads físicos estão integrados e respondendo corretamente com status 200 e content-type válidos. O portal de transparência está plenamente funcional.
