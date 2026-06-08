# Estado da Nacao — SEMEAR UI Global Sprint 1

Data: 2026-06-02

## Objetivo

Consolidar layout, identidade visual e componentes globais do portal SEMEAR, levando a coerencia do Radar INEA para o restante das paginas publicas sem alterar dados, APIs, calculos, manifestos ou logica de coleta.

## O que foi feito

### 1. Design system global criado em `src/components/portal/`

Componentes adicionados:

- `PortalPageShell`
- `PortalHero`
- `PortalSectionHeader`
- `PortalCard`
- `PortalMetricCard`
- `PortalActionCard`
- `PortalNotice`
- `PortalEmptyState`
- `PortalDownloadCard`
- `PortalModeTabs`

Arquivos:

- `src/components/portal/PortalPageShell.tsx`
- `src/components/portal/PortalHero.tsx`
- `src/components/portal/PortalSectionHeader.tsx`
- `src/components/portal/PortalCard.tsx`
- `src/components/portal/PortalMetricCard.tsx`
- `src/components/portal/PortalActionCard.tsx`
- `src/components/portal/PortalNotice.tsx`
- `src/components/portal/PortalEmptyState.tsx`
- `src/components/portal/PortalDownloadCard.tsx`
- `src/components/portal/PortalModeTabs.tsx`
- `src/components/portal/index.ts`

### 2. Tokens visuais globais consolidados

Incluidos no CSS global:

- `portal-page-shell`
- `portal-section-header`
- `portal-hero-split`
- `portal-hero-aside`
- `portal-hero-metrics`
- `portal-card-download`
- `portal-card-methodology`
- `badge-metodologia`
- `badge-dados-abertos`
- `cta-primary`
- `cta-secondary`
- `portal-stage-hero-social`

Tambem mantivemos e passamos a usar de forma mais consistente:

- `bg-ambient-zen`
- `bg-dot-grid`
- `card-leitura`
- `card-tecnico`
- `card-alerta`
- `card-social`
- `card-acao`

### 3. Header e footer globais revistos

Ajustes feitos:

- o link `Guias` no header passou a apontar para `/como-ler-dados`
- no menu mobile, `Guias` e `Como participar` passaram a ter entrada explicita
- o footer ganhou entrada direta para `Guias`

Arquivos:

- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`

### 4. Paginas publicas aplicadas nesta sprint

#### Home

- shell global aplicado
- cabecalho de acessos rapidos incorporado
- copia de acesso a `Dados` corrigida para nao sugerir "tempo real"

Arquivo:

- `src/pages/HomePage.tsx`

#### Dados

- shell global aplicado
- header editorial para o catalogo publico de dados

Arquivo:

- `src/pages/DadosPage.tsx`

#### Acervo

- shell global aplicado
- destaque passou a usar `PortalSectionHeader`

Arquivo:

- `src/pages/acervo/AcervoPage.tsx`

#### Linha do Tempo do Acervo

- shell global aplicado
- navegação anual ganhou `PortalSectionHeader`

Arquivo:

- `src/pages/acervo/AcervoTimelinePage.tsx`

#### Relatórios

- shell global aplicado
- filtros ganharam framing editorial
- secao de biblioteca recebeu heading unificado

Arquivo:

- `src/pages/reports/ReportsListPage.tsx`

#### Agenda

- hero global aplicado
- vazio trocado por estado pedagogico com proximos passos
- agenda ficou menos utilitaria e mais publica

Arquivo:

- `src/pages/AgendaPage.tsx`

#### Conversas e atividades

- hero global aplicado
- estados vazios melhorados
- secoes internas ganharam headers consistentes

Arquivo:

- `src/pages/conversar/ConversarListPage.tsx`

#### Guias

- `ComoLerDadosPage` passou a funcionar como biblioteca pedagogica mais clara
- hero e secoes unificadas ao sistema global

Arquivo:

- `src/pages/ComoLerDadosPage.tsx`

## O que ficou explicitamente fora deste sprint

- datasets
- CSVs
- APIs
- calculos
- manifestos
- logica de coleta
- thresholds
- textos metodologicos sensiveis do Radar INEA

## QA executada

- `npm run inea:qa:language` — PASS
- `npm run inea:qa:analytics` — PASS
- `npm run verify` — PASS
- `npm run typecheck` — PASS
- `$env:OBSERVATORIO_BASE_URL='https://semear-pwa.vercel.app'; npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

Observacao:

- `npm run verify` continua exibindo apenas o warning preexistente de lint em `scripts/inea-weblakes-recompute-lote-b.ts` (`isPartial` sem uso), sem bloquear o build.

## Checklist visual desta sprint

- Home OK
- Dados OK
- Radar OK
- Acervo OK
- Linha do Tempo OK
- Relatórios OK
- Agenda OK
- Guias OK
- Header sem sobreposição OK
- CTAs visíveis OK
- Estados vazios bonitos OK
- Contraste adequado OK

Itens ainda futuros:

- Mobile full review do conjunto restante
- páginas institucionais secundárias
- alertas, mapa, busca, status e inscrições com a mesma camada final

## Dívidas e próxima etapa

### 1. Rollout restante

Ainda faltam, em sprint futura:

- `/como-participar`
- `/sobre`
- `/transparencia`
- `/governanca`
- `/imprensa`
- `/apresentacao`
- `/programa-uff-territorio`
- `/alertas`
- `/mapa`
- `/buscar`
- `/status`
- `/inscricoes`

### 2. Performance futura

O warning de bundle do Radar INEA acima de `500 kB` continua registrado como dívida tecnica futura. O proximo passo sugerido permanece:

- lazy-load dos modos `Mapa`, `Tempo`, `Território` e `Metodologia`

## Conclusao

O Sprint 1 da UI global nao tentou redesenhar tudo de uma vez. Ele criou a base correta: primitives globais, tokens semanticos, header/footer mais coerentes e aplicacao inicial nas rotas de maior impacto publico. O portal passa a se comportar mais como uma unica plataforma e menos como um conjunto de paginas construidas em momentos diferentes.
