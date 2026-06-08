# Estado da Nação — Radar INEA: componentização segura

Data: 2026-06-02

## Objetivo

Quebrar `src/pages/air/IneaRadarPage.tsx` em componentes menores sem alterar visual, datasets, APIs, cálculos, thresholds, textos metodológicos ou comportamento editorial.

## O que foi feito

- Criada a pasta `src/pages/air/radar/`.
- `IneaRadarPage.tsx` foi reduzida a orquestrador de:
  - carga de dados
  - estados locais
  - navegação entre modos
  - composição dos componentes extraídos
- Componentes extraídos:
  - `RadarHero.tsx`
  - `RadarModeNav.tsx`
  - `RadarOverviewMode.tsx`
  - `RadarMapMode.tsx`
  - `RadarTimeMode.tsx`
  - `RadarTerritoryMode.tsx`
  - `RadarStationsMode.tsx`
  - `RadarMethodologyMode.tsx`
  - `RadarModeFooter.tsx`
  - `RadarVisualNotice.tsx`
- Helpers compartilhados adicionados:
  - `RadarTypes.ts`
  - `RadarMicroguide.tsx`
  - `RadarLaiModal.tsx`
  - `RadarQuickSummary.tsx`

## Estabilização aplicada

- Reexportado `getIneaClassificationStyle` em `IneaRadarPage.tsx` para manter compatibilidade com:
  - `src/components/air/AqiExplainer.tsx`
  - `src/pages/air/IneaStationPage.tsx`
- Mantido o comportamento original do gráfico temporal:
  - só renderiza o seletor/gráfico quando existe `latestData` real
- Mantidos:
  - endpoints `/api/air/inea/*`
  - fallback/loading
  - modal LAI
  - subabas do modo tempo
  - sticky subnav

## QA executado

### Obrigatório

- `npm run inea:qa:language` — PASS
- `npm run inea:qa:analytics` — PASS
- `npm run verify` — PASS
  - observação: há 1 warning pré-existente de lint em `scripts/inea-weblakes-recompute-lote-b.ts`
- `$env:OBSERVATORIO_BASE_URL='https://semear-pwa.vercel.app'; npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

### Check funcional local

- Preview local validado em `http://127.0.0.1:4174/qualidade-ar/inea`
- `h1` encontrado: `Observatório do Ar — Volta Redonda`
- Renderização do shell da página confirmada
- Observação: no `vite preview` sem backend/API mock, os fetches para `/api/air/inea/*` retornam HTML e geram erro de console esperado. Isso não altera a componentização, apenas o ambiente de preview estático.

## Resultado

- A página foi modularizada sem mudança intencional de layout e sem troca de regras de negócio.
- O risco de regressão estrutural em JSX caiu porque os modos agora vivem em arquivos isolados e menores.
- A evolução futura do Radar INEA agora pode acontecer por modo/componente, sem reabrir um arquivo monolítico de 2k+ linhas.

## Arquivos principais alterados

- `src/pages/air/IneaRadarPage.tsx`
- `src/pages/air/radar/RadarHero.tsx`
- `src/pages/air/radar/RadarModeNav.tsx`
- `src/pages/air/radar/RadarOverviewMode.tsx`
- `src/pages/air/radar/RadarMapMode.tsx`
- `src/pages/air/radar/RadarTimeMode.tsx`
- `src/pages/air/radar/RadarTerritoryMode.tsx`
- `src/pages/air/radar/RadarStationsMode.tsx`
- `src/pages/air/radar/RadarMethodologyMode.tsx`
- `src/pages/air/radar/RadarModeFooter.tsx`
- `src/pages/air/radar/RadarVisualNotice.tsx`
- `src/pages/air/radar/RadarTypes.ts`
- `src/pages/air/radar/RadarMicroguide.tsx`
- `src/pages/air/radar/RadarLaiModal.tsx`
- `src/pages/air/radar/RadarQuickSummary.tsx`
