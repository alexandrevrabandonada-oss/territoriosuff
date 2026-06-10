# Estado da Nacao — Radar INEA: pesquisa profunda de fontes historicas

Data: 2026-06-10

## Pergunta

Conseguimos mais dados historicos do INEA por fontes oficiais, artigos cientificos e scraping?

Resposta curta: sim, ha sinais fortes de que conseguimos ampliar a base historica, mas com tres niveis diferentes de confianca.

1. **Incorporavel com pipeline proprio:** dados horarios do SIGQAr/AQMIS/WebLakes que ja retornam em matriz amostral local.
2. **Incorporavel como evidencia bibliografica:** estatisticas publicadas em artigos, teses e relatorios, sem substituir a serie primaria.
3. **Dependente de LAI ou recuperacao documental:** relatorios anuais antigos do INEA que aparecem citados em artigos, mas cujos links legados hoje retornam 404 ou nao estao facilmente indexados.

## Fontes verificadas

### 1. SIGQAr / AQMIS / WebLakes

- Portal publico citado pelo Governo do Estado: https://portalsigqar.inea.rj.gov.br/
- Interface WebLakes/AQMIS usada pelo projeto: https://fat.ei.weblakes.com/INEA/
- O Governo do Estado afirma que os dados captados pelas estacoes ficam disponiveis no Portal de Qualidade do Ar do INEA.
- Apresentacao tecnica da Firjan/INEA tambem aponta o SIGQAr como sistema online de recebimento, envio e validacao de dados e documentos ligados ao monitoramento.

### 2. IEMA — Plataforma da Qualidade do Ar

- Produto: https://energiaeambiente.org.br/produto/plataforma-da-qualidade-do-ar
- Artigo metodologico 2024: https://app.periodikos.com.br/article/10.4322/rbaval202412031/pdf/rbaval-13-2%2Bspe-e133124.pdf

O IEMA informa que a plataforma integra, organiza, analisa e disponibiliza series historicas de concentracao de poluentes por estacao. A fonte combina dados abertos, relatorios anuais dos estados e compartilhamento direto dos orgaos ambientais.

Decisao: usar como fonte secundaria de validacao e possivel referencia para gap filling documental, mas nao misturar com os CSVs WebLakes sem marcacao explicita de origem.

### 3. Artigo RBCIAMB 2020 — Volta Redonda

- PDF: https://pdfs.semanticscholar.org/a5c9/e1d86da2fa0536d532ab9da9466dcaa432d8.pdf
- DOI citado internamente: https://doi.org/10.5327/Z2176-947820190537

O artigo confirma uso de dados horarios do INEA para Volta Redonda, entre 01/01/2013 e 31/12/2015, nas estacoes Belmonte, Vila Santa Cecilia e Retiro, cobrindo PM10, PTS, O3, temperatura e umidade.

O projeto ja possui `data/inea_historical_sources/seed-public-findings.json` com estatisticas extraidas desse artigo:

- PM10: media diaria agregada 2013-2015, maximo diario e contagem de excedencias.
- PTS: media diaria agregada 2013-2015 e maximo diario.
- O3: media diaria agregada 2013-2015, maximo diario e contagem de excedencias.
- Relatorio INEA 2015: sinais estruturados de maximo horario O3 em Belmonte e maximo diario PTS em Santa Cecilia.

Decisao: manter esses valores como evidencia bibliografica, nao como base primaria para graficos de serie temporal.

### 4. Relatorios anuais INEA citados em literatura

Foram encontrados citacoes recorrentes:

- Relatorio da Qualidade do Ar do Estado do Rio de Janeiro 2010 e 2011, 141p.
- Relatorio da Qualidade do Ar do Estado do Rio de Janeiro 2012, 148p.
- Relatorio da Qualidade do Ar do Estado do Rio de Janeiro 2013, 188p.
- Relatorio da Qualidade do Ar do Estado do Rio de Janeiro 2014, 198p.
- Relatorio da Qualidade do Ar do Estado do Rio de Janeiro 2018.

Tentativas de acesso direto a URLs legadas do dominio `inea.rj.gov.br/cs/groups/public/documents/document/*.pdf` retornaram 404 nesta rodada. Isso indica que os relatorios podem existir em acervo migrado, repositorios de terceiros ou exigirem pedido formal.

Decisao: abrir trilha de LAI/pedido de acervo para os PDFs anuais 2010-2018 e usar a literatura como indice de busca.

## Diagnostico da matriz local de disponibilidade

Arquivo local: `data/air/availability-matrix.json`

Resumo por poluente:

| Poluente | Periodo amostrado | Sinal de disponibilidade | Leitura |
| :--- | :--- | :--- | :--- |
| PM10 | 2013-2026 | 42 combinacoes estacao/ano com dados | Ja e a camada historica principal. |
| PM2.5 | 2021-2026 | 18 combinacoes estacao/ano com dados | Serie comecando em 2021; 2020 segue lacuna real. |
| SO2 | 2013-2026 | 42 combinacoes estacao/ano com dados | Boa candidata a consolidacao historica ampliada. |
| CO | 2013-2026 | 42 combinacoes estacao/ano com dados | Boa candidata a consolidacao historica ampliada, mantendo ppm. |
| NO2 | 2013-2026 | 42 combinacoes estacao/ano com dados | Candidata tecnica, mas bloqueada por auditoria de linha de base. |
| PTS | 2013-2026 | 42 combinacoes estacao/ano com dados | Candidata historica, mas exige auditoria de escala e separacao pedagogica. |
| O3 | 2013-2026 | 26 combinacoes estacao/ano com dados | Recuperavel para anos especificos; 2024 aparece indisponivel. |

## Achados principais

### PM10

Ja esta bem coberto no Radar. A pesquisa externa reforca que a serie 2013-2015 foi usada em estudo epidemiologico com dados horarios do INEA. A prioridade aqui e validacao cruzada, nao nova coleta.

### PM2.5

A matriz local confirma disponibilidade apenas a partir de 2021. Nao ha sinal forte de PM2.5 2020 na matriz. Nao preencher 2020 por inferencia.

### SO2 e CO

Ja existem linhas do tempo 2013-2026 no portal. A prioridade e melhorar interpretacao e abrir downloads anuais convenientes, se necessario. Sao candidatos de baixo risco comparado a NO2/PTS/O3.

### NO2

A disponibilidade amostral e forte, inclusive para 2013-2026, mas a auditoria de 2024 ja apontou risco de deslocamento de linha de base. Nao publicar como camada cidada ate existir auditoria longitudinal por estacao, comparando distribuicoes, zeros, minimos, medianas e diferencas entre Belmonte, Retiro e Santa Cecilia.

### PTS

Ha forte sinal historico, inclusive convergencia com artigo 2013-2015 e relatorios INEA. Mas PTS nao deve entrar como IQAr nem como particulado respiratorio fino. Precisa virar eixo separado: poeira total, deposicao, memoria industrial e fiscalizacao.

### O3

O3 aparece como recuperavel em 2013-2016 e em janelas pontuais posteriores, mas 2024 ficou zerado na auditoria anual. E candidato a uma camada historica descontínua, nao a painel operacional continuo.

## Plano seguro de scraping

### Etapa A — varredura curta

Usar `scripts/inea-weblakes-availability-matrix.ts` como base, mas criar uma versao parametrizada para evitar varredura completa quando a pergunta for especifica.

Parametros desejaveis:

- `--pollutants PM10,PTS,O3`
- `--stations 69,70,71`
- `--years 2013:2015`
- `--samples jan,apr,jul,sep`
- `--out reports/open-data-preview/availability-2013-2015-pts-o3.json`

### Etapa B — coleta anual controlada

Para candidatos aprovados pela matriz:

- PM10 2013-2015: coletar para validacao cruzada com artigo, sem alterar dataset publico.
- PTS 2013-2015: coletar como eixo historico-tecnico, nao como IQAr.
- O3 2013-2015: coletar como maior media horaria diaria ou janela normativa adequada, com cobertura explicita.

### Etapa C — auditoria

Antes de publicar:

- cobertura anual por estacao;
- duplicados;
- negativos;
- zeros persistentes;
- unidade detectada;
- extremos fisicamente improvaveis;
- comparacao com estatisticas publicadas no artigo RBCIAMB e nos relatorios INEA citados.

### Etapa D — publicacao

Somente depois:

- CSVs em `public/data/air/` com manifest atualizado;
- dicionario de dados atualizado;
- relatorio tecnico de QA;
- bloco pedagogico explicando que PTS/O3 historicos nao sao leitura operacional atual.

## O que nao fazer

- Nao raspar o portal inteiro de uma vez.
- Nao misturar dados IEMA, artigo cientifico e WebLakes no mesmo CSV sem coluna de origem.
- Nao transformar estatisticas agregadas de artigo em serie diaria.
- Nao publicar NO2 sem auditoria de baseline.
- Nao apresentar PTS como equivalente a PM10/PM2.5 ou IQAr.
- Nao inferir PM2.5 2020 a partir de PM10.

## Proxima rodada recomendada

1. Criar script parametrizado de matriz de disponibilidade historica.
2. Rodar foco 2013-2015 para PM10, PTS e O3 em Belmonte, Retiro e Santa Cecilia.
3. Gerar um relatorio comparando os achados amostrais com o artigo RBCIAMB 2020.
4. Se a comparacao for coerente, coletar o triênio completo 2013-2015 em cache restrito.
5. So depois avaliar publicacao de uma pagina "Memoria historica da qualidade do ar em Volta Redonda".
