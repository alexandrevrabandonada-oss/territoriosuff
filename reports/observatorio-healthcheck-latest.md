# Relatório de Healthcheck do Observatório do Ar

Este relatório apresenta o status operacional automatizado das rotas públicas, APIs de backend e datasets abertos do Observatório do Ar em Volta Redonda.

---

## 1. Resumo do Diagnóstico

*   **Host Alvo:** [http://localhost:3002](http://localhost:3002)
*   **Data e Hora Local:** 31/05/2026, 00:22:06 (Horário de Brasília)
*   **Data e Hora UTC:** `2026-05-31T03:22:06.911Z`
*   **Total de Testes:** 20
*   **Aprovados:** 20 ✅
*   **Falhas:** 0
*   **Status de Saúde Geral:** **PASS (SAUDÁVEL)** 🟢

---

## 2. Detalhamento dos Componentes

| Recurso | Tipo | URL Testada | Status HTTP | Tempo de Resp. | Status | Notas |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Portal - Radar INEA** | `page` | [Link](http://localhost:3002/qualidade-ar/inea) | 200 | 225 ms | ✅ PASS |  |
| **Portal - Metodologia** | `page` | [Link](http://localhost:3002/qualidade-ar/inea/metodologia) | 200 | 2665 ms | ✅ PASS |  |
| **Portal - Dados Gerais** | `page` | [Link](http://localhost:3002/dados) | 200 | 182 ms | ✅ PASS |  |
| **Dataset Manifest** | `manifest` | [Link](http://localhost:3002/data/air/manifest.json) | 200 | 118 ms | ✅ PASS | Manifest parsed. Version: 1.3.1, datasets: 12 |
| **API: Resumo Geral** | `api` | [Link](http://localhost:3002/api/air/inea/summary) | 200 | 9246 ms | ✅ PASS | API JSON parsed successfully |
| **API: Últimas Leituras** | `api` | [Link](http://localhost:3002/api/air/inea/latest) | 200 | 3480 ms | ✅ PASS | API JSON parsed successfully |
| **API: Classificação IQAr** | `api` | [Link](http://localhost:3002/api/air/inea/classification-days) | 200 | 1534 ms | ✅ PASS | API JSON parsed successfully |
| **API: Lacunas (Gaps)** | `api` | [Link](http://localhost:3002/api/air/inea/analytics/data-gaps) | 200 | 2569 ms | ✅ PASS | API JSON parsed successfully |
| **CSV: Resumo de Estações PM10 (2020)** | `csv` | [Link](http://localhost:3002/data/air/pm10-2020-station-summary.csv) | 200 | 116 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2021)** | `csv` | [Link](http://localhost:3002/data/air/pm10-2021-station-summary.csv) | 200 | 113 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2021)** | `csv` | [Link](http://localhost:3002/data/air/pm25-2021-station-summary.csv) | 200 | 117 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2024)** | `csv` | [Link](http://localhost:3002/data/air/pm10-2024-station-summary.csv) | 200 | 114 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2024)** | `csv` | [Link](http://localhost:3002/data/air/pm25-2024-station-summary.csv) | 200 | 112 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2025)** | `csv` | [Link](http://localhost:3002/data/air/pm10-2025-station-summary.csv) | 200 | 114 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2025)** | `csv` | [Link](http://localhost:3002/data/air/pm25-2025-station-summary.csv) | 200 | 111 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM10 (2026 Parcial)** | `csv` | [Link](http://localhost:3002/data/air/pm10-2026-partial-station-summary.csv) | 200 | 111 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2026 Parcial)** | `csv` | [Link](http://localhost:3002/data/air/pm25-2026-partial-station-summary.csv) | 200 | 111 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Linha do Tempo de Particulados (2020-2026)** | `csv` | [Link](http://localhost:3002/data/air/particulate-timeline-2020-2026.csv) | 200 | 109 ms | ✅ PASS | CSV content valid. Row count parsed: 39 (excluding headers) |
| **CSV: Episódios de Atenção Mensais (2020-2026)** | `csv` | [Link](http://localhost:3002/data/air/attention-episodes-2020-2026.csv) | 200 | 110 ms | ✅ PASS | CSV content valid. Row count parsed: 462 (excluding headers) |
| **CSV: Dicionário de Dados do Observatório do Ar** | `csv` | [Link](http://localhost:3002/data/air/data-dictionary.csv) | 200 | 113 ms | ✅ PASS | CSV content valid. Row count parsed: 19 (excluding headers) |

---

## 3. Veredito Operacional

> [!TIP]
> **VEREDITO: SISTEMA 100% OPERACIONAL E SAUDÁVEL**
> Todos os serviços de API, páginas estáticas, manifesto e downloads físicos estão integrados e respondendo corretamente com status 200 e content-type válidos. O portal de transparência está plenamente funcional.
