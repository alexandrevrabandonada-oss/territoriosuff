# Relatório de Healthcheck do Observatório do Ar

Este relatório apresenta o status operacional automatizado das rotas públicas, APIs de backend e datasets abertos do Observatório do Ar em Volta Redonda.

---

## 1. Resumo do Diagnóstico

*   **Host Alvo:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
*   **Data e Hora Local:** 29/05/2026, 18:46:25 (Horário de Brasília)
*   **Data e Hora UTC:** `2026-05-29T21:46:25.091Z`
*   **Total de Testes:** 13
*   **Aprovados:** 13 ✅
*   **Falhas:** 0 none
*   **Status de Saúde Geral:** **PASS (SAUDÁVEL)** 🟢

---

## 2. Detalhamento dos Componentes

| Recurso | Tipo | URL Testada | Status HTTP | Tempo de Resp. | Status | Notas |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Portal - Radar INEA** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea) | 200 | 163 ms | ✅ PASS |  |
| **Portal - Metodologia** | `page` | [Link](https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia) | 200 | 69 ms | ✅ PASS |  |
| **Portal - Dados Gerais** | `page` | [Link](https://semear-pwa.vercel.app/dados) | 200 | 42 ms | ✅ PASS |  |
| **Dataset Manifest** | `manifest` | [Link](https://semear-pwa.vercel.app/data/air/manifest.json) | 200 | 58 ms | ✅ PASS | Manifest parsed. Version: undefined, datasets: 5 |
| **API: Resumo Geral** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/summary) | 200 | 2943 ms | ✅ PASS | API JSON parsed successfully |
| **API: Últimas Leituras** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/latest) | 200 | 928 ms | ✅ PASS | API JSON parsed successfully |
| **API: Classificação IQAr** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/classification-days) | 200 | 263 ms | ✅ PASS | API JSON parsed successfully |
| **API: Lacunas (Gaps)** | `api` | [Link](https://semear-pwa.vercel.app/api/air/inea/analytics/data-gaps) | 200 | 713 ms | ✅ PASS | API JSON parsed successfully |
| **CSV: Resumo de Estações PM10 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv) | 200 | 16 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Resumo de Estações PM2.5 (2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv) | 200 | 22 ms | ✅ PASS | CSV content valid. Row count parsed: 3 (excluding headers) |
| **CSV: Linha do Tempo de Particulados (2022-2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/particulate-timeline-2022-2024.csv) | 200 | 24 ms | ✅ PASS | CSV content valid. Row count parsed: 18 (excluding headers) |
| **CSV: Episódios de Atenção Mensais (2022-2024)** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/attention-episodes-2022-2024.csv) | 200 | 19 ms | ✅ PASS | CSV content valid. Row count parsed: 216 (excluding headers) |
| **CSV: Dicionário de Dados do Observatório do Ar** | `csv` | [Link](https://semear-pwa.vercel.app/data/air/data-dictionary.csv) | 200 | 30 ms | ✅ PASS | CSV content valid. Row count parsed: 19 (excluding headers) |

---

## 3. Veredito Operacional

> [!TIP]
> **VEREDITO: SISTEMA 100% OPERACIONAL E SAUDÁVEL**
> Todos os serviços de API, páginas estáticas, manifesto e downloads físicos estão integrados e respondendo corretamente com status 200 e content-type válidos. O portal de transparência está plenamente funcional.
