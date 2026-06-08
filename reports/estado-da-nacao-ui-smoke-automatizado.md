# Estado da Nação — UI Smoke Automatizado

Data: 2026-06-08

## Escopo

Transformação do smoke visual manual recente em cobertura automatizada de Playwright.

Arquivos principais:

- `tests/portal-hero-radar.spec.ts`
- `src/index.css`

## O que entrou

### 1. Teste automatizado novo

Arquivo:

- `tests/portal-hero-radar.spec.ts`

Cobertura:

- home em viewport mobile
- heros de `alertas`, `transparencia` e `status`
- verificação de legibilidade dos cards de KPI do hero
- troca de modos do Radar com lazy-load:
  - mapa
  - tempo
  - território
  - metodologia

### 2. Correção estrutural no `PortalHero`

Arquivo:

- `src/index.css`

Ajustes:

- escopo mais restrito para o subtítulo do hero
- proteção de cor e largura textual nos `portal-kpi-card` dentro do hero
- contraste ajustado para o `aside` da home

## Resultado

O projeto agora tem:

- validação visual manual recente
- correção estrutural na camada global do hero
- teste automatizado cobrindo os pontos que haviam ficado mais frágeis

## Execução validada

- `npx playwright test tests/portal-hero-radar.spec.ts` — PASS
- `npm run typecheck` — PASS
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado
  - fora do escopo

## Situação atual

Depois desta rodada:

- o shell global está protegido por teste
- o Radar lazy-loaded está protegido por teste
- os principais heros mobile têm cobertura básica de regressão

## Próximo passo recomendado

1. commitar e publicar esta sequência de rodadas
2. rodar smoke pós-deploy no domínio oficial
3. expandir a cobertura Playwright para mais uma ou duas rotas editoriais, se o portal continuar evoluindo nessa camada visual
