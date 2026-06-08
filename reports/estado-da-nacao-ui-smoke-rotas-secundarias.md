# Estado da Nação — UI Smoke de Rotas Secundárias

Data: 2026-06-08

## Escopo

Rodada de verificação visual em browser real, com foco em rotas secundárias e no comportamento pós-consolidação do `PortalHero`.

Rotas inspecionadas:

- `/`
- `/alertas`
- `/transparencia`
- `/status`
- `/qualidade-ar/inea`

## Objetivo

Validar:

- consistência visual desktop/mobile
- contraste e legibilidade do hero global
- comportamento do lazy-load do Radar
- diferença entre problema real de UI e ruído de ambiente local com cache/service worker

## Achado real corrigido

Foi identificado um problema de herança visual no `PortalHero`:

- cards de KPI dentro do hero podiam herdar estilo de texto inadequado
- o `aside` da home podia perder contraste em contextos escuros

Correção aplicada em:

- `src/index.css`

Ajustes:

- subtítulo do hero passou a usar seletor mais restrito
- cards de KPI dentro do hero ganharam escopo próprio de cor e largura de texto
- `home-intro` e `home-popular` no `portal-hero-aside` ganharam contraste adequado

## Smoke local

### Radar

No preview local:

- troca de modos do Radar funcionou
- lazy-load não deixou a página em branco
- navegação entre modos respondeu corretamente

### Observação sobre preview local

Em algumas rotas locais com PWA/cache ativo, houve diferença visual entre o preview e o esperado por causa de cache/service worker. Esse comportamento apareceu como ruído de ambiente local, não como regressão pública conclusiva.

## Smoke em produção oficial

Verificação em `https://semear-pwa.vercel.app`:

- `Alertas` — hero legível e cards de status legíveis
- `Transparência` — hero legível e KPI principal visível
- `Status` — hero legível e bloco do boletim carregando corretamente

## QA executada

- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado
  - warning pré-existente fora do escopo

## Situação após a rodada

- lazy-load do Radar segue estável
- shell global está visualmente mais coerente
- contraste do `PortalHero` ficou mais robusto
- principal risco remanescente agora é operacional de publicação/deploy, não estrutural de UI

## Próxima rodada recomendada

1. publicar/deployar as mudanças visuais pendentes, se ainda não estiverem em produção
2. rodar smoke visual pós-deploy especificamente na home
3. se necessário, adicionar uma rotina curta de verificação visual automatizada para heros principais
