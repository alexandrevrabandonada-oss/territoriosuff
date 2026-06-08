# Estado da Nação — SEMEAR UI Global Sprint 2

Data: 2026-06-02

## Escopo desta rodada

Segunda passada de consolidação visual sobre a base criada em `src/components/portal/`, focada em páginas institucionais e operacionais de baixo a médio risco, sem alterar dados, APIs, cálculos ou fluxos de negócio.

## Páginas refinadas nesta rodada

- `src/pages/ComoParticiparPage.tsx`
- `src/pages/SobrePage.tsx`
- `src/pages/GovernancaPage.tsx`
- `src/pages/ImprensaPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/TransparenciaPage.tsx`
- `src/pages/StatusPage.tsx`

## Ajustes aplicados

### Institucionais

- `ComoParticiparPage`
  - adoção de `PortalPageShell`
  - hero migrado para `PortalHero`
  - seções internas com `PortalSectionHeader`

- `SobrePage`
  - adoção de `PortalPageShell`
  - hierarquia editorial aplicada nas seções de princípios, atuação e contato

- `GovernancaPage`
  - adoção de `PortalPageShell`
  - blocos normativos e de atalho institucional reorganizados com cabeçalhos consistentes

- `ImprensaPage`
  - adoção de `PortalPageShell`
  - reforço de leitura pública para resumo institucional, citação, contatos e downloads

### Operacionais

- `SearchPage`
  - hero global com enquadramento editorial
  - resultados segmentados com `PortalSectionHeader`
  - sem alteração no motor de busca nem nas chamadas de API

- `TransparenciaPage`
  - hero global com métricas de total histórico e período filtrado
  - filtros, tabela e links oficiais com hierarquia editorial padronizada
  - sem alteração nos CSVs, filtros, modal ou dataset

- `StatusPage`
  - hero global com leitura pública da operação
  - bloco do boletim mensal e fechamento editorial alinhados ao restante do portal
  - sem alteração nos KPIs, exportações, share ou observabilidade

## Resultado

O portal avança de um conjunto de telas independentes para uma linguagem mais uniforme:

- shell de página consistente
- heróis com assinatura visual comum
- cabeçalhos de seção com a mesma gramática editorial
- menor fragmentação entre páginas institucionais, operacionais e de serviço

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS com 1 warning pré-existente
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado
  - warning pré-existente, fora do escopo da sprint

## Dívida técnica mantida

- `IneaRadarPage` continua acima de `500 kB` no build
- próximo passo recomendado continua sendo lazy-load dos modos pesados do Radar

## Fora desta rodada

- `AlertasPage` mantida sem intervenção estrutural nesta passada
  - motivo: fluxo mais sensível por permissões, subscription push, service worker e simulação local

## Próxima rodada recomendada

1. revisar `AlertasPage` com o mesmo shell global, preservando UX de permissão e fallback
2. avaliar se a home deve migrar do hero legado para `PortalHero` sem perder densidade editorial
3. fazer smoke visual desktop/mobile nas rotas secundárias após a consolidação
