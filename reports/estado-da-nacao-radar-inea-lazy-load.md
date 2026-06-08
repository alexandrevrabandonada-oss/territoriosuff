# Estado da Nação — Radar INEA Lazy Load

Data: 2026-06-02

## Objetivo

Atacar a principal dívida técnica remanescente do Radar INEA: o bundle monolítico acima de `500 kB`.

## Escopo

- `src/pages/air/IneaRadarPage.tsx`

## O que foi feito

- aplicação de `React.lazy` nos modos mais pesados:
  - `RadarMapMode`
  - `RadarTimeMode`
  - `RadarTerritoryMode`
  - `RadarMethodologyMode`
- inclusão de fallback visual simples via `Suspense`
- preservação do shell, dos estados, dos dados e da navegação entre modos
- remoção do `dynamic import` desnecessário do `LAI_TEMPLATE` para evitar warning de chunking

## O que não mudou

- datasets
- APIs
- cálculos
- thresholds
- copy metodológica
- estrutura pública da página

## Resultado de build

Antes:

- `IneaRadarPage` concentrava aproximadamente `526 kB`

Depois:

- `IneaRadarPage` caiu para aproximadamente `65.8 kB`
- chunks separados gerados:
  - `RadarMapMode` ~ `26.1 kB`
  - `RadarTerritoryMode` ~ `40.0 kB`
  - `RadarMethodologyMode` ~ `53.7 kB`
  - `RadarTimeMode` ~ `397.3 kB`

## Leitura técnica

O maior peso restante está concentrado em `RadarTimeMode`, mas agora esse custo só é pago quando o usuário entra nesse modo. Isso resolve o problema estrutural do carregamento inicial do Radar e reduz substancialmente o risco de regressão de performance no primeiro paint da página.

## QA executada

- `npm run typecheck` — PASS
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado
  - fora do escopo desta rodada

## Próxima rodada recomendada

1. smoke visual desktop/mobile das rotas secundárias
2. revisar fallback loading dos modos do Radar em browser real
3. avaliar split adicional dentro de `RadarTimeMode` se houver necessidade futura
