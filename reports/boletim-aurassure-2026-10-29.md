# SEMEAR | Boletim da qualidade do ar em Volta Redonda

**Data das medições:** 29/10/2026  
**Publicação:** 30/10/2026  
**Origem:** relatório diário identificado como “UFF Volta Redonda — médias de 15 min — 29/10/2026”, recebido pelo projeto. Fabricante dos três sensores: **Aurassure**, conforme informação do responsável pelo relatório.  
**Natureza:** divulgação de dados experimentais de sensores complementares; não é boletim regulatório do INEA.  
**Status:** versão 1.0, valores transcritos do resumo recebido, **não recalculados a partir dos arquivos brutos**.

## Síntese

Três pontos de monitoramento — **UFF (Vila Santa Cecília)**, **IFRJ (Nossa Senhora das Graças)** e **CRIAAD (Vila Mury)** — registraram elevação de **PM2.5** no período noturno, com máximos respectivos de **37,1**, **39,9** e **36,8 µg/m³**, entre 21h e 22h. O comportamento semelhante das séries justifica investigação da meteorologia e de possíveis fontes emissoras, mas **não identifica a origem dos poluentes**.

O conjunto apresenta duas limitações fundamentais: a cobertura do sensor da Vila Mury foi de somente **32%**; e seu pico extremo de NO₂, **540,6 ppb**, ocorreu na retomada das observações, exigindo validação antes de qualquer interpretação ambiental conclusiva.

## PM2.5 (µg/m³)

| Local do sensor | Média das janelas disponíveis | Máximo em janela de 15 min | Horário informado | Cobertura das 96 janelas |
|---|---:|---:|---|---:|
| UFF — Vila Santa Cecília | 8,6 | 37,1 | 22h00 | 100% |
| IFRJ — Nossa Senhora das Graças | 8,2 | 39,9 | 21h30 | 100% |
| CRIAAD — Vila Mury | 18,6* | 36,8 | 21h00 | 32% |

**Atenção:** *A média da Vila Mury representa apenas o período com leitura disponível e não pode ser tratada como média de 24 horas.*

## NO₂ (ppb)

| Local do sensor | Média das janelas disponíveis | Máximo em janela de 15 min | Horário informado | Cobertura das 96 janelas |
|---|---:|---:|---|---:|
| UFF — Vila Santa Cecília | 34,9 | 48,9 | 12h00 | 100% |
| IFRJ — Nossa Senhora das Graças | 2,5 | 13,3 | 18h00 | 100% |
| CRIAAD — Vila Mury | 37,4* | 540,6* | 16h30 | 32% |

**Atenção:** *No CRIAAD, a cobertura é incompleta. O registro de 540,6 ppb está pendente de validação instrumental e análise dos CSVs brutos; não se afirma que tenha ocorrido um pico real dessa magnitude.*

## Interpretação responsável

1. As três séries de PM2.5 mostram elevação aproximadamente simultânea durante a noite. Isso é um **sinal de interesse investigativo**, não uma atribuição causal a qualquer instalação industrial ou outra fonte.
2. A diretriz da OMS para PM2.5 é de **15 µg/m³ em média de 24 horas**, não por intervalo de 15 minutos. Portanto, **não comparar diretamente os picos de 15 minutos com esse parâmetro**. Ver [diretrizes globais da OMS, 2021](https://www.ncbi.nlm.nih.gov/books/NBK574591/table/ch3.tab26/).
3. A média da Vila Mury não é comparável às médias diárias dos outros dois pontos porque faltam cerca de 68% das janelas esperadas.
4. Os valores de **AQI máximo** informados na mensagem de origem (UFF 36; IFRJ 90; CRIAAD 3) **não são adotados como classificação neste boletim**: faltam esclarecimentos sobre escala, janela de cálculo e coerência com as concentrações.
5. A indicação automática de que não há alerta aberto **não garante ausência de poluição**.
6. Não foi calculada uma média municipal: são estações em locais distintos, com possíveis diferenças de calibração e cobertura.

## Transparência, auditabilidade e próximos controles

- **Fonte numérica:** resumo diário recebido, com nomes de arquivos de origem informados como `dados_15min_2026-10-29.csv` e `dados_brutos_2026-10-29.csv`. Esses arquivos **não estavam anexados a esta publicação**; não se afirma que tenham sido auditados.
- **Granularidade:** séries anunciadas como médias de 15 minutos, até 96 observações por sensor e dia.
- **Validação pendente:** documentação técnica e calibração dos sensores, verificação da leitura inicial de NO₂ no CRIAAD, metadados de fuso horário, tratamento de ausências e cálculo da escala AQI.
- **Correções:** o SEMEAR deverá preservar o histórico de revisões caso o acesso aos arquivos brutos ou a validação altere algum valor.

**SEMEAR — transparência ambiental, ciência cidadã e direito à informação.**
