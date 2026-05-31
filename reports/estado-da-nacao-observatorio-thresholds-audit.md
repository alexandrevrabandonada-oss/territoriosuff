# Auditoria de Thresholds — Observatório do Ar SEMEAR
## Parâmetros, Regimes de Comparação e Status por Poluente

**Data de Emissão:** 2026-05-31 — Auditoria Tijolo 44
**Arquivo Auditado:** `src/lib/air/thresholds.ts`

> [!NOTE]
> Este relatório documenta todas as réguas de comparação aplicadas pelo Observatório do Ar, distinguindo: (1) diretrizes internacionais de saúde da OMS; (2) padrões legais brasileiros vigentes (CONAMA 506/2024); (3) padrões transitórios intermediários; (4) padrões históricos revogados; (5) parâmetros sem régua OMS aplicável.

---

## 1. Tabela Completa de Thresholds por Poluente

### PM10 — Material Particulado ≤ 10 µm
**Status de publicação: ✅ PUBLICADO (2020–2026)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | 24h | **45** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| OMS 2021 | Anual | **15** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 PI-1 | 24h | **120** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 Final | 24h | **50** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 PI-1 | Anual | **40** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 Final | Anual | **20** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Régua aplicada nas excedências dos CSVs:** OMS 24h = 45 µg/m³; CONAMA PI-1 24h = 120 µg/m³.

---

### PM2.5 — Material Particulado ≤ 2,5 µm
**Status de publicação: ✅ PUBLICADO (2021–2026)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | 24h | **15** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| OMS 2021 | Anual | **5** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 PI-1 | 24h | **60** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 Final | 24h | **25** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 PI-1 | Anual | **20** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 Final | Anual | **10** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Régua aplicada nas excedências dos CSVs:** OMS 24h = 15 µg/m³; CONAMA PI-1 24h = 60 µg/m³.

---

### SO₂ — Dióxido de Enxofre
**Status de publicação: ✅ PUBLICADO experimental (2020–2026)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | 24h | **40** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 Final | 24h | **20** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 PI-1 | 24h | **125** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Régua aplicada nas excedências dos CSVs:** OMS 24h = 40 µg/m³; CONAMA Final 24h = 20 µg/m³.
> **Nota:** A OMS não estabelece limite anual para SO₂ nas diretrizes de 2021. O padrão CONAMA Final de 20 µg/m³ é **mais restritivo** que a diretriz OMS de 40 µg/m³.
> **Problema corrigido nesta auditoria:** As URLs do CONAMA estavam apontando para a 491/2018 (revogada). Corrigido para 506/2024.

---

### CO — Monóxido de Carbono
**Status de publicação: ✅ PUBLICADO experimental (2020–2026)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | 24h | **4** | mg/m³ (~3,49 ppm) | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 Final | Média móvel 8h | **9** | ppm | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Unidade nativa:** ppm (plataforma INEA/WebLakes).
> **Conversão OMS:** 1 ppm CO = 1,145 mg/m³ (a 25°C, 1 atm). Portanto, 4 mg/m³ OMS = ~3,49 ppm.
> **Régua aplicada:** OMS = média de 24h convertida para mg/m³; CONAMA = máxima média móvel de 8h em ppm (mínimo 6h/janela).
> **Problema corrigido:** Nota do código dizia "~3.5 ppm"; corrigido para "~3.49 ppm".

---

### NO₂ — Dióxido de Nitrogênio
**Status de publicação: 🚫 BLOQUEADO (anomalia Retiro 2024)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | 24h | **25** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| OMS 2021 | Anual | **10** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 Final | 1h pico | **200** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 PI-1 | 1h pico | **260** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Importante:** OMS usa **média diária (24h)** para NO₂; CONAMA usa **pico horário (1h)**. São regimes completamente distintos.
> **Problema corrigido:** URLs apontavam para 491/2018 revogada. Corrigido para 506/2024.

---

### O₃ — Ozônio
**Status de publicação: ⚫ INDISPONÍVEL (zero transmissões em 2024)**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| OMS 2021 | Média móvel 8h | **100** | µg/m³ | Diretriz de saúde | [OMS 2021](https://www.who.int/publications/i/item/9789240034228) |
| CONAMA 506/2024 Final | Média móvel 8h | **100** | µg/m³ | Padrão final vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |
| CONAMA 506/2024 PI-1 | Média móvel 8h | **140** | µg/m³ | Padrão transitório vigente | [CONAMA 506/2024](https://www.in.gov.br/web/dou/-/resolucao-conama-n-506-de-4-de-julho-de-2024) |

> **Nota:** OMS e CONAMA Final coincidem em 100 µg/m³ para O₃. O parâmetro está indisponível.
> **Problema corrigido:** URLs apontavam para 491/2018 revogada. Corrigido para 506/2024.

---

### PTS — Partículas Totais em Suspensão
**Status de publicação: 🔒 HISTÓRICO-TÉCNICO EM QUARENTENA**

| Regime | Período | Valor | Unidade | Tipo | Fonte |
| :--- | :--- | ---: | :--- | :--- | :--- |
| CONAMA 03/1990 Histórico | 24h | **240** | µg/m³ | Padrão histórico revogado | [CONAMA 03/1990](https://www.ibama.gov.br/sophia/cnia/legislacao/MMA/RE0003-300690.PDF) |
| CONAMA 03/1990 Histórico | Anual | **80** | µg/m³ | Padrão histórico revogado | [CONAMA 03/1990](https://www.ibama.gov.br/sophia/cnia/legislacao/MMA/RE0003-300690.PDF) |

> **Sem régua OMS:** A OMS 2021 não estabelece limite para PTS como métrica de saúde — foi substituída por PM10 e PM2.5.
> **Revogação:** A CONAMA 03/1990 foi revogada pela CONAMA 491/2018, que foi por sua vez revogada pela 506/2024. O PTS não tem mais padrão legal vigente no Brasil.
> **Problema corrigido:** URL apontava para PDF de terceiro (instável). Corrigido para URL do IBAMA.

---

## 2. Matriz de Cobertura de Réguas por Poluente

| Poluente | Régua OMS | Régua CONAMA Vigente | Régua Histórica | Status |
| :--- | :---: | :---: | :---: | :---: |
| PM10 | ✅ | ✅ | — | ✅ Publicado |
| PM2.5 | ✅ | ✅ | — | ✅ Publicado |
| SO₂ | ✅ | ✅ | — | ✅ Publicado experimental |
| CO | ✅ (mg/m³) | ✅ (ppm 8h) | — | ✅ Publicado experimental |
| NO₂ | ✅ | ✅ | — | 🚫 Bloqueado |
| O₃ | ✅ | ✅ | — | ⚫ Indisponível |
| PTS | ❌ sem OMS | — | ✅ CONAMA 03/1990 | 🔒 Quarentena |

---

## 3. Problemas Corrigidos nesta Auditoria

| Problema | Arquivo | Correção |
| :--- | :--- | :--- |
| URLs de SO₂, NO₂, O₃ apontavam para CONAMA 491/2018 revogada | `thresholds.ts` | Atualizadas para CONAMA 506/2024 |
| Nota de CO dizia "~3.5 ppm" (impreciso) | `thresholds.ts` | Corrigido para "~3.49 ppm" com fator 1,145 explícito |
| URL de PTS apontava para PDF de terceiro instável | `thresholds.ts` | Atualizado para URL do IBAMA (CONAMA 03/1990) |
| Labels de SO₂, NO₂, O₃ não mencionavam "506/2024" | `thresholds.ts` | Labels atualizados para incluir referência à resolução |
