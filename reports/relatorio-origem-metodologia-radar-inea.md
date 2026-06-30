# Relatorio tecnico: origem das informacoes e metodologia do Radar INEA

Data: 30/06/2026  
Portal: SEMEAR UFF  
Modulo: Radar INEA / Observatorio do Ar  
Ciclo publico: 2026.06-a  
Versao do dataset: 1.6.2  
Versao metodologica: 2026-06-16  

## 1. Objetivo

Este relatorio explica de onde vieram as informacoes apresentadas no Radar INEA e qual metodologia foi usada para transformar dados publicos ambientais em indicadores historicos, territoriais e comparaveis.

O Radar INEA foi estruturado como ferramenta de transparencia publica, auditoria cidada e apoio a leitura territorial da qualidade do ar em Volta Redonda-RJ. Ele nao substitui documentos oficiais, laudos periciais, diagnosticos clinicos, estudos de atribuicao de fonte emissora ou conclusoes juridicas finais.

## 2. Resumo executivo

As informacoes do Radar INEA vieram principalmente de duas bases publicas:

1. INEA/WebLakes: plataforma publica de consulta de concentracoes horarias de poluentes e variaveis associadas a estacoes automaticas de monitoramento.
2. INEA / Dados Abertos RJ: arquivo publico `qualidade_ar.xlsx`, disponibilizado no portal de dados abertos do Estado do Rio de Janeiro, com informacoes de IQAr e subindices.

O SEMEAR processa essas bases, padroniza campos, calcula indicadores derivados, publica arquivos CSV auditaveis e apresenta os resultados com ressalvas explicitas sobre cobertura, ausencia de QA/QC oficial por registro horario e limites de interpretacao.

## 3. Fontes de informacao

### 3.1 INEA/WebLakes

A principal base historica do Radar INEA vem dos dados horarios publicos exibidos na plataforma INEA/WebLakes, acessada pelo dominio publico `qualidadedoar.inea.rj.gov.br`.

No portal, essa fonte e tratada como:

`WEBLAKES_CONCENTRATION_WITH_WIND`

Ela fornece leituras horarias de concentracao fisica dos poluentes, com unidade ambiental propria, por exemplo:

- PM10 em ug/m3;
- PM2.5 em ug/m3;
- SO2 em ug/m3;
- CO em ppm, na unidade nativa da plataforma.

As estacoes principais do Radar INEA em Volta Redonda sao:

- VR-Belmonte, identificador 69;
- VR-Retiro, identificador 70;
- VR-Santa Cecilia, identificador 71.

A plataforma WebLakes tambem disponibiliza dados associados ao horario da leitura, como vento, quando presentes na tabela publica consultada.

### 3.2 INEA / Dados Abertos RJ

A segunda fonte e o arquivo publico `qualidade_ar.xlsx`, associado ao portal Dados Abertos RJ.

No pipeline do SEMEAR, essa fonte e tratada como:

`CKAN_XLSX`

O arquivo e usado para leitura de informacoes oficiais de IQAr e subindices por poluente. A URL documentada no codigo de importacao e:

`https://dadosabertos.rj.gov.br/dataset/fc10bd4a-3cc6-4bd6-9ed7-0fcfde297fa0/resource/21557b65-3f33-4a17-9d7f-daa7ba82af78/download/qualidade_ar.xlsx`

Essa base nao deve ser confundida com os microdados horarios de concentracao fisica do WebLakes. O arquivo de Dados Abertos trabalha com IQAr e subindices, que sao medidas adimensionais de indice de qualidade do ar.

### 3.3 Arquivos derivados SEMEAR

A partir das bases publicas, o SEMEAR gera arquivos derivados para auditoria e reuso publico:

- manifestos de dados;
- dicionario de dados;
- series temporais em CSV;
- resumos por estacao;
- episodios de atencao;
- metadados de versao e revisao metodologica.

Esses arquivos derivados nao criam medicao ambiental propria. Eles documentam, padronizam e agregam dados publicos de origem governamental.

## 4. Diferenca entre concentracao fisica e IQAr

Uma decisao metodologica central do Radar e separar claramente dois tipos de informacao:

### Concentracao fisica

Vem do INEA/WebLakes e representa valores medidos ou exibidos por estacao e horario, como ug/m3 ou ppm. E a base usada para medias, picos, cobertura horaria e comparacoes experimentais com referencias da OMS e da CONAMA.

### IQAr e subindices

Vem do arquivo `qualidade_ar.xlsx` dos Dados Abertos RJ. O IQAr e um indice adimensional, isto e, nao e a mesma coisa que concentracao fisica em ug/m3 ou ppm.

Por isso, o Radar evita misturar diretamente IQAr com concentracoes fisicas. Quando usa cada base, identifica a fonte, a unidade e o tipo de indicador.

## 5. Coleta e normalizacao dos dados

### 5.1 Coleta WebLakes

A coleta tecnica do WebLakes segue a consulta publica da propria plataforma. O cliente do SEMEAR:

- inicia uma sessao publica no WebLakes;
- seleciona estacao;
- seleciona parametro/poluente;
- define intervalo de datas;
- consulta a grade publica `ConcentrationWithWindArrows/GridData`;
- normaliza as linhas retornadas em um formato padrao.

Para reduzir risco de erro por estado de sessao ou contaminacao de filtros, o modo seguro de coleta divide a consulta em janelas diarias, usa sessoes novas e aplica tentativas com intervalo de espera. Essa escolha privilegia confiabilidade e cortesia com a plataforma publica, mesmo sendo mais lenta.

Cada registro normalizado preserva:

- fonte;
- sistema de origem;
- estacao;
- poluente;
- data e hora;
- valor;
- unidade;
- vento, quando presente;
- linha bruta de origem;
- status tecnico de validacao interna.

### 5.2 Tratamento de qualidade no WebLakes

A tabela publica consultada no WebLakes nao apresenta, por registro horario, uma flag oficial explicita de QA/QC. Por esse motivo, o Radar classifica essas series como:

`RAW_PUBLIC_PLATFORM`

E adota o aviso metodologico:

`Dado horario publico WebLakes - comparacao experimental - sem QA/QC oficial explicito`

Isso significa que as comparacoes com OMS e CONAMA sao apresentadas como leitura experimental de interesse publico, nao como validacao oficial por observacao.

### 5.3 Coleta Dados Abertos RJ

O arquivo `qualidade_ar.xlsx` e baixado ou lido em cache, convertido para linhas estruturadas e filtrado para o municipio de Volta Redonda.

No tratamento documentado, as colunas de IQA por poluente sao mapeadas assim:

- `IQA MP10` para PM10;
- `IQA MP2,5` para PM2.5;
- `IQA SO2` para SO2;
- `IQA NO2` para NO2;
- `IQA O3` para O3;
- `IQA CO` para CO;
- `Indice IQAr` para o indice geral.

Esses registros sao classificados como subindices ou indice geral, sem unidade fisica, porque IQAr e adimensional.

## 6. Periodo e cobertura das series

As series publicas variam por poluente e disponibilidade:

- PM10, SO2 e CO possuem recortes historicos que chegam a 2013-2026;
- PM2.5 passa a aparecer nos recortes consolidados a partir de 2021;
- alguns paineis de particulados e episodios usam recortes 2020-2026;
- 2026 e ano parcial e nao deve ser comparado diretamente com anos civis completos sem ressalva.

O Radar sempre deve ser lido considerando cobertura temporal. Ausencia de dado nao significa ar bom. Pode significar falha de transmissao, indisponibilidade publica, interrupcao de medicao, lacuna de coleta ou ausencia de registro valido.

## 7. Indicadores calculados

O SEMEAR calcula indicadores derivados a partir dos dados publicos normalizados.

### 7.1 Medias horarias disponiveis

Sao os valores horarios validos exibidos pela base publica apos normalizacao. Leituras invalidas, negativas ou sem data interpretavel sao descartadas.

### 7.2 Media diaria de 24 horas

E calculada como media aritmetica simples das leituras validas dentro de um mesmo dia civil.

Para um dia entrar em analises de media diaria, o criterio metodologico e ter pelo menos 18 horas validas.

### 7.3 Media anual

E calculada como media aritmetica simples das leituras horarias validas disponiveis no ano civil.

Nao ha imputacao de lacunas. O Radar nao preenche horarios ausentes por interpolacao, media historica ou estimativa estatistica.

### 7.4 Pico horario

Representa a maior leitura individual registrada em uma estacao, para um poluente, dentro do periodo analisado.

Pico horario e indicador de intensidade pontual. Ele nao equivale automaticamente a excedencia de limites que dependem de media diaria ou media movel.

### 7.5 Cobertura de dados

A cobertura e calculada como:

`horas validas observadas / horas teoricas do periodo`

O Radar usa os seguintes limiares:

- cobertura igual ou acima de 75%: minima para inclusao comparativa;
- cobertura igual ou acima de 90%: recomendada para maior consistencia anual;
- cobertura abaixo de 75%: interpretacao com forte ressalva.

### 7.6 Nivel de confianca

O nivel de confianca tecnica e derivado da cobertura:

- HIGH: cobertura igual ou superior a 90%;
- MEDIUM: cobertura igual ou superior a 75%;
- LOW: cobertura abaixo de 75% ou recorte parcial relevante.

Essa classificacao nao e uma certificacao oficial. E uma avaliacao metodologica do SEMEAR para orientar leitura publica.

## 8. Reguas de comparacao

O Radar usa duas reguas principais para contextualizar concentracoes:

### 8.1 Diretrizes da OMS

Usadas como referencia de saude publica. As comparacoes sao experimentais e nao representam padrao legal brasileiro obrigatorio.

Valores documentados no dicionario de dados:

- PM10: 45 ug/m3 em 24h;
- PM2.5: 15 ug/m3 em 24h;
- SO2: 40 ug/m3 em 24h;
- CO: 4 mg/m3.

Para comparacao de CO com a regua da OMS, o valor em ppm e convertido para mg/m3 pelo fator 1,145.

### 8.2 CONAMA 506/2024

Usada como referencia normativa brasileira. O Radar documenta a comparacao com o padrao intermediario PI-1.

Valores documentados:

- PM10: 120 ug/m3 em 24h;
- PM2.5: 60 ug/m3 em 24h;
- SO2: 125 ug/m3 em 24h;
- CO: 9 ppm em media movel de 8h.

As comparacoes sao tratadas com cautela porque a base publica horaria do WebLakes nao traz QA/QC oficial explicito por registro.

## 9. Governanca editorial e bloqueios metodologicos

O Radar adota salvaguardas para reduzir risco de conclusoes indevidas:

- NO2 permanece bloqueado por salvaguarda editorial quando a consistencia metodologica nao e suficiente;
- O3 e PTS aparecem apenas como memoria historica, quarentena ou auditoria, fora dos paineis consolidados;
- valores zero sao preservados por fidelidade a fonte, mas marcados para revisao tecnica quando aplicavel;
- series com baixa cobertura recebem alerta;
- 2026 e marcado como parcial;
- lacunas nao sao convertidas em conclusao positiva;
- comparacoes com OMS e CONAMA sao explicitamente descritas como experimentais quando baseadas em dados WebLakes sem QA/QC oficial por observacao.

## 10. Protocolo de interesse publico

O Radar deve ser usado como instrumento de transparencia, priorizacao e controle social.

Uso adequado:

- acompanhar historico de qualidade do ar;
- comparar estacoes e periodos com ressalva de cobertura;
- identificar lacunas de dados publicos;
- apoiar perguntas a orgaos publicos;
- subsidiar comunicacao publica responsavel;
- orientar pedidos de informacao e auditoria cidada.

Uso inadequado:

- apresentar o Radar como laudo pericial;
- afirmar causalidade juridica individual;
- diagnosticar doencas;
- imputar responsabilidade a fonte emissora especifica sem estudo proprio;
- citar numero isolado sem unidade, periodo, estacao, cobertura e metodologia;
- tratar ausencia de dado como ausencia de poluicao.

## 11. Rastreabilidade e reproducibilidade

O portal mantem artefatos publicos e internos que permitem auditar a origem e a transformacao dos dados:

- dicionario de dados;
- manifestos de arquivos publicos;
- CSVs de series e resumos;
- metadados de release;
- historico de revisoes;
- notas de validacao;
- rotinas de smoke test e checagem de integridade.

A rastreabilidade segue a logica:

`fonte publica governamental -> normalizacao SEMEAR -> indicadores derivados -> arquivos auditaveis -> visualizacao no portal`

## 12. Limitacoes conhecidas

As principais limitacoes sao:

1. A plataforma WebLakes, na tabela publica consultada, nao fornece QA/QC oficial explicito por registro horario.
2. O arquivo `qualidade_ar.xlsx` contem IQAr e subindices, nao concentracoes fisicas equivalentes aos microdados horarios.
3. Nem todos os poluentes possuem a mesma profundidade historica.
4. A cobertura pode variar por estacao, poluente e ano.
5. Dados ausentes nao significam ar limpo.
6. O ano de 2026 e parcial.
7. Comparacoes com OMS e CONAMA dependem de agregacoes feitas pelo SEMEAR e devem ser lidas com as ressalvas publicadas.
8. O Radar nao atribui fonte emissora, nao prova dano individual e nao substitui fiscalizacao oficial.

## 13. Conclusao

O Radar INEA do SEMEAR e uma camada de transparencia publica construida sobre dados governamentais ja disponiveis ao publico. Seu valor esta em organizar, documentar, comparar e tornar auditaveis informacoes que, isoladamente, sao tecnicas e dispersas.

A metodologia adotada privilegia cautela, rastreabilidade e clareza: separa IQAr de concentracao fisica, explicita cobertura, nao imputa lacunas, sinaliza ausencia de QA/QC oficial por registro no WebLakes e limita o uso das comparacoes a uma leitura civica e experimental.

Para qualquer citacao externa, recomenda-se sempre informar:

- fonte original;
- estacao;
- poluente;
- periodo analisado;
- unidade;
- cobertura;
- versao do dataset;
- versao metodologica;
- ressalva de que o Radar nao e laudo pericial nem conclusao juridica final.
