# Estado da Nação — Inventário de Datasets Públicos v1.5.0
## Observatório do Ar SEMEAR · Volta Redonda

**Data de Emissão:** 2026-05-31 — Auditoria Tijolo 44
**Manifesto:** v1.5.0 → v1.5.1 (após adição de PM2.5 2022 e 2023)
**Produção:** [https://semear-pwa.vercel.app/data/air/](https://semear-pwa.vercel.app/data/air/)

---

## 1. Inventário Completo de Arquivos em `public/data/air/`

| # | Arquivo | Tamanho (KB) | No Manifesto? | Linhas |
| :---: | :--- | ---: | :---: | ---: |
| 1 | `pm10-2020-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 2 | `pm10-2021-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 3 | `pm25-2021-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 4 | `pm10-2024-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 5 | `pm25-2024-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 6 | `so2-2024-station-summary.csv` | 0,5 | ✅ | 4 (3 estações) |
| 7 | `co-2024-station-summary.csv` | 0,6 | ✅ | 4 (3 estações) |
| 8 | `pm10-2025-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 9 | `pm25-2025-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 10 | `pm10-2026-partial-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 11 | `pm25-2026-partial-station-summary.csv` | 0,8 | ✅ | 4 (3 estações) |
| 12 | `particulate-timeline-2020-2026.csv` | 2,6 | ✅ | 40 (39 dados) |
| 13 | `so2-timeline-2020-2026.csv` | 1,4 | ✅ | 23 (21 dados) |
| 14 | `co-timeline-2020-2026.csv` | 1,4 | ✅ | 23 (21 dados) |
| 15 | `attention-episodes-2020-2026.csv` | 61,8 | ✅ | 463 (462 dados) |
| 16 | `data-dictionary.csv` | 5,1 | ✅ | 20 (19 campos) |
| — | `manifest.json` | 9,9 | — | auto-referência |

**Resultado:** ✅ **Inventário íntegro** — todos os 16 datasets listados no manifesto têm arquivo local correspondente. Sem arquivos órfãos.

---

## 2. Cobertura de Poluentes e Anos

### PM10 (Material Particulado ≤ 10 µm)
| Ano | CSV Individual | Na Timeline | Status |
| :---: | :---: | :---: | :--- |
| 2020 | ✅ | ✅ | Publicado |
| 2021 | ✅ | ✅ | Publicado |
| 2022 | ❌ | ✅ | Só na timeline — CSV individual ausente |
| 2023 | ❌ | ✅ | Só na timeline — CSV individual ausente |
| 2024 | ✅ | ✅ | Publicado |
| 2025 | ✅ | ✅ | Publicado |
| 2026 | ✅ (parcial) | ✅ | Publicado parcial |

> [!NOTE]
> PM10 de 2022 e 2023 também não tem CSVs individuais. São acessíveis via `particulate-timeline-2020-2026.csv`.

### PM2.5 (Material Particulado ≤ 2,5 µm)
| Ano | CSV Individual | Na Timeline | Status |
| :---: | :---: | :---: | :--- |
| 2020 | ❌ | ❌ | **Pendência real — dados não coletados** |
| 2021 | ✅ | ✅ | Publicado |
| 2022 | ⚠️ **Novo** | ✅ | Dados na timeline; CSV gerado nesta auditoria |
| 2023 | ⚠️ **Novo** | ✅ | Dados na timeline; CSV gerado nesta auditoria |
| 2024 | ✅ | ✅ | Publicado |
| 2025 | ✅ | ✅ | Publicado |
| 2026 | ✅ (parcial) | ✅ | Publicado parcial |

### SO₂ (Dióxido de Enxofre)
| Tipo | Cobertura | Status |
| :--- | :--- | :--- |
| Timeline 2020–2026 | ✅ 21 linhas (7 anos × 3 estações) | Publicado |
| CSV 2024 por estação | ✅ | Publicado |
| CSVs individuais 2020–2023, 2025–2026 | ❌ | Só na timeline |

### CO (Monóxido de Carbono)
| Tipo | Cobertura | Status |
| :--- | :--- | :--- |
| Timeline 2020–2026 | ✅ 21 linhas | Publicado |
| CSV 2024 por estação | ✅ | Publicado |
| CSVs individuais 2020–2023, 2025–2026 | ❌ | Só na timeline |

### NO₂, PTS, O₃
| Poluente | Status | Motivo |
| :--- | :---: | :--- |
| NO₂ | 🚫 Bloqueado | Offset +20 µg/m³ em Retiro 2024 |
| PTS | 🔒 Quarentena | Fator 10× em Retiro 2024 |
| O₃ | ⚫ Indisponível | Zero transmissões válidas em 2024 |

---

## 3. Acréscimos desta Auditoria (v1.5.1)

| Arquivo | Ação | Fonte dos Dados |
| :--- | :--- | :--- |
| `pm25-2022-station-summary.csv` | **[NOVO]** | Extraído da `particulate-timeline-2020-2026.csv` |
| `pm25-2023-station-summary.csv` | **[NOVO]** | Extraído da `particulate-timeline-2020-2026.csv` |
| `manifest.json` | **[BUMP → v1.5.1]** | 18 datasets após adição dos dois CSVs |

---

## 4. Pendências Documentadas (fora do escopo deste Tijolo)

| Pendência | Tipo | Impacto |
| :--- | :--- | :--- |
| **PM2.5 2020** — dados não coletados | Coleta e processamento | Série PM2.5 terá lacuna em 2020 |
| **PM10 2022/2023 CSV individual** | Geração de arquivo | Dados disponíveis na timeline; CSV seria convenência |
| **SO₂/CO CSVs individuais por ano** | Geração de arquivo | Dados disponíveis nas timelines respectivas |

---

## 5. Veredito de Integridade

| Critério | Resultado |
| :--- | :---: |
| Todos os arquivos do manifesto existem localmente | ✅ |
| Nenhum arquivo local está fora do manifesto | ✅ |
| PM2.5 2022 e 2023 disponíveis publicamente | ✅ (na timeline; CSVs individuais gerados agora) |
| PM2.5 2020 disponível | ❌ (pendência real) |
| Todos os datasets de gases na timeline completa | ✅ |
| NO₂ / PTS / O₃ ausentes do manifesto público | ✅ |
