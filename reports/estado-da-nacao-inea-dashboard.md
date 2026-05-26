# Relatório do Dashboard Público Radar do Ar INEA / Volta Redonda

**Data do Relatório:** 2026-05-26  
**Status da Implementação:** Concluído e Homologado  

---

## 1. Rotas Criadas (Frontend)

Mapeamos e criamos as seguintes rotas públicas na aplicação React:

1. **`/qualidade-ar`**: Landing page geral que apresenta e unifica as duas fontes de monitoramento de qualidade do ar em Volta Redonda: a Rede Cidadã SEMEAR UFF e o Radar do Ar oficial do INEA.
2. **`/qualidade-ar/inea`**: Dashboard público das estações do INEA. Exibe estatísticas de cobertura, mapa georreferenciado interativo, ranking de estações por dias degradados (Moderado ou pior), tabela da última leitura disponível na base pública e gráfico de série histórica integrada.
3. **`/qualidade-ar/inea/estacoes/:stationId`**: Página de detalhe por estação oficial. Apresenta a última leitura geolocalizada, os subíndices individuais de cada poluente monitorado (PM10, PM2.5, SO2, NO2, O3, CO) com suas respectivas classificações, a frequência histórica dos poluentes controladores e o gráfico de tendência do Índice geral.

---

## 2. APIs Criadas (Backend / Vercel Serverless Functions)

Criamos e testamos 5 novos endpoints de API pública sob a rota `/api/air/inea/*`:

* **`GET /api/air/inea/summary`**: Retorna dados de resumo consolidado, incluindo total de estações ativas, intervalo temporal coberto pelos registros, contagem total de leituras, dias com qualidade degradada (Moderada ou pior) e o poluente controlador mais recorrente na cidade.
* **`GET /api/air/inea/stations`**: Retorna o catálogo de estações ativas do INEA georreferenciadas (Belmonte, Retiro, Santa Cecília e Nossa Senhora das Graças).
* **`GET /api/air/inea/latest`**: Retorna a leitura mais recente (geral e subíndices de poluentes) disponível para cada uma das estações.
* **`GET /api/air/inea/timeseries`**: Retorna séries temporais históricas de medições parametrizadas por `stationId`, `metricType`, `pollutant`, `from` e `to`.
* **`GET /api/air/inea/classification-days`**: Consolida as classificações horárias por dia e estação, aplicando a regra metodológica de que a classificação final de um dia é definida pelo pior índice registrado na data (seguindo a escala: `PÉSSIMA` > `MUITO RUIM` > `RUIM` > `MODERADA` > `BOA`).

---

## 3. Campos Usados do Banco de Dados (`air_measurements`)

* `metric_type`: Distingue entre `POLLUTANT_SUBINDEX` (subíndice adimensional do poluente) e `GENERAL_AQI` (Índice geral consolidado).
* `air_quality_classification`: Classificação oficial (`BOA`, `MODERADA`, etc.) derivada da coluna original `"Classificação"`.
* `quality_flag`: Marcador de validade técnica, gravado como `"OK"`.
* `controlling_pollutant`: Poluente que determinou o índice geral daquela leitura.
* `unit`: Ajustado para `null` (adimensional) para todos os índices de IQA para evitar confusão com concentrações físicas brutas.

---

## 4. Limitações Metodológicas

1. **Apenas Índices e Subíndices**: O conjunto de dados atual exposto via Dados Abertos RJ contém exclusivamente índices e subíndices IQAr baseados no padrão oficial de divulgação. Não existem concentrações físicas de poluentes expressas em microgramas por metro cúbico ($\mu\text{g/m}^3$) ou partes por milhão ($\text{ppm}$).
2. **Atualização Batch (Dados Abertos)**: A planilha de qualidade do ar do Dados Abertos RJ é atualizada periodicamente e de forma assíncrona, não correspondendo a uma API pública de atualização contínua minuto a minuto.

---

## 5. Próximos Passos (Obtenção de Dados Brutos e Atualização Mais Frequente)

Para contornar as limitações metodológicas acima e enriquecer o painel Radar do Ar, os seguintes passos são sugeridos:

1. **API Não-Documentada do SIGQAR**:
   - Desenvolver um script ou função serverless agendada (via Cron / GitHub Actions) para investigar endpoints públicos carregados pelo frontend do SIGQAR, sem burlar autenticação, captcha, limites de acesso ou barreiras técnicas.
   - Extrair a carga de dados diretamente das requisições JSON que alimentam os gráficos e mapas dinâmicos do portal oficial, coletando os dados com maior frequência temporal disponível, caso exista endpoint público autorizado.
2. **Obtenção de Concentrações Físicas**:
   - Investigar os relatórios anuais da qualidade do ar publicados em PDF pelo INEA para obter fatores de conversão ou tabelas de médias históricas.
   - Solicitar a abertura do banco de concentrações brutas através da Lei de Acesso à Informação (LAI) junto à Ouvidoria Geral do Estado do Rio de Janeiro / INEA.
