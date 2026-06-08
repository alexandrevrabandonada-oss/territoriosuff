# Estado da Nacao — Radar INEA UX Sprint 8 (APS Visual)

Data: 2026-06-02

## Objetivo

Aplicar uma identidade visual mais forte e mais marcante ao Radar INEA, usando a componentizacao recente para evoluir a interface por partes, sem alterar datasets, APIs, calculos, thresholds ou textos metodologicos sensiveis.

## Escopo executado

Foram trabalhados apenas os componentes pedidos:

- `src/pages/air/radar/RadarHero.tsx`
- `src/pages/air/radar/RadarOverviewMode.tsx`
- `src/pages/air/radar/RadarTerritoryMode.tsx`
- `src/pages/air/radar/RadarMethodologyMode.tsx`
- `src/pages/air/radar/RadarModeNav.tsx`
- `src/pages/air/radar/RadarVisualNotice.tsx`

## O que mudou

### 1. Hero mais forte e menos neutro

- Hero reconstruido com contraste mais alto, fundo atmosferico escuro e brilho verde/ambar.
- Tipografia principal ampliada para dar mais presenca ao titulo "Observatorio do Ar / Volta Redonda".
- KPIs reposicionados em blocos com mais peso visual.
- Painel lateral de situacao incorporado ao topo.
- CTAs convertidos para botoes mais fortes e mais proximos de uma linguagem de app.

### 2. Visao geral como painel de situacao

- Abertura da secao reformulada para leitura executiva.
- Primeiro bloco agora destaca a estacao que exige mais atencao.
- Cartoes de contexto e exposicao ganharam numeros maiores e hierarquia mais clara.
- Ranking deixou de parecer lista administrativa simples e passou a operar como grade de leitura.
- Bloco de "Leitura rapida" ficou mais acionavel e mais visual.

### 3. Territorio com identidade de justica ambiental

- Secao "Quem respira esse ar?" ganhou fundo escuro, contraste mais alto e moldura propria.
- Bloco editorial de vulnerabilidade territorial ficou mais forte.
- CTA para explorar territorios prioritarios foi tornado explicito.
- Cards sociais foram reforcados com linguagem visual mais intensa e menos institucional neutra.

### 4. Metodologia com cara de biblioteca publica

- Cabecalho metodologico passou a operar como "biblioteca publica do radar".
- Accordions do guia "como ler" receberam casca mais elegante.
- Downloads foram promovidos a cards mais atraentes e legiveis.
- Mantivemos o rigor metodologico, mas reduzimos a sensacao de parede tecnica pouco convidativa.

### 5. Navegacao por modos mais app-like

- Pills do modo ganharam active state mais forte.
- A barra sticky ficou mais refinada e mais fluida em mobile.
- O estado ativo agora comunica melhor a secao atual.

### 6. Avisos visuais padronizados

- `RadarVisualNotice` passou a distinguir melhor os estados:
  - `info`
  - `warning`
  - `error`
  - `quarantine`
- Cada tipo ganhou badge, cor e presenca visual especificos.

## O que nao mudou

- Nenhum dataset foi alterado.
- Nenhuma API foi alterada.
- Nenhum calculo foi alterado.
- Nenhum threshold foi alterado.
- Nenhum manifesto metodologico sensivel foi reescrito.
- Nenhum texto tecnico-base foi trocado por narrativa promocional.

## Validacao executada

### QA obrigatoria

- `npm run inea:qa:language` — PASS
- `npm run inea:qa:analytics` — PASS
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

### Validacao tecnica adicional

- `npm run typecheck` — PASS
- `npm run build` — PASS

### Smoke visual local

Rota validada:

- `http://127.0.0.1:4174/qualidade-ar/inea`

Resultado:

- `h1` carregado com "Observatorio do Ar / Volta Redonda"
- navegacao de modos presente
- shell visual renderizado corretamente
- screenshot salva em `reports/radar-inea-ux-sprint-8-smoke.png`

Observacao:

- No preview estatico local, as chamadas para `/api/air/inea/*` continuaram falhando com HTML em vez de JSON. Isso nao e regressao desta sprint visual; e o comportamento esperado quando a pagina e aberta sem backend/API correspondente. O shell da pagina permaneceu integro e os estados estaticos de fallback foram renderizados corretamente.

## Riscos observados

- O bundle de `IneaRadarPage` segue grande (`> 500 kB` minificado no warning do Vite). Nao bloqueia esta sprint, mas continua sendo um ponto tecnico para futura divisao adicional de carregamento.
- Permanece um warning preexistente de lint fora do escopo desta entrega:
  - `scripts/inea-weblakes-recompute-lote-b.ts`
  - argumento `isPartial` sem uso

## Conclusao

O Radar INEA ficou visualmente mais forte, mais contemporaneo e mais alinhado a uma linguagem APS de contraste, densidade e identidade, sem tocar na camada de dados, regras ou metodologia sensivel. A componentizacao previa permitiu fazer a evolucao por partes com baixo risco estrutural.
