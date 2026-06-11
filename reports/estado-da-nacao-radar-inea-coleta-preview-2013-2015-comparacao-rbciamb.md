# Estado da Nacao — Radar INEA: coleta preview 2013-2015 e comparacao RBCIAMB

Data: 2026-06-10

## Objetivo

Coletar, em ambiente de preview tecnico, dados diarios derivados de leituras horarias WebLakes/INEA para o trienio 2013-2015 e comparar os agregados com o artigo cientifico sobre poluicao do ar e internacoes respiratorias em Volta Redonda.

## Escopo executado

- Estacoes: VR-Belmonte, VR-Retiro e VR-Santa Cecilia.
- Poluentes: PM10, PTS e O3.
- Anos: 2013, 2014 e 2015.
- Fonte operacional: endpoint publico WebLakes/INEA ja usado pelo Radar.
- Destino: `reports/open-data-preview/inea-2013-2015-daily/`.

Scripts criados:

- `scripts/inea-weblakes-preview-collect-daily.ts`
- `scripts/inea-weblakes-preview-consolidate-daily.ts`

Arquivos principais gerados:

- `reports/open-data-preview/inea-2013-2015-daily/aggregate-summary.json`
- `reports/open-data-preview/inea-2013-2015-daily/aggregate-summary.csv`
- `reports/open-data-preview/inea-2013-2015-daily/daily-all.json`
- arquivos diarios por poluente, estacao e ano em CSV/JSON.

## Volume coletado

- Linhas agregadas: 27.
- Linhas diarias: 9.358.
- Periodo: 2013-01-01 a 2015-12-31.
- Nenhum arquivo foi publicado em `public/data/air`.
- O manifesto publico nao foi alterado.

## Comparacao com artigo RBCIAMB

Valores citados no acervo bibliografico local:

| Poluente | Artigo: media diaria trienio | Preview: media diaria ponderada | Leitura |
| :--- | ---: | ---: | :--- |
| PM10 | 29,45 µg/m3 | 29,65 µg/m3 | Muito proximo; forte validacao cruzada. |
| PTS | 43,28 µg/m3 | 44,05 µg/m3 | Muito proximo; reforca recuperabilidade historica. |
| O3 | 41,34 µg/m3 | 35,25 µg/m3 | Divergencia relevante; exige auditoria de metrica e janela antes de publicar. |

## Maximos diarios

| Poluente | Artigo: maximo diario | Preview: maior media diaria | Leitura |
| :--- | ---: | ---: | :--- |
| PM10 | 132,76 µg/m3 | 144,73 µg/m3 | Proximo, mas maior no preview; verificar criterio de agregacao. |
| PTS | 172,39 µg/m3 | 194,82 µg/m3 | Proximo, mas maior no preview; verificar cobertura e estacao dominante. |
| O3 | 108,12 µg/m3 | 92,81 µg/m3 | Menor no preview; pode indicar diferenca entre media diaria, maximo horario ou janela normativa. |

## Cobertura por poluente

| Poluente | Dias validos >=18h | Cobertura minima anual/estacao | Cobertura maxima anual/estacao |
| :--- | ---: | ---: | ---: |
| PM10 | 3.013 | 87,09% | 95,23% |
| PTS | 2.773 | 54,78% | 95,40% |
| O3 | 2.966 | 84,41% | 98,05% |

## Interpretacao

### PM10

O preview reproduz a ordem de grandeza do artigo com diferenca muito pequena na media trienal. Isso indica que o endpoint historico, o parser e a regra diaria de 18h estao coerentes para PM10.

Decisao: candidato forte para validacao cruzada formal e publicacao futura como camada historica auditada.

### PTS

A media trienal tambem ficou muito proxima do artigo. A cobertura de Santa Cecilia em 2013 e 2014, no entanto, exige cautela. PTS deve continuar separado da camada de IQAr e tratado como memoria historica/tecnica de poeira total.

Decisao: candidato forte para relatorio historico-tecnico, mas nao para alerta cidadao operacional.

### O3

O preview confirma dados historicos para O3, mas a media ficou abaixo do artigo. A diferenca pode decorrer de:

- uso de media diaria simples no preview;
- artigo usando outra janela ou tratamento estatistico;
- diferenca entre media diaria, maximo diario de medias horarias ou serie pre-processada;
- dias com cobertura baixa descartados de forma diferente.

Decisao: nao publicar O3 historico antes de auditoria da metrica exata.

## Proxima etapa recomendada

1. Criar auditoria de comparacao RBCIAMB por metrica: media diaria simples, maximo horario diario, maximo de media movel quando aplicavel e criterios de cobertura.
2. Gerar tabela por estacao para identificar quem explica os maximos de PM10, PTS e O3.
3. Separar uma proposta de pagina publica futura chamada "Memoria historica da qualidade do ar em Volta Redonda".
4. Manter todos os arquivos desta rodada como preview ate a auditoria de publicacao.

## Decisao de publicacao

Nao publicar ainda.

Esta rodada confirmou recuperabilidade historica forte, mas os dados permanecem como preview tecnico. Publicacao exige:

- dicionario de dados;
- manifest proprio;
- QA de linguagem;
- QA de cobertura;
- relatorio metodologico final;
- decisao visual separando PM10, PTS e O3 em camadas pedagogicas distintas.
