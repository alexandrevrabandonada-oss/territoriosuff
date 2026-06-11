# Estado da Nação — Radar INEA: hardening pós-contrato

## Escopo

Este bloco deu continuidade ao endurecimento técnico do Radar INEA depois da centralização do contrato metodológico de downloads públicos.

## Entregas

- Remoção dos últimos `any` diretos nos caminhos principais do módulo de ar:
  - `src/pages/air`
  - `src/components/air`
  - `src/lib/inea`
- Tipagem de `ParticulateTimeline2020_2026` com `SummaryPayload`.
- Tipagem de `ThresholdComparisonPanel` com `SummaryPayload`.
- Acesso defensivo ao poluente ativo no comparador OMS/CONAMA.
- Criação de `fetchRadarJson<T>()` para respostas tipadas do Radar INEA.
- Substituição de chamadas `fetch().json()` opacas em `IneaAnalyticsPage` e `IneaStationPage`.
- Tratamento explícito de respostas HTTP não OK nas páginas auxiliares.
- Criação de `scripts/inea-air-code-contract-assert.ts`.
- Inclusão de `inea:qa:code-contract` dentro de `npm run inea:qa`.

## Critério preservado

- Não houve alteração de datasets.
- Não houve alteração de APIs.
- Não houve alteração de cálculos.
- Não houve alteração de thresholds.
- Não houve alteração visual intencional.

## QA

- `npm run typecheck`
- Varredura por `any` direto nos caminhos principais de ar.
- Varredura por `fetch().json()` opaco em páginas/componentes de ar.
- `npm run inea:qa:code-contract`
- `npm run verify`

## Status

PASS.
