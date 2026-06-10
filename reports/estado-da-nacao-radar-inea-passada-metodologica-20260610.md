# Estado da Nação — Radar INEA: passada metodológica final

Data: 2026-06-10

## Objetivo desta rodada

Fortalecer a consistência metodológica e pedagógica do Radar INEA sem alterar datasets, APIs, cálculos, thresholds ou textos normativos sensíveis.

## O que foi feito

1. Revisão de linguagem editorial nos painéis temporais e comparativos para remover formulações que sugeriam causalidade fechada, dose individual ou confirmação pericial.
2. Consolidação de badges de força da evidência e avisos de governança metodológica nas áreas de visão geral, tempo, território e metodologia.
3. Separação mais clara entre:
   - leitura normativa forte;
   - leitura experimental expandida;
   - leitura interpretativa de priorização pública;
   - itens em quarentena/auditoria.
4. Inclusão explícita do eixo futuro de partículas sedimentáveis / “pó preto” como trilha paralela de evidência, sem mistura com IQAr.

## Arquivos ajustados nesta passada

- `src/pages/air/radar/RadarMethodologyMode.tsx`
- `src/pages/air/radar/RadarTimeMode.tsx`
- `src/pages/air/radar/RadarOverviewMode.tsx`
- `src/pages/air/radar/RadarTerritoryMode.tsx`
- `src/pages/air/IneaAnalyticsPage.tsx`
- `src/components/air/WindRosePanel.tsx`
- `src/components/air/WeatherPollutionCorrelation.tsx`
- `src/components/air/RainWashEffectPanel.tsx`
- `src/components/air/PublicInterpretationBox.tsx`
- `src/components/air/VulnerabilityLegend.tsx`
- `src/components/air/SocialExposureMap.tsx`
- `src/components/air/AttentionEpisodesPanel.tsx`
- `src/components/air/ParticulateTimeline2020_2026.tsx`
- `src/components/air/YearExplorer.tsx`
- `src/components/air/AqiExplainer.tsx`
- `src/pages/air/IneaMethodologyPage.tsx`

## Ajustes editoriais principais

- Belmonte, Retiro e Santa Cecília passaram a ser descritos como áreas/estações de atenção e prioridade de leitura, sem afirmar nexo causal isolado.
- Meteorologia e sazonalidade passaram a ser apresentadas como apoio interpretativo, não como prova automática de fonte emissora.
- Referências epidemiológicas externas foram mantidas como contexto de saúde pública, com salvaguarda explícita contra leitura de causalidade individual.
- A página metodológica legada passou a usar linguagem de priorização territorial, sensibilidade social e pressão ambiental aproximada, sem estimar dose pessoal.
- O explicador de IQAr substituiu afirmação absoluta de ausência de impacto por formulação probabilística e mais cautelosa para a faixa BOA.

## QA executado

- `npm run inea:qa:language` — PASS
- `npm run inea:qa:analytics` — PASS
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Situação após a rodada

O Radar INEA está mais sólido do ponto de vista metodológico e mais honesto na mediação pública dos dados. A experiência continua forte editorialmente, mas agora com menos risco de extrapolar o que a base pública realmente sustenta.

## Performance e modularidade

O orquestrador `IneaRadarPage.tsx` já está carregando os modos mais pesados com `React.lazy` e `Suspense`:

- Mapa;
- Tempo;
- Território;
- Metodologia.

Não foi necessário novo refactor nesta rodada. A próxima melhoria de performance deve focar em revisar dependências de chunks grandes fora do Radar, especialmente PDF, mapas e Supabase, quando houver janela própria para performance.

## Próxima rodada recomendada

1. Avaliar se o eixo de deposição/sedimentáveis pode ganhar landing metodológica própria antes de qualquer ingestão nova.
2. Planejar auditoria específica de chunks grandes fora do Radar.
3. Preparar uma rodada de smoke visual com navegador para as abas do Radar, caso a próxima etapa seja pré-divulgação pública.
