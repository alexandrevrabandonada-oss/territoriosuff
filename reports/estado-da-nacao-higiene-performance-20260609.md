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
  - `AdminTransparencyLiveEditPage`: `25.74 kB`

### Melhoria no Radar INEA

- `RadarTimeMode` caiu de aproximadamente `397.23 kB` para `13.99 kB` no chunk principal do modo.
- O peso foi redistribuido para chunks especificos carregados sob demanda:
  - `ParticulateTimeline2020_2026`: `163.31 kB`
  - `AttentionEpisodesPanel`: `175.22 kB`
  - `ThresholdComparisonPanel`: `21.05 kB`
  - `YearExplorer`: `22.82 kB`
  - `IneaHistoricalTimeline`: `4.02 kB`
  - `AqiChart`: `2.61 kB`

## Pesos que ainda exigem atencao

Os maiores remanescentes desta foto de build sao:

- `vendor-pdf`: `486.69 kB`
- `IneaMethodologyPage`: `221.95 kB`
- `AttentionEpisodesPanel`: `175.22 kB`
- `ParticulateTimeline2020_2026`: `163.31 kB`
- `summary-2026`: `187.47 kB`
- `vendor-supabase`: `170.74 kB`
- `vendor-maps`: `161.21 kB`
- `index.css`: `385.87 kB`

## Leitura tecnica

### 1. PDF agora esta isolado, mas ainda pesado

Isso ja e um ganho porque o custo nao contamina mais rotas comuns. O proximo passo nao e "quebrar" o PDF no escuro, e sim identificar quais fluxos realmente precisam desse runtime no primeiro paint.

### 2. `RadarTimeMode` deixou de ser o gargalo monolitico

O roteamento do Radar ja usava `lazy()`. Nesta rodada, o problema interno do modo de tempo tambem foi quebrado por painel. O proximo alvo deixa de ser o container `RadarTimeMode` e passa a ser os paineis historicos maiores, principalmente `AttentionEpisodesPanel`, `ParticulateTimeline2020_2026` e o dataset `summary-2026`.

### 3. CSS global ainda esta volumoso

Ha sinais de acoplamento visual excessivo no CSS compilado. Nao e urgente para estabilidade, mas ja entrou como frente valida de higienizacao.

## Fila tecnica priorizada

### Prioridade 1

1. Revisar `RadarTimeMode` por sub-blocos e dependencias de grafico.
2. Auditar `IneaMethodologyPage` para reduzir carga inicial da pagina metodologica.
3. Medir de onde vem `summary-2026` e confirmar se parte desse peso pode virar carga tardia.
4. Avaliar se `AttentionEpisodesPanel` e `ParticulateTimeline2020_2026` merecem subdivisao adicional ou carga por recorte.

### Prioridade 2

1. Auditar uso publico de `pdfjs-dist` e confirmar se todo fluxo de leitura exige runtime completo.
2. Revisar custo de CSS global e identificar trechos redundantes ou fortemente duplicados.

### Prioridade 3

1. Mapear pontos de prefetch util no portal publico.
2. Verificar se algumas rotas institucionais podem compartilhar menos codigo no caminho principal.

## Risco atual

Baixo para regressao funcional nas entregas desta rodada. As mudancas publicadas foram estruturais e de carregamento, com verificacao completa antes do push.

## Validacao executada

- `npm run build`
- `npm run typecheck`
- `npm run verify` antes da rodada de `RadarTimeMode`

## Commits relevantes desta frente

- `1c6fb8f` - stabilize smoke checks and cleanup warnings
- `ef89bde` - improve route-level code splitting and bundle chunking

## Proximo passo recomendado

Abrir a proxima rodada em cima de `src/pages/air/radar/RadarTimeMode.tsx`, porque e o maior peso publico ainda restante e o melhor candidato a ganho perceptivel sem tocar em regras de negocio.
