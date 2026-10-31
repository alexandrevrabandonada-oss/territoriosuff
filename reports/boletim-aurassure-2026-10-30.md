# SEMEAR / UFF + Associação Popular pela Sustentabilidade — Boletim do ar

**Data de referência:** 30/10/2026  
**Estações e fabricante:** UFF — Vila Santa Cecília, IFRJ — Nossa Senhora das Graças, CRIAAD — Vila Mury; três sensores **Aurassure**, conforme identificação informada junto ao relatório.  
**Fonte:** relatório diário “qualidade do ar, UFF Volta Redonda”, enviado para publicação.  
**Estado dos dados:** números reproduzidos do resumo recebido, sem recálculo nem checagem independente de arquivos brutos.  
**Granularidade:** 96 janelas de 15 minutos por estação no dia (100% de disponibilidade informada nos três pontos).

## PM2.5 — médias e máximos (µg/m³)

| Estação | Média do dia | Maior valor em 15 minutos | Horário | Dados disponíveis |
|---|---:|---:|---|---:|
| UFF — Vila Santa Cecília | 4,9 | 17,7 | 11h45 | 100% |
| IFRJ — Nossa Senhora das Graças | 7,5 | 31,1 | 11h30 | 100% |
| CRIAAD — Vila Mury | 6,6 | 31,6 | 11h30 | 100% |

**Achado:** os maiores valores do PM2.5 foram registrados na mesma faixa de horário (11h30–11h45). A simultaneidade é relevante para uma análise conjunta com dados meteorológicos e de fontes emissoras, mas não identifica sua origem.

## NO₂ — médias e máximos (ppb)

| Estação | Média do dia | Maior valor em 15 minutos | Horário | Dados disponíveis |
|---|---:|---:|---|---:|
| UFF — Vila Santa Cecília | 37,1 | 52,1 | 16h30 | 100% |
| IFRJ — Nossa Senhora das Graças | 3,0 | 10,1 | 07h00 | 100% |
| CRIAAD — Vila Mury | 4,6 | 18,9 | 14h30 | 100% |

A média de NO₂ da estação UFF é consideravelmente superior às outras duas. **Isso exige investigação de diferenças reais entre locais, posicionamento dos sensores, condições ambientais e calibração; não identifica a fonte por si só.**

## Índice AQI — máximos reportados (escala ainda não auditada)

- UFF — Vila Santa Cecília: **33**
- IFRJ — Nossa Senhora das Graças: **94**
- CRIAAD — Vila Mury: **80**

Os números são reproduzidos com fidelidade, **mas não recebem classificação “boa”, “moderada” ou similar** até confirmação da escala utilizada, janelas temporais, fórmula, fontes de entrada e critérios de validade.

## Disponibilidade e alertas

As três estações tiveram **100% das 96 janelas de 15 minutos** reportadas. A mensagem automática indica **nenhuma estação com alerta aberto**. Isso descreve o sistema de alertas e **não comprova ausência de poluentes ou de risco à saúde**.

## Comparação responsável com o dia anterior (29/10/2026)

| Estação | Média PM2.5 em 29/10 | Média PM2.5 em 30/10 | Interpretação |
|---|---:|---:|---|
| UFF — Vila Santa Cecília | 8,6 | 4,9 | Queda de 3,7 µg/m³ (≈43%) |
| IFRJ — Nossa Senhora das Graças | 8,2 | 7,5 | Queda de 0,7 µg/m³ (≈8,5%) |
| CRIAAD — Vila Mury | 18,6* | 6,6 | **Não comparar médias diárias:** 29/10 teve só 32% de janelas |

No dia 29 os picos de PM2.5 ocorreram à noite; no dia 30, no fim da manhã. A sequência de dois dias é insuficiente para identificar tendência ou causalidade.

## Limitações, metodologia e verificação

1. A recomendação da **OMS de 15 µg/m³ para PM2.5 é uma média de 24 horas**, não se aplica individualmente a picos de 15 minutos. Dados de sensores complementares devem ser contextualizados quanto a calibração e incerteza. Referência: [OMS, diretrizes globais 2021](https://www.ncbi.nlm.nih.gov/books/NBK574591/table/ch3.tab26/).
2. O valor máximo de NO₂ de **540,6 ppb** apresentado no boletim de **29/10** para o CRIAAD estava na retomada da cobertura parcial e **permanece pendente de validação**. O registro de 30/10 não confirma nem refuta o pico anterior.
3. A ausência de alertas automáticos abertos não implica qualidade do ar satisfatória.
4. Foram informados os arquivos `dados_15min_2026-10-30.csv` e `dados_brutos_2026-10-30.csv`. **Os arquivos não foram recebidos aqui; somente o resumo diário foi disponibilizado.** Não se afirma auditoria dos CSVs.
5. Falta confirmar os metadados de localização exata, sensor e calibração, fuso horário das janelas, método de cálculo das médias e definição do AQI.

**Projeto UFF SEMEAR + Associação Popular pela Sustentabilidade (APS)** — informação pública, ciência cidadã e transparência ambiental. Versão 1.0; sujeito a revisão quando dados brutos estiverem disponíveis.
