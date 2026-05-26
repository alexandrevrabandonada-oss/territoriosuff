# Estado da Nação — Publicação Controlada do Radar do Ar INEA (Final)

**Data do Relatório:** 2026-05-26  
**Status:** Aprovado para publicação pública — revisão editorial/jurídica concluída

---

## 1. Objetivo

Este relatório consolida a **revisão editorial e jurídica final** dos materiais públicos do Radar do Ar INEA (Tijolo 8.1), garantindo que nenhuma afirmação institucional não formalizada, nenhum termo tecnicamente impreciso e nenhuma promessa não comprovada subsista nos materiais de divulgação.

---

## 2. Correções Aplicadas

### 2.1 Vocabulário técnico — "dias degradados" → "dias registrados como MODERADA ou pior"

| Arquivo | Localização corrigida |
|---|---|
| `release-radar-do-ar.md` | Ranking de estações (item da lista); achado nº 2 (Setembro) |
| `estado-da-nacao-inea-publicacao.md` | Tabela de achados (linha "Mês com mais dias...") |
| `thread-radar-do-ar.md` | Tweet 3 — frase sobre trimestre |

O post do Instagram não continha a expressão "degradados" — já estava correto.

### 2.2 Referência ao CONAMA removida

| Arquivo | Antes | Depois |
|---|---|---|
| `release-radar-do-ar.md` | "classificado como RUIM pelo critério oficial do CONAMA" | "classificado como RUIM na própria base oficial de qualidade do ar" |

**Justificativa:** O CONAMA estabelece a metodologia IQAr, mas a classificação "RUIM" no registro específico provém da planilha do INEA. Afirmar "critério oficial do CONAMA" sem citar o ato normativo específico é uma afirmação que pode ser contestada; a versão corrigida é igualmente forte e inteiramente defensável.

### 2.3 Frase interpretativa sobre sazonalidade corrigida

| Arquivo | Antes | Depois |
|---|---|---|
| `thread-radar-do-ar.md` | "consistente com o período seco do sudeste" | "Nos dados disponíveis, junho a setembro concentram os maiores percentuais de dias registrados como Moderada ou pior" |

**Justificativa:** A correlação com o período seco é plausível, mas não é afirmação que os dados do INEA permitem concluir sozinhos — exigiria análise climatológica independente.

### 2.4 Afirmações institucionais ajustadas

| Expressão anterior | Expressão corrigida | Arquivo(s) |
|---|---|---|
| "em parceria com a Universidade Federal Fluminense (UFF)" | "articulado com pesquisadores e a comunidade local" | `release-radar-do-ar.md` |
| "Todos os dados, metodologias e código-fonte são públicos e verificáveis" | "A metodologia de coleta, normalização e validação dos dados está documentada publicamente" | `release-radar-do-ar.md` |
| "📧 semear@vr.org.br" | "canal oficial em implantação — acompanhe pelo endereço público do projeto" | `release-radar-do-ar.md` |
| "📱 Instagram: @semear.vr" | "Instagram: canal em implantação" | `release-radar-do-ar.md` |
| "Apoio à Rede Cidadã SEMEAR/UFF" | "Apoio à rede cidadã de monitoramento ambiental articulada pelo projeto SEMEAR" | `release-radar-do-ar.md`, `publicacao.md` |
| "Feito pelo projeto SEMEAR com dados oficiais do INEA · Dados Abertos RJ" | acrescentado "· metodologia documentada" | `post-instagram-radar-do-ar.md` |
| "@vrAbandonada" (handle de rede social) | "VR Abandonada" (nome sem pressupor handle ativo) | `thread-radar-do-ar.md` |

---

## 3. Achados publicados — validação final

Todos os valores abaixo estão confirmados nos dados reais do banco (2.459 registros GENERAL_AQI, paginados sem truncamento):

| Achado | Valor | Método de verificação |
|---|---|---|
| Maior Índice IQAr | VR-Retiro: **114** (RUIM) | `station-ranking` API + `check-zeros.ts` |
| Mês com mais dias registrados como MODERADA ou pior | **Setembro: 20,7%** | `monthly-profile` API |
| Poluentes controladores predominantes | **SO₂ (48,7%) e MP10 (30,6%)** | `controller-frequency` API |
| Lacuna temporal nas estações fixas | **≈ 421 dias** (10.104h) | `data-gaps` API |
| Natureza dos dados | Índices IQAr, **não µg/m³** | Metodologia Tijolo 3 |
| Dias com DADO_INSUFICIENTE | **0** | `inea-analytics-assert.ts` |

---

## 4. Resultado final dos testes

| Suíte | Resultado |
|---|---|
| `npm run inea:qa:analytics` | ✅ PASS |
| `npm run inea:qa:language` | ✅ PASS |
| `npm run inea:qa:methodology` | ✅ PASS |
| `npm run verify` (lint + tsc + build) | ✅ PASS |

---

## 5. Materiais revisados prontos para publicação

| Material | Arquivo | Status |
|---|---|---|
| Post Instagram (3 slides) | [`post-instagram-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-radar-do-ar.md) | ✅ Revisado |
| Thread X/Twitter (6 tweets) | [`thread-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-radar-do-ar.md) | ✅ Revisado |
| Release imprensa | [`release-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/release-radar-do-ar.md) | ✅ Revisado |
| Relatório de publicação (Tijolo 8) | [`estado-da-nacao-inea-publicacao.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-inea-publicacao.md) | ✅ Revisado |

---

## 6. Conclusão

Os materiais estão politicamente fortes e juridicamente seguros:

- **Nenhum achado** extrapola o que os dados oficiais do INEA permitem concluir.
- **Nenhuma afirmação institucional** depende de vínculos não formalizados.
- **Nenhuma promessa de canal** (e-mail, Instagram) é feita antes de estar operacional.
- **Toda terminologia técnica** está alinhada com a metodologia IQAr documentada nos Tijolos 3, 5 e 7.

A publicação pode ser feita com confiança editorial, técnica e jurídica.
