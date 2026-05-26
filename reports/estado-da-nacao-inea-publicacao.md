# Estado da Nação — Publicação Controlada do Radar do Ar INEA (Tijolo 8)

**Data do Relatório:** 2026-05-26  
**Status:** Publicação autorizada com ressalvas técnicas documentadas

---

## 1. Objetivo

Documentar a primeira divulgação pública do **Radar do Ar INEA** no portal SEMEAR, garantindo que a comunicação seja politicamente forte, tecnicamente defensável e eticamente honesta.

---

## 2. O que foi publicado

### Rota pública: `/qualidade-ar/inea`

Inserido o componente **`PublicLaunchBanner`** imediatamente após os avisos de metodologia e freshness. O banner apresenta:

- **Título**: "Radar do Ar: o que os dados oficiais do INEA mostram sobre Volta Redonda"
- **Subtítulo**: Convite à leitura cidadã dos padrões, lacunas e sinais de atenção.
- **Seção "Principais achados"**: 5 achados validados pelo QA do Tijolo 7.
- **Seção "O que isso NÃO significa"**: 5 ressalvas técnicas e legais.
- **Seção "O que isso significa"**: 5 afirmações positivas sobre uso cidadão dos dados.
- **Rodapé**: Identificação da fonte (INEA · Dados Abertos RJ · qualidade_ar.xlsx), tipo de atualização (batch periódico, não tempo real), e link para `/qualidade-ar/inea/analises`.

---

## 3. Achados publicados e suas bases de validação

Todos os achados foram verificados pelo script `npm run inea:qa:analytics` (Tijolo 7) e pelo banco de dados real.

| Achado | Valor Real | Fonte |
|---|---|---|
| Maior Índice IQAr registrado | VR-Retiro: **114** (RUIM) | `station-ranking` API, GENERAL_AQI |
| Mês com mais dias registrados como MODERADA ou pior | **Setembro: 20,7%** dos dias medidos | `monthly-profile` API |
| Poluentes controladores predominantes | **SO₂ e MP10** | `controller-frequency` API |
| Lacuna temporal nas estações fixas | **≈ 421 dias** comuns a Belmonte, Retiro e Santa Cecília | `data-gaps` API, max_gap_hours = 10.104h |
| Natureza dos dados | Índices IQAr (adimensionais), **não µg/m³** | Metodologia validada no Tijolo 3 |

---

## 4. Ressalvas técnicas documentadas ("O que NÃO significa")

| Ressalva | Justificativa |
|---|---|
| Não é prova automática de crime ambiental | Índices são indicadores de qualidade relativa, não laudos técnico-legais |
| Não mede concentração bruta em µg/m³ | A fonte CKAN_XLSX contém apenas subíndices adimensionais IQAr |
| Não é monitoramento minuto a minuto | Fonte batch periódica (Dados Abertos RJ), blindada no Tijolo 5 |
| Não substitui análise técnica oficial | Requer laudos de órgãos competentes para uso jurídico |
| Ausência de dado ≠ ar bom | Regra de validade analítica implementada no Tijolo 7 |

---

## 5. Uso cidadão proposto ("O que significa")

1. **Sinal público de atenção** — verificável por qualquer pessoa com acesso ao portal.
2. **Ferramenta de transparência** — baseada em dados publicados pelo próprio Estado.
3. **Base para cobrança técnica** — com números, datas e estações identificadas.
4. **Justificativa para pedido via LAI** — solicitar séries brutas, laudos e relatórios de campo.
5. **Apoio à rede cidadã de monitoramento ambiental** articulada pelo projeto SEMEAR.

---

## 6. Resultado final dos testes

| Suíte | Resultado |
|---|---|
| `npm run inea:qa:analytics` | ✅ PASS |
| `npm run inea:qa:language` | ✅ PASS |
| `npm run inea:qa:methodology` | ✅ PASS |
| `npm run verify` (lint + tsc + build) | ✅ PASS |

---

## 7. Materiais de comunicação gerados

- [`reports/post-instagram-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-radar-do-ar.md) — Post para Instagram (3 slides)
- [`reports/thread-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-radar-do-ar.md) — Thread para X/Twitter (6 tweets)
- [`reports/release-radar-do-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/release-radar-do-ar.md) — Release para imprensa e redes

---

## 8. Conclusão

A publicação está tecnicamente blindada. O Radar do Ar INEA está acessível em `/qualidade-ar/inea` com linguagem honesta, dados rastreáveis à fonte oficial e convite à participação cidadã. Nenhum achado publicado extrapola o que os dados permitem concluir.
