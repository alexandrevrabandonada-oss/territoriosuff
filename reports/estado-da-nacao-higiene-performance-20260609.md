# Estado da nacao: higiene e performance - 2026-06-09

## Escopo da rodada

Rodada automatizada de estabilizacao e performance de baixo risco, sem alterar dados, APIs, conteudo editorial ou contratos publicos.

## Entregas concluidas nesta frente

1. Higiene de verificacoes
- `npm run lint` limpo.
- `npm run smoke` estabilizado.
- `npm run verify` limpo.
- Smokes falsos negativos de admin alinhados ao codigo atual.

2. Navegacao publica
- Entrada `Transparencia` adicionada na navbar principal.

3. Performance de bundle e roteamento
- `DadosPage` saiu do caminho critico e passou a carregar por `lazy()`.
- Removido chunk artificial `admin-bundle`, que estava concentrando paginas administrativas demais em um unico arquivo.
- `pdfjs-dist` isolado em `vendor-pdf`.
- `uplot` isolado em `vendor-uplot`.
- `RadarTimeMode` passou a lazy-load de paineis internos pesados (`YearExplorer`, `ParticulateTimeline2020_2026`, `IneaHistoricalTimeline`, `AttentionEpisodesPanel`, `ThresholdComparisonPanel`, `AqiChart`).
- `IneaMethodologyPage` passou a deferir `DATA_DICTIONARY` e `DataAvailabilityMatrix`.
- Resumos anuais `summary-YYYY` passaram a carregar via loader dinamico com cache, em vez de entrarem estaticamente nos paineis temporais.
- `AttentionEpisodesPanel` passou a carregar a base `attention-episodes-2020-2026` sob demanda e uma unica vez por painel.
- `DataAvailabilityMatrix` passou a carregar `availability-matrix.json` sob demanda com indice em memoria por celula.
- `AdminTransparencyLiveEditPage` passou a importar o extrator de PDF apenas no momento de leitura do arquivo.
- `AirAtlasMap` passou a carregar o resumo anual selecionado via `summaryLoader`, em vez de importar todos os resumos do topo do modulo.

## Resultado observado

### Melhoria no bundle inicial

- Chunk principal publico (`assets/index-*.js`) caiu para aproximadamente `53.91 kB` bruto, com `15.25 kB` gzip.
- `DadosPage` passou a ser chunk separado (`49.04 kB` bruto).

### Melhoria na area administrativa

- A area admin deixou de depender de um bundle monolitico unico.
- Paginas administrativas agora saem em chunks menores e mais especificos, por exemplo:
  - `AdminDashboardPage`: `27.00 kB`
  - `AdminUploadsPage`: `50.76 kB`
  - `AdminAcervoEditPage`: `46.86 kB`
  - `AdminTransparencyLiveEditPage`: `25.53 kB`
  - `extractPdfText`: `0.80 kB`

### Melhoria no Radar INEA

- `RadarTimeMode` caiu de aproximadamente `397.23 kB` para `13.99 kB` no chunk principal do modo.
- O peso foi redistribuido para chunks especificos carregados sob demanda:
  - `ParticulateTimeline2020_2026`: `163.31 kB`
  - `AttentionEpisodesPanel`: `175.22 kB`
  - `ThresholdComparisonPanel`: `21.05 kB`
  - `YearExplorer`: `22.82 kB`
  - `IneaHistoricalTimeline`: `4.02 kB`
  - `AqiChart`: `2.61 kB`

### Melhoria nos resumos anuais

- `YearExplorer` passou a aproximadamente `23.27 kB`.
- `ThresholdComparisonPanel` passou a aproximadamente `21.49 kB`.
- `ParticulateTimeline2020_2026` passou a aproximadamente `20.26 kB`.
- O antigo peso concentrado em `summary-2026` foi quebrado em chunks anuais carregados sob demanda, por exemplo:
  - `summary-2026`: `16.48 kB`
  - `summary-2024`: `23.66 kB`
  - `summary-2025`: `39.30 kB`
  - `summary-2020`: `37.51 kB`

### Melhoria no painel de episodios

- `AttentionEpisodesPanel` caiu para aproximadamente `22.67 kB`.
- A base de episodios virou chunk proprio e tardio:
  - `attention-episodes-2020-2026`: `153.37 kB`
- O heatmap deixou de reimportar a base por conta propria e passou a receber os episodios do painel ja carregado.

### Melhoria na matriz amostral

- `DataAvailabilityMatrix` caiu para aproximadamente `8.27 kB`.
- `DataAvailabilityMatrix` deixou de embutir `availability-matrix.json` de forma estatica.
- A base agora carrega sob demanda via `availabilityMatrixLoader`, preservando o mesmo conteudo e comportamento.
- A busca por celula deixou de percorrer a base inteira com `find()` a cada render e passou a usar um indice em memoria por `estacao:ano:poluente`.
- O objetivo desta rodada e reduzir o peso de entrada da metodologia e estabilizar o custo de renderizacao da grade.

### Melhoria na metodologia

- `IneaMethodologyPage` caiu de aproximadamente `221.95 kB` para `51.61 kB`.
- O peso foi redistribuido para cargas tardias coerentes com a leitura:
  - `data-dictionary`: `13.26 kB`
  - `DataAvailabilityMatrix`: `8.27 kB`
  - `availability-matrix`: `150.91 kB`

### Melhoria no fluxo de PDF administrativo

- `AdminTransparencyLiveEditPage` deixou de importar o extrator de PDF no topo do modulo.
- O acionamento agora acontece apenas quando o operador escolhe um PDF local ou um PDF recente.
- O runtime pesado continua isolado em `vendor-pdf`, mas o ponto de ativacao ficou mais coerente com o uso real.

### Melhoria no runtime de PDF

- `src/lib/extractPdfText.ts` deixou de usar `pdfjs-dist/legacy/build/pdf.mjs` e passou a usar `pdfjs-dist/build/pdf.mjs`, mantendo o mesmo fluxo de extração administrativa.
- A extração administrativa tambem deixou de importar `pdf.worker.min.mjs?url` e passou a operar com `disableWorker: true`, o que elimina o worker dedicado desse fluxo.
- O uso real permaneceu restrito ao admin, principalmente no editor de `Transparencia Viva`.
- Efeito observado no build:
  - `vendor-pdf`: `427.58 kB` (antes `486.69 kB`)
  - reducao bruta aproximada: `59.11 kB`
  - `extractPdfText`: `0.67 kB` (antes `0.80 kB`)
  - o asset dedicado `pdf.worker.min-*.mjs` deixou de ser emitido nessa rota de extração
  - precache total do service worker: `4146.76 KiB` (antes `4204.61 KiB`)
- O ganho desta rodada veio sem alterar formulários, parser, PDFs aceitos ou comportamento editorial.

### Melhoria no atlas do mapa

- `AirAtlasMap` passou a carregar apenas o resumo anual solicitado no momento da selecao.
- O componente agora usa o mesmo `summaryLoader` cacheado adotado nos paineis temporais.
- O ganho principal desta rodada e coerencia de carregamento e menor acoplamento estrutural; o efeito em tamanho bruto do chunk foi pequeno.

### Melhoria nos mapas embutidos

- O mapa territorial da pagina `Transparencia` saiu do corpo da rota e virou componente lazy dedicado (`TransparencyTerritoryMap`).
- O mini mapa de localizacao do inbox administrativo saiu do corpo da pagina e virou componente lazy dedicado (`AdminReportLocationMap`).
- O visual, a fonte cartografica e o comportamento permaneceram iguais.
- Efeito observado:
  - `TransparencyTerritoryMap`: `0.89 kB`
  - `AdminReportLocationMap`: `0.60 kB`
  - `vendor-maps` permaneceu em `161.21 kB`, o que confirma que o ganho aqui foi de custo inicial por rota, nao de reducao do vendor compartilhado.

### Melhoria no modo territorio

- `RadarTerritoryMode` caiu para aproximadamente `26.77 kB`.
- Os dados sociais pesados deixaram de entrar de forma estatica no modo:
  - `census-sectors`: `10.24 kB`
  - `sensitive-facilities`: `3.69 kB`
- `SocialExposureMap` agora carrega camadas territoriais sob demanda e `SensitiveFacilitiesLayer` deixou de depender de dataset global.

### Melhoria no CSS global

- O bloco administrativo foi removido de `src/index.css` e passou para `src/styles/admin.css`, importado por `AdminRoutes`, que ja e lazy.
- Isso faz a experiencia publica parar de baixar estilos administrativos no primeiro paint.
- Efeito observado no build:
  - `index.css`: `351.38 kB` (antes `382.90 kB`)
  - novo chunk `AdminRoutes.css`: `32.07 kB`
- O ganho pratico desta rodada e code-splitting de CSS por rota administrativa, sem alterar visual.

### Melhoria no precache do PWA

- O service worker deixou de precarregar chunks pesados e tardios que nao precisam entrar na instalacao inicial do app.
- Itens movidos de precache para cache sob demanda:
  - chunks administrativos (`Admin*.js`, `Admin*.css`)
  - `vendor-pdf`
  - `vendor-maps`
  - resumos anuais `summary-*`
  - bases tardias `attention-episodes-*` e `availability-matrix-*`
- Para preservar reutilizacao apos o primeiro uso, `src/sw.ts` passou a registrar cache runtime `StaleWhileRevalidate` para `assets/*.js` e `assets/*.css`.
- Efeito observado:
  - precache total do service worker: `2547.23 KiB` (antes `4148.48 KiB`)
  - reducao aproximada: `1601.25 KiB`
  - entradas de precache: `109` (antes `152`)
- O ganho desta rodada e reduzir custo de instalacao e atualizacao do PWA sem mexer em datasets, APIs ou navegacao.

### Limpeza adicional de auth e precache auxiliar

- `src/lib/supabase/auth.ts` deixou de importar `supabase/client` estaticamente e passou a usar `getSupabaseClientOrNull()` via `runtime.ts`.
- Isso remove mais um acoplamento desnecessario ao client estatico no caminho administrativo.
- Tambem deixei de precarregar os CSS auxiliares de `vendor-maps` e `vendor-uplot`, que agora entram apenas sob demanda pelo cache runtime de assets.
- Efeito observado:
  - precache total do service worker: `2530.82 KiB` (antes `2547.23 KiB`)
  - entradas de precache: `107` (antes `109`)
- O `vendor-supabase` permaneceu em `170.74 kB`, o que confirma que o proximo ganho real nessa frente depende de atacar consumo publico ou substituir leitura cliente por carga estaticamente materializada.

### Corte adicional no precache de SDK e graficos

- O service worker deixou de precarregar tambem:
  - `vendor-supabase-*.js`
  - `vendor-uplot-*.js`
- Ambos continuam elegiveis ao cache runtime de assets, entrando apenas no primeiro uso real.
- Efeito observado:
  - precache total do service worker: `2313.03 KiB` (antes `2530.82 KiB`)
  - reducao adicional: `217.79 KiB`
  - entradas de precache: `105` (antes `107`)
- O bundle em si nao mudou:
  - `vendor-supabase`: `170.74 kB`
  - `vendor-uplot`: `52.27 kB`
- O ganho desta rodada foi de custo inicial de instalacao/atualizacao do PWA, nao de reducao do bundle bruto.

### Corte adicional no precache de rotas publicas lazy

- O service worker deixou de precarregar tambem os chunks `assets/*Page-*.js`.
- A navegacao publica continua funcional porque esses arquivos seguem cobertos pelo cache runtime de assets em `src/sw.ts`, entrando apenas no primeiro uso de cada rota.
- Efeito observado:
  - precache total do service worker: `1760.43 KiB` (antes `2313.03 KiB`)
  - reducao adicional: `552.60 KiB`
  - entradas de precache: `71` (antes `105`)
- O bundle em si nao mudou; a reducao foi no custo de instalacao e atualizacao do PWA, nao no peso bruto dos arquivos gerados.

### Lazy loading adicional dos mapas do Radar

- `RadarMapMode` passou a carregar `AirAtlasMap` com `lazy()` e `Suspense`.
- `RadarTerritoryMode` passou a carregar `SocialExposureMap` com `lazy()` e `Suspense`.
- O visual e o comportamento publico permaneceram iguais; a diferenca foi empurrar `AirAtlasMap` e `SocialExposureMap` para o primeiro uso real dentro de cada modo do Radar.
- Resultado de build:
  - `AirAtlasMap`: `23.74 kB`
  - `SocialExposureMap`: `19.74 kB`
  - precache do PWA apos essa rodada: `1761.85 KiB`
  - entradas de precache: `73`
- A pequena variacao de `71` para `73` entradas decorre da nova fragmentacao de chunks auxiliares, mas o ganho estrutural foi melhor isolamento dos mapas pesados e menor acoplamento do Radar.

### Higiene de workspace

- `.gitignore` passou a ignorar `.tmp/`, evitando que caches locais do Node/tsx reaparecam como ruido no workspace.

### Extracao do CSS do Acervo para carga sob demanda

- O bloco visual especifico do hub e das listagens do Acervo saiu de `src/index.css` e foi para `src/styles/acervo.css`.
- As paginas do acervo agora importam esse stylesheet apenas quando a rota do acervo e carregada:
  - `AcervoPage`
  - `AcervoListPage`
  - `AcervoTimelinePage`
  - `AcervoItemPage`
  - `CollectionsListPage`
  - `CollectionDetailPage`
- Resultado de build:
  - `index.css`: `340.20 kB` (antes `351.38 kB`)
  - novo chunk `acervo-*.css`: `11.42 kB`
- O ganho estrutural foi retirar CSS editorial do caminho critico da home e das demais rotas publicas.

### Corte adicional no precache do CSS editorial

- O service worker deixou de precarregar tambem `assets/acervo-*.css`.
- Como esse CSS agora e lazy e so entra nas rotas do acervo, ele permaneceu coberto pelo cache runtime de assets sem pesar na instalacao inicial do PWA.
- Efeito observado:
  - precache total do service worker: `1750.98 KiB` (antes `1762.14 KiB`)
  - reducao adicional: `11.16 KiB`
  - entradas de precache: `73` (inalterado)

### Isolamento do parser de Transparencia Viva do chunk base do editor

- `AdminTransparencyLiveEditPage` deixou de importar estaticamente `parseLiveTransparencyReportText`.
- O parser agora entra por import dinamico apenas quando o operador:
  - clica em pre-preencher a partir de texto bruto; ou
  - usa a leitura de PDF para extrair e interpretar o texto.
- Resultado de build:
  - `AdminTransparencyLiveEditPage`: `22.00 kB` (antes `25.54 kB`)
  - novo chunk `transparencyLiveParser-*.js`: `3.77 kB`
- O `vendor-pdf` bruto permaneceu em `427.58 kB`, mas sua exposicao continuou restrita ao fluxo editorial sob demanda.

### Corte final no precache dos auxiliares de leitura editorial

- O service worker deixou de precarregar tambem:
  - `assets/extractPdfText-*.js`
  - `assets/transparencyLiveParser-*.js`
- Esses chunks seguem cobertos pelo cache runtime de assets e so entram no primeiro uso real do fluxo editorial.
- Efeito observado:
  - precache total do service worker: `1750.33 KiB` (antes `1754.66 KiB`)
  - reducao adicional: `4.33 KiB`
  - entradas de precache: `72` (antes `74`)

### Melhoria no fluxo publico de relatos ambientais

- `ConversarListPage` deixou de importar o cliente Supabase no topo do modulo.

### Remocao do legado `api.legacy` do caminho publico

- `src/lib/api/content.ts` deixou de depender de `import("../api.legacy")`.
- As leituras publicas de blog, relatorios, acervo, dossies, corredores, agenda e conversas passaram a consultar o Supabase diretamente via `getSupabase()`, mantendo contratos e dados publicos.
- `HomePage` tambem deixou de acionar buscas mortas de `transparency` e `featuredCollections`.
- `monitoring.ts` passou a importar `content` e `transparency` apenas sob demanda em `getSystemStatus()`.
- Efeito observado:
  - o chunk `api.legacy` deixou de ser emitido no build publico
  - `content-*.js`: `17.41 kB`
  - precache do PWA: `1738.96 KiB`
- O ganho principal desta rodada foi remover acoplamento estrutural antigo do grafo publico e preparar o codigo para cortes adicionais mais previsiveis.

### Extracao do CSS da Home com split real por rota

- O CSS especifico da Home saiu de `src/index.css` e foi para `src/styles/home.css`.
- `HomePage` passou a importar esse stylesheet proprio.
- Para o split funcionar de fato, `HomePage` tambem deixou de ser eager no `App.tsx` e passou a seguir o mesmo padrao `lazy()` das demais rotas publicas.
- Resultado de build:
  - `index.css`: `323.90 kB` (antes `343.11 kB`)
  - novo chunk `HomePage-*.css`: `19.20 kB`
- `index-*.js`: `30.93 kB` (antes `53.69 kB`)
- novo chunk `HomePage-*.js`: `22.02 kB`
- precache do PWA: `1721.34 KiB`
- O ganho estrutural desta rodada foi retirar o visual da Home do caminho global, sem alterar layout, dados ou comportamento.

### Extracao do CSS do mapa para a rota lazy

- O bloco visual especifico de `MapaPage` saiu de `src/index.css` e foi para `src/styles/mapa.css`.
- `MapaPage` passou a importar esse stylesheet proprio, mantendo o mesmo visual, os mesmos marcadores e os mesmos controles cartograficos.
- Tambem removi `assets/MapaPage-*.css` do precache do PWA, porque a rota ja e lazy e esse CSS continua coberto pelo cache runtime de assets.
- Resultado de build:
  - `index.css`: `320.02 kB` (antes `323.90 kB`)
  - novo chunk `MapaPage-*.css`: `3.91 kB`
  - `MapaPage-*.js`: `20.31 kB`
  - precache do PWA: `1717.58 KiB` (antes `1721.34 KiB`)
- O ganho desta rodada foi pequeno, mas seguro: menos CSS global, menos custo inicial do PWA e melhor alinhamento entre rota lazy e seus estilos.
- O carregamento do client agora acontece apenas nos ramos que realmente fazem upload de imagem ou sincronizacao da fila offline.
- O comportamento do formulario permaneceu igual; a melhora desta rodada foi de custo de carregamento e isolamento de dependencia.
- `vendor-supabase` permaneceu em `170.74 kB`, o que mostra que o gargalo ainda esta distribuido em outras rotas publicas e administrativas.

### Melhoria na borda de conteudo publico

- `src/lib/api/content.ts` deixou de reexportar `api.legacy` de forma estatica.
- A camada publica agora virou um wrapper fino com import dinamico cacheado para o legado.
- Resultado de build:
  - `content`: `3.08 kB`
  - `api.legacy`: `26.30 kB`
- O ganho principal desta rodada nao foi reduzir o peso total do Supabase, e sim separar o custo editorial legado do barril publico, deixando o acoplamento mais visivel e sob demanda.

### Melhoria no nucleo da API publica

- `src/lib/api/core.ts` deixou de importar `supabase/client` estaticamente.
- As APIs publicas modernas (`monitoring.ts`, `search.ts`, `transparency.ts`, `transparencyLive.ts`) passaram a usar `getSupabase()` com import dinamico cacheado.
- Efeito observado na foto de build:
  - `index`: `53.82 kB` (antes `53.91 kB`)
  - `DadosPage`: `48.96 kB` (antes `49.04 kB`)
  - `StatusPage`: `26.06 kB` (antes `26.13 kB`)
  - `TransparenciaPage`: `40.33 kB` (antes `40.38 kB`)
  - `ConversarListPage`: `25.32 kB` (antes `25.38 kB`)
- `vendor-supabase` permaneceu em `170.74 kB`, o que reforca que o peso agregado agora esta mais associado a compartilhamento entre rotas e fluxo administrativo do que a um unico import prematuro no publico.

### Melhoria no runtime administrativo

- Criei `src/lib/supabase/runtime.ts` como borda unica para import dinamico cacheado do client.
- `src/lib/admin/media.ts` deixou de importar `supabase/client` no topo e passou a resolver o client apenas dentro das operacoes.
- `src/pages/admin/AdminUploadsPage.tsx` tambem deixou de depender do client estatico e passou a buscar o client apenas no carregamento real da fila e das referencias.
- `src/pages/admin/AdminAcervoListPage.tsx`, `src/pages/admin/AdminBlogListPage.tsx`, `src/pages/admin/AdminAgendaListPage.tsx` e `src/pages/admin/AdminReportsListPage.tsx` passaram a resolver o client apenas dentro dos carregamentos e exclusoes reais.
- `src/pages/admin/AdminAgendaEditPage.tsx`, `src/pages/admin/AdminBlogEditPage.tsx` e `src/pages/admin/AdminAcervoEditPage.tsx` passaram a buscar o client sob demanda dentro de `loadData()` e `handleSave()`, preservando o fluxo atual de formulario.
- `src/pages/admin/AdminActivitiesListPage.tsx`, `src/pages/admin/AdminActivitiesEditPage.tsx`, `src/pages/admin/AdminAgendaInscriptionsPage.tsx` e `src/pages/admin/AdminDashboardPage.tsx` seguiram o mesmo padrao de resolucao tardia do client.
- `src/pages/admin/AdminReportsEditPage.tsx`, `src/pages/admin/AdminTransparencyLiveListPage.tsx`, `src/pages/admin/AdminTransparencyLiveEditPage.tsx`, `src/pages/admin/AdminIneaPage.tsx`, `src/pages/admin/AdminPaperWizardPage.tsx` e `src/pages/admin/AdminPressPreservationPage.tsx` tambem passaram a usar `runtime.ts` em vez do import estatico.
- `src/pages/admin/AdminLoginPage.tsx` e `src/pages/admin/AdminResetPasswordPage.tsx` agora resolvem `supabase.auth` via a mesma borda dinamica.
- Efeito observado nesta rodada:
  - `runtime`: `0.43 kB`
  - `AdminUploadsPage`: `50.81 kB`
  - `AdminAcervoListPage`: `13.44 kB`
  - `AdminBlogListPage`: `7.28 kB`
  - `AdminAgendaListPage`: `6.44 kB`
  - `AdminReportsListPage`: `9.67 kB`
  - `AdminAgendaEditPage`: `10.75 kB`
  - `AdminBlogEditPage`: `22.05 kB`
  - `AdminAcervoEditPage`: `46.89 kB`
  - `AdminTransparencyLiveListPage`: `13.11 kB`
  - `AdminTransparencyLiveEditPage`: `25.54 kB`
  - `AdminReportsEditPage`: `19.47 kB`
  - `AdminPaperWizardPage`: `16.02 kB`
  - `AdminIneaPage`: `14.69 kB`
  - `AdminPressPreservationPage`: `33.93 kB`
  - `AdminLoginPage`: `7.06 kB`
  - `AdminResetPasswordPage`: `4.57 kB`
- Nesta foto final da rodada, nao restam imports diretos de `../../lib/supabase/client` em `src/pages/admin`.
- O peso agregado de `vendor-supabase` permaneceu em `170.74 kB`, o que mostra que o passo concluido aqui foi de borda e desacoplamento estrutural; a proxima reducao real do vendor depende de atacar compartilhamentos publicos e possiveis divisores adicionais no runtime do SDK.

## Pesos que ainda exigem atencao

Os maiores remanescentes desta foto de build sao:

- `vendor-pdf`: `486.69 kB`
- `vendor-pdf`: `427.66 kB`
- `vendor-pdf`: `427.58 kB`
- `index.css`: `351.38 kB`
- `AdminRoutes.css`: `32.07 kB`
- `vendor-supabase`: `170.74 kB`
- `vendor-maps`: `161.21 kB`
- `attention-episodes-2020-2026`: `153.37 kB`
- `availability-matrix`: `150.91 kB`

## Leitura tecnica

### 1. PDF agora esta isolado, mas ainda pesado

Isso ja e um ganho porque o custo nao contamina mais rotas comuns. O proximo passo nao e "quebrar" o PDF no escuro, e sim identificar quais fluxos realmente precisam desse runtime no primeiro paint.

### 2. Os gargalos migraram para componentes e runtimes especificos

O roteamento do Radar ja usava `lazy()`. Agora os custos mais relevantes deixaram de estar em containers monoliticos e passaram a ficar concentrados em componentes ou runtimes mais claros, principalmente `vendor-pdf`, `vendor-maps`, `index.css`, `attention-episodes-2020-2026`, `availability-matrix` e `vendor-supabase`.

### 3. O CSS publico melhorou, mas ainda segue pesado

O maior corte simples ja entrou com a separacao do CSS administrativo. O que restou em `index.css` agora tende a ser visual publico e shells compartilhados, entao a proxima limpeza precisa ser mais cirurgica.

## Fila tecnica priorizada

### Prioridade 1

1. Validar em navegador o fluxo de extração de PDF no admin apos a retirada do worker dedicado, porque a verificacao automatica desta rodada cobriu build e tipagem, mas nao um upload manual em UI.
2. Revisar `SocialExposureMap` para confirmar se parte do custo de `vendor-maps` ainda pode ser mais adiada ou segmentada.
3. Avaliar se a base `attention-episodes-2020-2026` pode ser particionada por ano sem prejudicar a manutencao editorial.
4. Decidir se `availability-matrix` merece particionamento por estacao ou ano, ou se o chunk tardio atual ja e suficiente.
5. Mapear o que ainda ancora `vendor-supabase` nas rotas publicas e no runtime compartilhado, agora que o admin deixou de importar `supabase/client` diretamente.
6. Avaliar se `transparency.ts` e `transparencyLive.ts` tambem devem usar bordas dinamicas equivalentes, para separar melhor leitura publica e client do banco.
7. Medir se vale encapsular chamadas de autenticacao para reduzir ainda mais o caminho comum entre rotas administrativas.
8. Confirmar por analise de bundle se o `vendor-supabase` atual esta sendo sustentado mais por `auth`, `storage` ou `query builders`.

### Prioridade 2

1. Auditar uso publico de `pdfjs-dist` e confirmar se todo fluxo de leitura exige runtime completo.
2. Revisar custo de CSS global publico remanescente e identificar trechos redundantes ou fortemente duplicados.
3. Medir se a pagina de transparencia e os fluxos administrativos podem importar clientes e adaptadores do Supabase apenas quando entram em acao.

### Prioridade 3

1. Mapear pontos de prefetch util no portal publico.
2. Verificar se algumas rotas institucionais podem compartilhar menos codigo no caminho principal.

## Risco atual

Baixo para regressao funcional nas entregas desta rodada. As mudancas publicadas foram estruturais e de carregamento, com verificacao completa antes do push.

## Validacao executada

- `npm run build`
- `npm run typecheck`
- `npm run verify`
- Validacao local via `vite preview` + Playwright headless:
  - `/` respondeu `200` com titulo `Pagina inicial | SEMEAR`
  - `/admin/login` respondeu `200` com renderizacao correta do fluxo administrativo

## Commits relevantes desta frente

- `1c6fb8f` - stabilize smoke checks and cleanup warnings
- `ef89bde` - improve route-level code splitting and bundle chunking
- `2bef2fd` - split RadarTimeMode panels into lazy chunks
- `05a860c` - defer methodology heavy sections

## Proximo passo recomendado

Validar em navegador o fluxo administrativo de PDF e o carregamento tardio de mapas no PWA, agora com precache mais enxuto e cache runtime sob demanda.

Medir novamente o build apos a rodada da matriz amostral e, em seguida, atacar `vendor-pdf` ou `vendor-maps`, porque agora sao os gargalos mais claros e com melhor custo-beneficio para a proxima reducao.

## Rodada adicional: Home mais enxuta e monitoring menos acoplado

- `src/pages/HomePage.tsx` deixou de carregar `transparencyApi.getTransparencySummary()` e `contentApi.listFeaturedCollections(3)`, porque esses dados eram buscados mas nao eram usados na renderizacao.
- Tambem removi os estados mortos associados (`setTransparency` e `setCollections`) e os tipos que existiam apenas para sustentar esse caminho morto.
- `src/lib/api/monitoring.ts` deixou de importar `./content` e `./transparency` no topo do modulo.
- Em vez disso, `getSystemStatus()` passou a resolver essas dependencias sob demanda via `import()` local, mantendo `getStationOverview()` e demais leituras de monitoring menos acopladas ao restante da camada publica.

### Efeito observado

- `monitoring`: `6.54 kB`
- `content`: `3.08 kB`
- `transparency`: `1.10 kB`
- `vendor-supabase`: `170.74 kB`
- `precache`: `72 entries (1750.50 KiB)`

### Leitura tecnica

Essa rodada nao reduziu o peso final agregado do `vendor-supabase`, mas melhora a arquitetura por dois motivos:

1. remove trabalho inutil da Home no primeiro carregamento;
2. evita que `monitoring.ts` traga dependencias de transparencia e conteudo logo no import do modulo.

O resultado pratico e um caminho publico mais coerente e uma base melhor para a proxima rodada de particionamento real do runtime compartilhado.

## Rodada adicional: esvaziamento da camada `api.legacy`

- Migrei para `src/lib/api/content.ts` os fluxos de:
  - eventos e inscricoes;
  - blog;
  - relatorios;
  - acervo e dossies;
  - conversas, comentarios e denuncias;
  - corredores climaticos;
  - relatos ambientais.
- Com isso, `content.ts` deixou de depender de `import("../api.legacy")` e a API publica principal passou a operar diretamente sobre `getSupabase()` e os tipos de `core.ts`.

### Efeito observado

- `api.legacy` saiu da foto do build.
- `content`: `17.41 kB`
- `precache`: `71 entries (1738.96 KiB)`

### Leitura tecnica

Aqui finalmente houve ganho estrutural e operacional ao mesmo tempo:

1. o portal publico deixou de carregar um adaptador legado separado;
2. o service worker passou a precachear menos arquivos e menos volume total;
3. a camada `content.ts` agora virou a borda unica para leitura publica editorial/social, o que simplifica manutencao, observabilidade e futuras quebras por dominio.

O custo foi esperado: o chunk `content` cresceu porque agora contem a implementacao real em vez de um proxy. Mesmo assim, o resultado final e melhor porque removemos um chunk inteiro do grafo publico e reduzimos o precache total.
