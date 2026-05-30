# Relatório de Healthcheck do Observatório do Ar

Este relatório apresenta o status operacional automatizado das rotas públicas, APIs de backend e datasets abertos do Observatório do Ar em Volta Redonda.

---

## 1. Resumo do Diagnóstico

*   **Host Alvo:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
*   **Data e Hora Local:** 30/05/2026, 00:08:49 (Horário de Brasília)
*   **Data e Hora UTC:** `2026-05-30T03:08:49.456Z`
*   **Total de Testes:** 17
*   **Aprovados:** 17 ✅
*   **Falhas:** 0
*   **Status de Saúde Geral:** **PASS (SAUDÁVEL)** 🟢

---

## 2. Detalhamento dos Componentes

| Recurso | Tipo | URL Testada | Status HTTP | Tempo de Resp. | Status | Notas |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Portal - Radar INEA** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea) | 200 | 431 ms | ✅ PASS |  |
| **Portal - Metodologia** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia) | 200 | 14 ms | ✅ PASS |  |
| **Portal - Dados Gerais** | `page` | [Link](https://semear-pwa.vercel.app/dados) | 200 | 53 ms | ✅ PASS |  |
| **Dataset Manifest** | `manifest` | [Link](https://semear-pwa.vercel.app/data/air/manifest.json) | 200 | 164 ms | ✅ PASS | Manifest parsed. Version: 1.2.0, datasets: 9 |
| **API: Resumo Geral** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/summary) | 200 | 1744 ms | ✅ PASS | API JSON parsed successfully |
| **API: Últimas Leituras** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/latest) | 200 | 959 ms | ✅ PASS | API JSON parsed successfully |
| **API: Classificação IQAr** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/classification-days) | 200 | 452 ms | ✅ PASS | API JSON parsed successfully |
| **API: Lacunas (Gaps)** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/analytics/data-gaps) | 200 | 781 ms | ✅ PASS | API JSON parsed successfully |
| **CSV: Resumo de Estações PM10 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv) | 200 | 178 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv) | 200 | 204 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2025)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2025-station-summary.csv) | 200 | 167 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2025)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2025-station-summary.csv) | 200 | 215 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2026 Parcial)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2026-partial-station-summary.csv) | 200 | 181 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2026 Parcial)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2026-partial-station-summary.csv) | 200 | 354 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Linha do Tempo de Particulados (2022-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/particulate-timeline-2022-2026.csv) | 200 | 184 ms | ✅ PASS | CSV content valid. Row count parsed: 30 (excluding headers) |
| **CSV: Episódios de Atenção Mensais (2022-2026)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/attention-episodes-2022-2026.csv) | 200 | 226 ms | ✅ PASS | CSV content valid. Row count parsed: 318 (excluding headers) |
| **CSV: Dicionário de Dados do Observatório do Ar** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/data-dictionary.csv) | 200 | 163 ms | ✅ PASS | CSV content valid. Row count parsed: 19 (excluding headers) |

---

## 3. Veredito Operacional

> [!TIP]
> **VEREDITO: SISTEMA 100% OPERACIONAL E SAUDÁVEL**
> Todos os serviços de API, páginas estáticas, manifesto e downloads físicos estão integrados e respondendo corretamente com status 200 e content-type válidos. O portal de transparência está plenamente funcional.
