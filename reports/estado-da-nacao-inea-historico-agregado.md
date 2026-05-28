# Estado da Nação — Dados Históricos Agregados

**Data do Relatório:** 2026-05-28T00:29:38.568Z  
**Fonte Principal:** Inventário de Evidências Físicas de Qualidade do Ar  
**Status do Dataset:** Normalizado com sucesso (10 registros importados)

---

## 1. Visão Geral das Fontes Históricas Importadas

Abaixo está o catálogo completo de evidências de concentrações físicas agregadas extraídas de publicações científicas e relatórios oficiais do INEA/IEMA:

| Fonte | Período | Estação | Poluente | Métrica | Valor | Confiança |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | PM10 | DAILY_MEAN_SUMMARY | 29.45 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | PM10 | DAILY_MAX | 132.76 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | PTS | DAILY_MEAN_SUMMARY | 43.28 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | PTS | DAILY_MAX | 172.39 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | O3 | DAILY_MEAN_SUMMARY | 41.34 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | O3 | DAILY_MAX | 108.12 µg/m³ | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | PM10 | OMS_EXCEEDANCE_COUNT | 60 count | HIGH |
| [Poluição do ar e internações hospitalares por d...](https://doi.org/10.5327/Z2176-947820190537) | 2013-01-01 a 2015-12-31 | VR-Belmonte, VR-Retiro, VR-Santa Cecília | O3 | OMS_EXCEEDANCE_COUNT | 2 count | HIGH |
| [Relatório de Qualidade do Ar do Estado do Rio d...](http://www.inea.rj.gov.br/ar-agua-e-solo/monitoramento-da-qualidade-do-ar/relatorios-de-qualidade-do-ar/) | 2015 | VR-Belmonte | O3 | HOURLY_MAX | 198 µg/m³ | HIGH |
| [Relatório de Qualidade do Ar do Estado do Rio d...](http://www.inea.rj.gov.br/ar-agua-e-solo/monitoramento-da-qualidade-do-ar/relatorios-de-qualidade-do-ar/) | 2015 | VR-Santa Cecília | PTS | DAILY_MAX | 156 µg/m³ | HIGH |

---

## 2. Lógica de Qualidade dos Dados (Tiers)

Todos os registros contidos no dataset recebem a tag canônica:
`data_quality_tier = HISTORICAL_AGGREGATE`

Isso diferencia as métricas agregadas vindas de relatórios pretéritos (2013-2018) das concentrações horárias ativas (`RAW_PUBLIC_PLATFORM`) e da base de índices dimensionais (`PUBLIC_INDEX`), evitando distorções nas exibições públicas do portal.
