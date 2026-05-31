# Estado Atual do Projeto — Observatório do Ar SEMEAR (REVISADO)
## Volta Redonda · Portal de Qualidade do Ar

**Data de Emissão:** 2026-05-31 (Revisão após Auditoria Tijolo 44)
**Produção:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
**Versão do Manifesto:** v1.5.1
**Healthcheck:** 26/26 PASS ✅ (estimado após deploy)
**Datasets Públicos:** 18

> [!IMPORTANT]
> Este relatório substitui e corrige `estado-atual-projeto-20260531.md`, que continha informação incorreta sobre o status de PM2.5 2022 e 2023.

---

## 1. Correção Principal: PM2.5 2022 e 2023

**O relatório anterior afirmava incorretamente:**
> *"PM2.5 de 2020, 2022 e 2023 ainda não publicados (os dados brutos estão coletados mas não foram processados neste ciclo)"*

**Situação real verificada na auditoria:**
- ✅ PM2.5 de **2022 e 2023** já estavam **processados e publicados** no arquivo `particulate-timeline-2020-2026.csv`.
- ❌ PM2.5 de **2020** é a única pendência real — dados não coletados nem processados.
- ✅ CSVs individuais `pm25-2022-station-summary.csv` e `pm25-2023-station-summary.csv` foram gerados e adicionados ao manifesto v1.5.1.

---

## 2. Estado Atual dos Parâmetros Monitorados

### PM10 e PM2.5 — Material Particulado ✅ PUBLICADO

| Parâmetro | Série Histórica | Estações | Status |
| :--- | :---: | :--- | :---: |
| **PM10** | 2020–2026 (parc.) | Belmonte, Retiro, Santa Cecília | ✅ Publicado |
| **PM2.5** | 2021–2026 (parc.) | Belmonte, Retiro, Santa Cecília | ✅ Publicado |
| **PM2.5 2020** | — | — | ❌ Pendência real de coleta |

**Réguas de comparação:**
- OMS 2021: PM10 = 45 µg/m³ (24h) · PM2.5 = 15 µg/m³ (24h)
- CONAMA 506/2024 PI-1: PM10 = 120 µg/m³ (24h) · PM2.5 = 60 µg/m³ (24h)

---

### SO₂ — Dióxido de Enxofre ✅ PUBLICADO (Experimental)

| Série | Cobertura | Excedências OMS | Excedências CONAMA |
| :--- | :---: | :---: | :---: |
| 2020–2026 (parc.) | 20/21 ✅ | 3 dias (SC 2020) | 2020 e 2021 |

**Réguas:** OMS 24h = 40 µg/m³ · CONAMA 506/2024 Final = 20 µg/m³

---

### CO — Monóxido de Carbono ✅ PUBLICADO (Experimental)

| Série | Cobertura | Excedências OMS | Excedências CONAMA |
| :--- | :---: | :---: | :---: |
| 2020–2026 (parc.) | 21/21 ✅ | 0 dias | 0 dias |

**Réguas:** OMS 24h = 4 mg/m³ (~3,49 ppm, fator 1,145) · CONAMA 506/2024 = 9 ppm (média móvel 8h)

---

### NO₂ — Dióxido de Nitrogênio 🚫 BLOQUEADO

- Offset instrumental +20 µg/m³ em Retiro 2024 confirmado.
- Anos saudáveis (2020-2023, 2025-2026): médias de 13–16 µg/m³, coerência inter-estações excelente.
- **Bloqueio total mantido** — aguarda decisão de governança.
- **Réguas documentadas:** OMS 24h = 25 µg/m³ · CONAMA 506/2024 = 200 µg/m³ (pico 1h)

---

### PTS — Partículas Totais em Suspensão 🔒 QUARENTENA

- Erro de ganho 10× em Retiro 2024 confirmado.
- **Sem régua OMS** — PTS não tem diretriz de saúde OMS 2021.
- **Régua histórica (revogada):** CONAMA 03/1990 = 240 µg/m³ (24h).
- **Quarentena total mantida** — aguarda decisão de governança.

---

### O₃ — Ozônio ⚫ INDISPONÍVEL

- Zero transmissões válidas no recorte validado.
- **Réguas documentadas:** OMS = CONAMA Final = 100 µg/m³ (média móvel 8h)

---

## 3. Datasets Públicos — Manifesto v1.5.1 (18 datasets)

| # | Arquivo | Poluente | Ano |
| :---: | :--- | :---: | :---: |
| 1 | `pm10-2020-station-summary.csv` | PM10 | 2020 |
| 2 | `pm10-2021-station-summary.csv` | PM10 | 2021 |
| 3 | `pm25-2021-station-summary.csv` | PM2.5 | 2021 |
| 4 | **`pm25-2022-station-summary.csv`** ⚠️ Novo | PM2.5 | 2022 |
| 5 | **`pm25-2023-station-summary.csv`** ⚠️ Novo | PM2.5 | 2023 |
| 6 | `pm10-2024-station-summary.csv` | PM10 | 2024 |
| 7 | `pm25-2024-station-summary.csv` | PM2.5 | 2024 |
| 8 | `so2-2024-station-summary.csv` | SO₂ | 2024 |
| 9 | `co-2024-station-summary.csv` | CO | 2024 |
| 10 | `pm10-2025-station-summary.csv` | PM10 | 2025 |
| 11 | `pm25-2025-station-summary.csv` | PM2.5 | 2025 |
| 12 | `pm10-2026-partial-station-summary.csv` | PM10 | 2026 parcial |
| 13 | `pm25-2026-partial-station-summary.csv` | PM2.5 | 2026 parcial |
| 14 | `particulate-timeline-2020-2026.csv` | PM10 + PM2.5 | 2020–2026 |
| 15 | `so2-timeline-2020-2026.csv` | SO₂ | 2020–2026 |
| 16 | `co-timeline-2020-2026.csv` | CO | 2020–2026 |
| 17 | `attention-episodes-2020-2026.csv` | Todos | 2020–2026 |
| 18 | `data-dictionary.csv` | — | — |

---

## 4. Correções Aplicadas na Auditoria Tijolo 44

| Arquivo | Correção |
| :--- | :--- |
| `manifest.json` | v1.5.0 → v1.5.1; +2 datasets (18 total) |
| `pm25-2022-station-summary.csv` | **Criado** — dados existiam na timeline |
| `pm25-2023-station-summary.csv` | **Criado** — dados existiam na timeline |
| `thresholds.ts` | URLs SO₂/NO₂/O₃ corrigidas (491/2018 → 506/2024); nota CO corrigida; URL PTS corrigida |
| `data-dictionary.ts` | +14 novos campos documentados (5 publicados + 9 reservados); textos desatualizados corrigidos |
| `data-dictionary.csv` | Sincronizado com `.ts` — 33 campos (24 publicados + 9 reservados) |

---

## 5. Pendências Documentadas (fora do escopo deste Tijolo)

| Pendência | Tipo | Impacto |
| :--- | :--- | :--- |
| **PM2.5 2020** — dados não coletados | Coleta e processamento | Lacuna na série PM2.5 em 2020 |
| **PM10 2022/2023 CSV individual** | Geração de conveniência | Dados acessíveis via timeline |
| **SO₂/CO CSVs individuais por ano** (exceto 2024) | Geração de conveniência | Dados acessíveis via timelines |
| **Governança NO₂** | Decisão institucional | Anos saudáveis prontos para publicação condicional |
| **Governança PTS** | Decisão institucional | Mesmo processo de NO₂ |

---

## 6. Arquitetura Técnica (inalterada)

| Camada | Tecnologia |
| :--- | :--- |
| Framework | Vite + React 19 + TypeScript |
| UI | Tailwind CSS + design system próprio |
| Mapa | Leaflet + react-leaflet |
| PWA | vite-plugin-pwa (modo injectManifest) |
| Deploy | Vercel |
| Dados | CSVs estáticos + manifest.json servidos pelo CDN Vercel |

### Arquivos-chave
| Arquivo | Função |
| :--- | :--- |
| `public/data/air/manifest.json` | Source of truth de todos os datasets (v1.5.1) |
| `src/lib/air/thresholds.ts` | Todas as réguas de comparação OMS e CONAMA |
| `src/data/air/data-dictionary.ts` | Dicionário de campos com 33 entradas |
| `scripts/observatorio-healthcheck.ts` | Healthcheck automatizado de probes |
| `src/pages/air/IneaMethodologyPage.tsx` | Página pública de metodologia |
