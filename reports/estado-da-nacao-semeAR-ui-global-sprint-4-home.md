# Estado da Nação — SEMEAR UI Global Sprint 4 (Home)

Data: 2026-06-02

## Escopo

Rodada dedicada à home do portal, que ainda usava hero legado fora da gramática visual consolidada nas páginas internas.

- `src/pages/HomePage.tsx`

## O que mudou

- migração do topo para `PortalHero`
- preservação do conteúdo editorial, busca principal, buscas populares, ilustração e bloco `Dados agora`
- manutenção dos banners INEA já existentes abaixo do hero
- manutenção da navegação principal e das seções inferiores

## O que não mudou

- fontes de dados da home
- links de navegação
- cards principais do portal
- banners editoriais do Observatório do Ar
- lógica da busca principal

## Resultado

A home agora entra de forma mais coerente na identidade global do portal sem perder densidade informativa. O topo deixou de ser uma exceção estrutural e passou a compartilhar:

- hero global
- badges semânticos
- KPIs em cards
- composição editorial com `aside`

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS com 1 warning pré-existente fora do escopo
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado

## Dívida técnica restante

- `IneaRadarPage` continua acima de `500 kB`
- próxima rodada recomendada:
  1. lazy-load dos modos do Radar
  2. smoke visual desktop/mobile das rotas secundárias
  3. revisão final de coerência de spacing e hierarquia entre home e páginas internas
