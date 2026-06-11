# Estado da Nação — Radar INEA: contrato metodológico e downloads públicos

## Escopo

Este bloco reforçou a governança técnica do Radar INEA sem alterar datasets, cálculos, thresholds ou APIs públicas.

## Entregas

- Centralização do contrato de downloads públicos em `src/data/air/public-downloads.ts`.
- Substituição de links manuais na página de metodologia por `AIR_PUBLIC_DOWNLOADS`, `AIR_PUBLIC_FILES` e `getAirPublicDataPath`.
- Criação do QA `scripts/inea-public-downloads-assert.ts` para verificar existência física dos arquivos, presença no manifesto, `public_url` e contagem de linhas.
- Inclusão de `npm run inea:qa:downloads` no fluxo de verificação.
- Alinhamento do healthcheck oficial ao contrato centralizado de arquivos públicos.
- Remoção de linguagem pública ambígua de "homologação" na UI do Radar, substituindo por validação, auditoria técnica e governança metodológica.
- Reclassificação do recorte SO2/CO 2020-2026 como legado, preservando a série pública principal 2013-2026.
- Tipagem explícita do manifesto público (`AirPublicManifest`) e dos datasets expostos no contrato central.
- Remoção de `any` da página pública de metodologia e do healthcheck nos pontos ligados ao manifesto de dados.
- Uso de `getAirPublicDataPath` também nos atalhos de download do modo Metodologia do Radar.
- Reforço do QA de downloads para impedir que um atalho destacado exista fora da lista completa de arquivos públicos.
- Validação estrutural do manifesto: campos obrigatórios, datasets não vazios, ausência de duplicidade e sincronização bidirecional entre manifesto e `AIR_PUBLIC_FILES`.
- Validação estrutural dos CSVs públicos: arquivo não vazio, cabeçalho sem células vazias, ausência de cabeçalhos duplicados e consistência de número de colunas por linha.
- Ampliação do `npm run verify` para executar a suíte INEA completa (`language`, `downloads`, `analytics` e `methodology`) antes do build.
- Tipagem explícita dos dados que circulam entre o orquestrador do Radar e o modo Tempo: medições, série histórica, perfil mensal, poluente controlador e lacunas de dados.
- Ajuste defensivo para valores nulos de IQAr antes de arredondamento nos cards e tabelas de últimas leituras.
- Tipagem das páginas auxiliares do módulo de ar (`IneaAnalyticsPage` e `IneaStationPage`) para evitar respostas analíticas opacas.
- Tipagem do loader de resumos WebLakes e remoção de casts amplos no atlas temático e no explorador anual.
- Remoção de `any` direto nos caminhos principais `src/pages/air`, `src/components/air` e `src/lib/inea`.

## Resultado

O Radar fica menos dependente de links duplicados e reduz o risco de divergência entre UI, manifesto, scripts de geração e healthcheck de produção.
Além disso, alterações futuras no formato do manifesto passam a ser fiscalizadas pelo TypeScript em mais pontos do sistema.
O bloco também reduz risco em telas vizinhas ao Radar, principalmente estação, análises, atlas e explorador anual, sem alterar visual ou semântica pública.

## QA executado

- `npm run inea:qa:language`
- `npm run inea:qa:downloads`
- `npm run verify`
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts`

## Status

PASS. O healthcheck oficial retornou 33/33 verificações aprovadas.
