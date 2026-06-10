# Estado da Nacao — Radar INEA: varredura historica amostral 2013-2015

Data: 2026-06-10

## Escopo

Foi criada e executada uma ferramenta parametrizada de disponibilidade historica para testar, em escopo pequeno, se o SIGQAr/AQMIS/WebLakes ainda retorna dados horarios de Volta Redonda no periodo usado pelo artigo cientifico sobre poluicao do ar e internacoes respiratorias.

Script novo:

```bash
npx tsx scripts/inea-weblakes-availability-scope.ts \
  --stations=69,70,71 \
  --pollutants=PM10,PTS,O3 \
  --years=2013:2015 \
  --samples=jan,apr,jul,sep \
  --out=reports/open-data-preview/availability-2013-2015-pm10-pts-o3.json
```

Saida gerada:

- `reports/open-data-preview/availability-2013-2015-pm10-pts-o3.json`

## Metodologia da varredura

- Estacoes: VR-Belmonte, VR-Retiro e VR-Santa Cecilia.
- Poluentes: PM10, PTS e O3.
- Anos: 2013, 2014 e 2015.
- Janelas amostrais: 01-03 de janeiro, abril, julho e setembro.
- Cada janela tem 3 dias, com consulta ao endpoint publico WebLakes.
- O resultado avalia disponibilidade, unidade, parser, minimos, maximos, medias amostrais e zeros.

Importante: esta varredura nao e uma serie completa. Ela serve para decidir se vale coletar o periodo completo com auditoria.

## Resultado resumido

| Poluente | Resultado amostral | Decisao tecnica |
| :--- | :--- | :--- |
| PM10 | 9/9 combinacoes estacao-ano disponiveis | Forte candidato para validacao cruzada com artigo e serie publica. |
| PTS | 7/9 disponiveis e 2/9 provavelmente disponiveis | Candidato historico-tecnico, com cautela em Santa Cecilia 2013-2014. |
| O3 | 9/9 combinacoes estacao-ano disponiveis | Forte candidato para camada historica descontínua 2013-2015. |

## Achados por poluente

### PM10

Todas as combinacoes retornaram dados fisicos nas quatro janelas amostrais.

Faixas amostrais observadas:

- Belmonte: maximos entre 142,97 e 311,98 µg/m3.
- Retiro: maximos entre 87,66 e 416,00 µg/m3.
- Santa Cecilia: maximos entre 104,19 e 118,29 µg/m3.

Leitura: a disponibilidade historica esta confirmada para o recorte 2013-2015. O proximo passo e comparar estatisticas agregadas com o artigo RBCIAMB antes de qualquer alteracao publica.

### PTS

Belmonte e Retiro retornaram 4/4 janelas em 2013, 2014 e 2015. Santa Cecilia retornou 2/4 janelas em 2013 e 2014, e 4/4 em 2015.

Faixas amostrais observadas:

- Belmonte: maximos entre 306,96 e 433,39 µg/m3.
- Retiro: maximos entre 144,15 e 837,31 µg/m3.
- Santa Cecilia: maximos entre 146,69 e 208,32 µg/m3 nas janelas com dados.

Leitura: PTS existe historicamente e dialoga com o artigo cientifico, mas deve permanecer fora da camada de IQAr. O uso correto e como eixo de memoria historica, poeira total e auditoria tecnica.

### O3

Todas as combinacoes retornaram dados fisicos nas quatro janelas amostrais.

Faixas amostrais observadas:

- Belmonte: maximos entre 70,32 e 109,51 µg/m3.
- Retiro: maximos entre 91,99 e 101,75 µg/m3.
- Santa Cecilia: maximos entre 93,45 e 127,74 µg/m3.

Leitura: O3 historico 2013-2015 e recuperavel. Como a auditoria de 2024 apontou indisponibilidade no ano recente, a eventual publicacao deve ser historica e descontínua, nunca apresentada como sensor ativo atual.

## Decisao

Ha base tecnica suficiente para uma proxima rodada de coleta completa, mas ainda restrita a cache/auditoria:

1. Coletar PM10, PTS e O3 no trienio 2013-2015 para as tres estacoes.
2. Calcular medias diarias e estatisticas comparaveis ao artigo RBCIAMB.
3. Verificar divergencias de escala, cobertura e maximos.
4. Publicar apenas um relatorio de comparacao antes de qualquer CSV publico.

## Nao publicar ainda

Esta rodada nao altera `public/data/air/manifest.json`, nao cria novo dataset publico e nao muda a interface do Radar.

Motivo: a varredura confirma disponibilidade, mas ainda nao substitui auditoria completa de cobertura, unidade, duplicidade, extremos e coerencia bibliografica.
