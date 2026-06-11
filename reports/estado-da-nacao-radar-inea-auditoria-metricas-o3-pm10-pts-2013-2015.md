# Estado da Nacao — Radar INEA: auditoria de metricas 2013-2015

Data: 2026-06-10

## Objetivo

Auditar se a diferenca entre o preview WebLakes/INEA e o artigo RBCIAMB decorre de criterio de media diaria, cobertura minima, maximo horario ou janela movel.

## Artefatos gerados

- Script: `scripts/inea-weblakes-preview-metric-audit.ts`
- JSON: `reports/open-data-preview/inea-2013-2015-daily/metric-audit.json`
- CSV: `reports/open-data-preview/inea-2013-2015-daily/metric-audit.csv`

## Resultado agregado

| Poluente | Media diaria >=18h | Media horaria global | Max. media diaria >=18h | Max. horario | Max. movel 8h |
| :--- | ---: | ---: | ---: | ---: | ---: |
| PM10 | 29,65 | 29,65 | 144,73 | 575,41 | N/A |
| PTS | 44,05 | 44,08 | 194,82 | 837,31 | N/A |
| O3 | 35,25 | 35,18 | 92,81 | 197,56 | 157,90 |

## Comparacao com o artigo

### PM10

O artigo indica media diaria do trienio de 29,45 µg/m3. O preview encontrou 29,65 µg/m3 usando dias com pelo menos 18h validas.

Leitura: a convergencia e forte. A diferenca residual e compativel com criterio de cobertura, arredondamento ou recorte de dados.

### PTS

O artigo indica media diaria do trienio de 43,28 µg/m3. O preview encontrou 44,05 µg/m3.

Leitura: a convergencia tambem e forte. PTS e recuperavel como camada historica tecnica, mas nao como IQAr nem como alerta operacional.

### O3

O artigo indica media diaria do trienio de 41,34 µg/m3. O preview encontrou:

- media diaria >=18h: 35,25 µg/m3;
- media horaria global: 35,18 µg/m3;
- maior media diaria >=18h: 92,81 µg/m3;
- maior valor horario: 197,56 µg/m3;
- maior media movel 8h: 157,90 µg/m3.

Leitura: a diferenca nao parece ser explicada pela regra de 18h, porque a media horaria global e a media diaria com cobertura minima sao praticamente iguais. A hipotese mais provavel e que o artigo tenha usado outra regra de agregacao, outro recorte de estacoes/dias, ou uma serie pre-processada/validada diferente da consulta publica WebLakes atual.

## O3 por estacao

| Estacao | Ano | Media diaria >=18h | Max. media diaria >=18h | Max. horario | Max. movel 8h |
| :--- | ---: | ---: | ---: | ---: | ---: |
| VR-Belmonte | 2013 | 27,49 | 58,79 | 101,06 | 86,90 |
| VR-Belmonte | 2014 | 36,19 | 87,44 | 173,57 | 147,89 |
| VR-Belmonte | 2015 | 31,44 | 92,81 | 197,56 | 131,88 |
| VR-Retiro | 2013 | 35,49 | 69,59 | 112,04 | 98,44 |
| VR-Retiro | 2014 | 39,69 | 85,03 | 171,33 | 157,90 |
| VR-Retiro | 2015 | 34,91 | 91,41 | 173,90 | 130,33 |
| VR-Santa Cecilia | 2013 | 40,12 | 71,09 | 127,74 | 105,31 |
| VR-Santa Cecilia | 2014 | 36,13 | 86,23 | 196,19 | 135,17 |
| VR-Santa Cecilia | 2015 | 36,76 | 92,69 | 176,26 | 140,59 |

## Decisao metodologica

1. PM10 pode avancar para uma proposta de dataset historico auditado.
2. PTS pode avancar para memoria historica tecnica, separado de IQAr.
3. O3 deve ficar em auditoria ate identificarmos a metrica exata usada pela literatura ou por relatorios oficiais do INEA.

## Proxima etapa

Criar um pacote publico minimo apenas para PM10 historico 2013-2015, ou manter a proxima rodada como relatorio pedagogico de memoria historica sem expor O3 como dado consolidado.
