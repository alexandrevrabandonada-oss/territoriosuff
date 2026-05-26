# Estado da Nação — QA Analítico do Radar do Ar INEA (Tijolo 7)

**Data do Relatório:** 2026-05-26  
**Status da Auditoria:** Aprovado e Homologado (Conformidade Completa)

---

## 1. Introdução

Este relatório documenta a auditoria analítica do **Tijolo 7** sobre o Radar do Ar INEA (Volta Redonda-RJ). O objetivo foi garantir que nenhum dado ausente, zerado ou inválido seja confundido com qualidade do ar boa, e que os rankings comparativos entre estações só apareçam quando há cobertura mínima suficiente (≥ 30%).

---

## 2. Regra de Validade Analítica

Antes de qualquer análise pública, cada registro de `GENERAL_AQI` é submetido à **Regra de Validade Analítica**:

| Condição | Classificação Final |
|---|---|
| `quality_flag ≠ 'OK'` | `DADO_INSUFICIENTE` |
| `air_quality_index = 0` **e** nenhum subíndice válido em `raw_json` | `DADO_INSUFICIENTE` |
| `air_quality_classification` fora de {BOA, MODERADA, RUIM, MUITO RUIM, PÉSSIMA} | `DADO_INSUFICIENTE` |
| Registro válido | Mantém classificação original |

Esta regra está implementada em todas as APIs analíticas (`degraded-days`, `station-ranking`, `monthly-profile`, `data-gaps`) via função `getValidatedClassification()`.

---

## 3. Auditoria de Registros Zerados (air_quality_index = 0)

**Resultado:** Nenhum registro com `air_quality_index = 0` foi encontrado no banco de dados.

| Métrica | Valor |
|---|---|
| Total de medições GENERAL_AQI | **2.459** |
| Medições com índice = 0 | **0** |
| Medições em branco (índice 0 + sem subíndices) | **0** |
| Dias reclassificados como DADO_INSUFICIENTE | **0** |

> A proteção contra zeros está ativa e testada. Caso novos registros zerados sejam ingeridos, serão filtrados automaticamente antes da exibição pública.

---

## 4. Cobertura por Estação (Paginated, GENERAL_AQI)

A cobertura é calculada com paginação completa (sem corte de 1.000 registros do PostgREST) e representa **dias medidos sobre dias esperados** entre o primeiro e o último registro de cada estação.

| Estação | Dias Medidos | Dias Esperados | Cobertura | Dias Insuficientes | Dias MODERADA ou pior | % sobre dias medidos |
|---|---|---|---|---|---|---|
| VR-Belmonte | 655 | 1.139 | 57,5% | 0 | 89 | 13,6% |
| VR-Retiro | 682 | 1.139 | 59,9% | 0 | 38 | 5,6% |
| VR-Nossa Sra. das Graças (Van) | 438 | 476 | **92,0%** | 0 | 17 | 3,9% |
| VR-Santa Cecília | 684 | 1.139 | 60,1% | 0 | 17 | 2,5% |

### Notas de Cobertura

- **VR-Nossa Sra. das Graças (Van)** é a única estação **móvel**. Seu alto percentual de cobertura (92%) reflete o período compacto de operação (≈ 476 dias esperados entre primeiro e último registro).
- As estações fixas (Belmonte, Retiro, Santa Cecília) têm janela histórica muito maior (~1.139 dias esperados), refletindo uma cobertura de 57–60%.
- A versão anterior do coletor (limitado a 1.000 linhas pelo PostgREST) mostrava cobertura de ~1,7% para as fixas — distorção totalmente corrigida pela paginação implementada no Tijolo 7.

---

## 5. Validação do Alerta de Cobertura Insuficiente para Ranking

O critério de **cobertura mínima de 30%** para participar do ranking comparativo foi definido no Tijolo 7. Com os dados reais:

| Estação | Cobertura | Elegível para Ranking Comparativo? |
|---|---|---|
| VR-Belmonte | 57,5% | ✅ Sim |
| VR-Retiro | 59,9% | ✅ Sim |
| VR-Nossa Sra. das Graças (Van) | 92,0% | ✅ Sim |
| VR-Santa Cecília | 60,1% | ✅ Sim |

**Resultado:** Todas as 4 estações atingem 30% de cobertura. O ranking comparativo é exibido normalmente.  
O aviso de ausência de cobertura (*"Não há cobertura suficiente para ranking comparativo robusto entre estações"*) seria acionado somente se nenhuma estação alcançasse o limiar — o que não se verifica com os dados atuais.

---

## 6. Maior Índice IQAr por Estação

| Estação | Maior Índice IQAr Registrado | Classificação |
|---|---|---|
| VR-Belmonte | 74 | MODERADA |
| VR-Retiro | **114** | RUIM |
| VR-Nossa Sra. das Graças (Van) | 85 | RUIM |
| VR-Santa Cecília | 62 | MODERADA |

> **VR-Retiro** registrou o maior Índice IQAr histórico (114 — classificado como RUIM). Nenhuma estação atingiu MUITO RUIM ou PÉSSIMA no período disponível.

---

## 7. Lacunas Temporais por Estação

| Estação | Lacunas (> 24h) | Maior Interrupção |
|---|---|---|
| VR-Belmonte | 27 | **10.104 horas** (≈ 421 dias) |
| VR-Nossa Sra. das Graças (Van) | 17 | 192 horas (8 dias) |
| VR-Retiro | 18 | **10.104 horas** (≈ 421 dias) |
| VR-Santa Cecília | 16 | **10.104 horas** (≈ 421 dias) |

> As estações fixas (Belmonte, Retiro, Santa Cecília) possuem uma lacuna de ~421 dias em comum, o que indica um período sem dados na planilha oficial do INEA — não uma falha de ingestão. A fonte CKAN_XLSX reflete o que foi publicado pelo INEA nos Dados Abertos RJ.

---

## 8. Perfil Mensal de Dias Registrados como MODERADA ou Pior

| Mês | Dias Medidos | Dias Degradados | % sobre Medidos |
|---|---|---|---|
| Janeiro | 243 | 2 | 0,8% |
| Fevereiro | 165 | 3 | 1,8% |
| Março | 202 | 5 | 2,5% |
| Abril | 204 | 9 | 4,4% |
| Maio | 202 | 9 | 4,5% |
| Junho | 205 | 20 | 9,8% |
| Julho | 207 | 19 | 9,2% |
| Agosto | 209 | 26 | **12,4%** |
| **Setembro** | **203** | **42** | **20,7%** |
| Outubro | 202 | 7 | 3,5% |
| Novembro | 200 | 13 | 6,5% |
| Dezembro | 217 | 6 | 2,8% |

> **Setembro** é o mês com maior proporção de dias registrados como MODERADA ou pior (20,7%). O trimestre **junho–setembro** concentra os meses mais críticos, o que é consistente com o período seco e de maior incidência de poluentes particulados no sudeste brasileiro.

---

## 9. Linguagem Pública Auditada

As seguintes correções de vocabulário estão implementadas e validadas:

| Expressão Antiga (Proibida) | Expressão Nova (Aprovada) |
|---|---|
| "dias degradados" | "dias registrados como MODERADA ou pior" |
| "pico de poluição" | "maior Índice IQAr registrado" |
| "100% BOA" (sem validação) | Verificação de subíndices + classificação DADO_INSUFICIENTE |
| Rankings sem limiar de cobertura | Rankings apenas com cobertura ≥ 30% |

---

## 10. Resultado da Suíte de Testes Automatizados

Todos os testes foram executados com sucesso após as implementações do Tijolo 7:

| Suíte | Comando | Resultado |
|---|---|---|
| QA Analítico | `npm run inea:qa:analytics` | ✅ PASS |
| QA de Linguagem Pública | `npm run inea:qa:language` | ✅ PASS |
| QA Metodológico | `npm run inea:qa:methodology` | ✅ PASS |
| Build + TypeScript + Linter | `npm run verify` | ✅ PASS |

---

## 11. Conclusão

O Radar do Ar INEA está analiticamente blindado para publicação pública:

- **Nenhum** dia vazio ou zerado é confundido com qualidade boa.
- **Paginação completa** garante que todos os 2.459 registros GENERAL_AQI são processados corretamente.
- **Rankings comparativos** só são exibidos para estações com ≥ 30% de cobertura (todas as 4 estações atingem o critério com os dados atuais).
- **Linguagem pública** é precisa, sem prometer tempo real ou inferências além do que os dados permitem.
- **Lacunas temporais** são exibidas transparentemente, atribuídas à fonte CKAN_XLSX e não a falhas de ingestão.
