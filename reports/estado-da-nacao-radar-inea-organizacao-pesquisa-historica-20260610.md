# Estado da Nacao — Radar INEA: organizacao pedagogica e pesquisa historica

Data: 2026-06-10

## Objetivo

Organizar a leitura metodologica do Radar INEA e preparar a proxima etapa de aprofundamento em dados historicos sem alterar datasets, APIs, calculos, thresholds ou textos sensiveis ja publicados.

## Fontes verificadas nesta rodada

- SIGQAr/AQMIS publico do INEA/WebLakes: https://fat.ei.weblakes.com/INEA/
- Evidencia publica sobre o lancamento do SIGQAr/AQMIS e seus paineis de IQA, estacoes e metricas de qualidade: https://pt.linkedin.com/posts/qualityamb_foi-lan%C3%A7ado-pelo-inea-instituto-estadual-activity-7110962903704383488-_N0a
- Discussao tecnica publicada em congresso indicando que o SIGQAr permite pesquisa por poluente, desde 1998 ate o presente, por estacao: https://www.ibeas.org.br/congresso/Trabalhos2024/IV-005.pdf
- Registro publico sobre fiscalizacao em Volta Redonda e acompanhamento do INEA junto a Prefeitura e CSN: https://www.voltaredonda.rj.gov.br/comunicacao/noticias/24-gabinete-do-prefeito/8751-inea-rj-fiscaliza-csn-e-anuncia-parceria-com-universidade-para-analisar-amostras-coletadas/
- Registro publico sobre monitoramento de particulas sedimentaveis e po preto: https://agenciabrasil.ebc.com.br/geral/noticia/2024-07/mp-recomenda-monitoramento-de-po-preto-da-csn-em-volta-redonda
- Apresentacao tecnica INEA/Firjan citando o portal de qualidade do ar e o endereco sigqar.inea.rj.gov.br: https://firjan.com.br/data/files/7C/D1/31/37/093CC910B13359B9D8284EA8/03%20-%20NOP-INEA-01-R.01%20-%20Alexandre%20Ornellas%20INEA.pdf

## Diagnostico do acervo atual do Radar

O portal ja publica uma base historica relevante em `public/data/air/`:

- PM10: linha do tempo 2013-2026 e resumos anuais publicados para anos-chave.
- PM2.5: serie publica 2021-2026, com 2020 ainda tratado como lacuna metodologica.
- SO2: linha do tempo 2013-2026 e resumo 2024.
- CO: linha do tempo 2013-2026 e resumo 2024, mantendo a unidade nativa ppm.
- Episodios mensais de atencao: 2020-2026.
- Meteorologia: base auxiliar 2013-2026, com vento observado e demais variaveis sinalizadas como modeladas/simuladas conforme manifesto.

O manifesto atual (`public/data/air/manifest.json`) informa que o dataset esta em versao 1.6.1, com status saudavel, fonte `WEBLAKES_CONCENTRATION_WITH_WIND` e ressalva metodologica de dado horario publico WebLakes, comparacao experimental e ausencia de QA/QC oficial explicito por registro.

## Organizacao pedagogica aplicada

Foi criado o componente `RadarHistoricalResearchPanel.tsx`, inserido no modo de metodologia do Radar.

O novo bloco apresenta:

- cobertura historica por camada de poluente;
- diferenca entre camada publicada, camada experimental e quarentena tecnica;
- roteiro de scraping seguro em quatro passos;
- fontes de auditoria para o usuario conferir a origem;
- aviso metodologico de que nova raspagem so deve entrar na interface apos disponibilidade amostral, unidade esperada, cobertura minima e relatorio de auditoria.

## Limites de publicacao

Nao foi incorporado novo dataset nesta rodada.

Motivo: a existencia de endpoints e a indicacao de disponibilidade historica nao bastam para publicar novas series. Cada ampliacao precisa passar por:

1. matriz de disponibilidade por estacao, poluente e ano;
2. coleta cacheada com sessao isolada por consulta;
3. auditoria de unidade, escala, zeros persistentes, picos extremos e cobertura;
4. relatorio publico antes de exposicao na UI.

## Roteiro tecnico de proxima coleta

Scripts locais relevantes ja existentes:

- `scripts/inea-weblakes-availability-matrix.ts`
- `scripts/inea-weblakes-contract-audit.ts`
- `scripts/inea-weblakes-collect-incremental.ts`
- `scripts/inea-weblakes-historical-extract.ts`
- `scripts/inea-weblakes-historical-import-aggregates.ts`
- `scripts/generate-attention-episodes.ts`
- `scripts/generate-csv-exports.ts`

Proxima etapa recomendada:

1. Rodar matriz de disponibilidade em modo amostral para NO2, O3, PTS e PM2.5 2020.
2. Comparar retorno por unidade e escala com `src/lib/inea/weblakesDictionary.ts`.
3. Separar PTS e particulas sedimentaveis/po preto como eixo proprio de deposicao material, sem misturar com IQAr, OMS ou particulados inalaveis.
4. Publicar apenas os achados que passarem pela auditoria de cobertura e defensabilidade.

## Decisao metodologica

O Radar deve fortalecer a pesquisa historica, mas preservar a confianca publica. A regra para evoluir e: ampliar primeiro o mapa de evidencia, depois a coleta, depois a auditoria, e so entao a visualizacao.
