# Estado da Nação — Radar INEA: auditoria metodológica e expansão segura

Data: 2026-06-10

## Escopo

Esta auditoria cobre:

- coerência metodológica do Radar INEA;
- consistência entre narrativa pública, datasets e avisos de cautela;
- oportunidades de incorporação de novos dados públicos/oficiais;
- reorganização pedagógica para aumentar confiança pública sem inflar conclusões.

## Base auditada no projeto

Arquivos e camadas principais revisados:

- `src/pages/air/IneaRadarPage.tsx`
- `src/pages/air/IneaMethodologyPage.tsx`
- `src/pages/air/radar/RadarOverviewMode.tsx`
- `src/pages/air/radar/RadarTimeMode.tsx`
- `src/pages/air/radar/RadarTerritoryMode.tsx`
- `src/pages/air/radar/RadarStationsMode.tsx`
- `src/pages/air/radar/RadarMethodologyMode.tsx`
- `src/components/air/*`
- `src/lib/air/*`
- `public/data/air/manifest.json`
- datasets públicos em `public/data/air/`

## Diagnóstico executivo

O Radar INEA já tem uma virtude importante: ele é mais honesto no código e na metodologia do que parece na superfície pública. Há vários avisos corretos sobre camada experimental, ausência de QA/QC oficial explícito e risco de interpretar silêncio como ar bom.

O problema é que essa honestidade ainda está distribuída de forma desigual:

- a interface editorial faz afirmações fortes;
- a metodologia avisa várias cautelas;
- alguns componentes analíticos ainda parecem mais “definitivos” do que a base realmente permite;
- a camada meteorológica tem risco especial de sobreinterpretação.

Conclusão: o sistema está forte como observatório cívico-experimental, mas ainda não deve se apresentar, em todos os blocos, como se fosse equivalente a uma publicação oficial validada ponta a ponta pelo INEA.

## O que o Radar já sustenta bem hoje

### 1. Leitura histórica experimental de particulados

O sistema já sustenta bem:

- PM10 com série pública ampla;
- PM2.5 com série pública a partir de 2021;
- comparação experimental com OMS e CONAMA 506;
- leitura por estação, cobertura, excedências e sazonalidade.

Isso está coerente com os datasets materializados no portal.

### 2. Governança de exclusão cautelosa

O projeto já adotou uma postura metodologicamente correta ao:

- segurar NO2 por anomalia crítica;
- tratar PTS como histórico técnico sob auditoria;
- expor SO2 e CO com rótulo experimental.

Essa lógica é boa e deve virar regra pública explícita do Radar.

### 3. Leitura territorial como priorização, não causalidade

Os componentes territoriais já avisam que:

- não medem risco individual;
- não provam causalidade direta;
- servem para priorização territorial e justiça ambiental.

Essa base está correta.

## Principal tensão metodológica atual

### 1. O Radar usa base pública experimental, mas parte da UI soa quase oficial-validada

O manifesto da base declara:

> Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.

Isso é um aviso central, não lateral.

Hoje, o projeto faz duas coisas ao mesmo tempo:

- acerta ao explicitar essa limitação;
- erra parcialmente ao deixar alguns painéis editoriais com tom de certeza maior do que a cadeia de validação permite.

### 2. A camada meteorológica precisa de cautela mais forte

O `manifest.json` informa:

- ventos reais;
- outras variáveis simuladas por médias locais.

Isso muda bastante a interpretação pública.

Implicação:

- vento e direção do vento podem ser tratados como camada observacional mais forte;
- temperatura, umidade, chuva, pressão e radiação, do jeito atual, não devem sustentar inferências causais fortes sem selo visual específico.

### 3. Cobertura e silêncio de dados ainda precisam aparecer como regra transversal

O projeto já tem bons avisos de lacuna, mas ainda falta uma regra única, sempre visível:

> ausência de dado não representa ar bom; representa perda de capacidade pública de monitorar o período.

Isso deve aparecer em todos os modos com maior densidade analítica, não só em alguns painéis.

## Dados já presentes no projeto e subaproveitados

A base local auditada mostra que o portal já possui mais material do que parte da UI comunica.

### 1. Séries históricas ampliadas já disponíveis

Há arquivos públicos para:

- `pm10-timeline-2013-2026.csv`
- `so2-timeline-2013-2026.csv`
- `co-timeline-2013-2026.csv`
- `particulate-timeline-2020-2026.csv`
- `attention-episodes-2020-2026.csv`

Oportunidade:

- tornar mais explícito no Radar que PM10, SO2 e CO já têm leitura plurianual;
- separar claramente o que é “mais consolidado” do que é “exploratório”.

### 2. Matriz de disponibilidade já existe conceitualmente

Há loaders e componentes suficientes para organizar uma matriz pública de disponibilidade/solidez por:

- poluente;
- ano;
- estação;
- status de confiança.

Isso hoje aparece fragmentado. Deve virar quadro de governança metodológica.

### 3. Downloads e dicionário já sustentam transparência maior

O portal já dispõe de:

- manifesto;
- dicionário de dados;
- datasets abertos;
- explicações metodológicas.

O problema não é falta de material. É hierarquia pedagógica.

## Dados oficiais adicionais identificados fora do projeto

Fontes verificadas em 2026-06-10:

1. Secretaria de Estado do Ambiente e Sustentabilidade — notícia oficial sobre a rede de monitoramento e o programa de partículas sedimentáveis em Volta Redonda:
   [Estado do Rio lidera ranking nacional de monitoramento da qualidade do ar, segundo estudo](https://www.rj.gov.br/seas/node/911)

2. Portal municipal de Volta Redonda citando nota oficial do INEA sobre o Programa Estadual de Monitoramento de Partículas Sedimentáveis (“pó preto”), com ciclos de 30 dias e análises em parceria com a PUC-Rio:
   [Inea-RJ fiscaliza CSN e anuncia parceria com universidade para analisar amostras coletadas](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/24-gabinete-do-prefeito/8751-inea-rj-fiscaliza-csn-e-anuncia-parceria-com-universidade-para-analisar-amostras-coletadas/)

3. Portal municipal de Volta Redonda relatando reunião sobre ampliação do monitoramento e divulgação pública:
   [A pedido do prefeito Neto, deputado estadual Munir e secretário de Meio Ambiente se reúnem com o Inea-RJ](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/24-gabinete-do-prefeito/8744-a-pedido-do-prefeito-neto%2C-deputado-estadual-munir-e-secret%C3%A1rio-de-meio-ambiente-se-re%C3%BAnem-com-o-inea-rj/)

4. Documento oficial de planejamento do INEA que menciona explicitamente:
   - Atmos / telemetria de qualidade do ar;
   - AQMIS;
   - novo portal SIGQAR;
   - programa de monitoramento de emissões atmosféricas.
   Fonte:
   [PEDTIC 2024–2027 do INEA (PDF)](https://www.rj.gov.br/seticapp/sites/default/files/planos2024/PEDTIC_2024_2027%20-%20INEA.pdf)

5. Página de login do portal AQMIS/SIGQAr, confirmando sistema ativo em 2026:
   [AQMIS / SIGQAr INEA](https://fat.ei.weblakes.com/INEA/Account/LogOn?ReturnUrl=%2fINEA%2f)

## O que esses achados permitem incorporar com segurança

### Trilha A — Pode entrar já

#### A1. Matriz pública de status por parâmetro

Criar um quadro metodológico único com quatro estados:

- liberado;
- experimental;
- histórico técnico;
- bloqueado/em auditoria.

Aplicar a:

- PM10
- PM2.5
- SO2
- CO
- NO2
- PTS
- O3, se houver material aproveitável e reproduzível no acervo

Valor:

- reduz ambiguidade;
- organiza confiança pública;
- evita que o usuário trate todo número com o mesmo peso.

#### A2. Camada “força da evidência”

Todo painel analítico do Radar deveria carregar um selo simples:

- evidência forte;
- evidência observacional experimental;
- hipótese interpretativa;
- dado indisponível/insuficiente.

Valor:

- fortalece pedagogia;
- reduz sobreleitura;
- melhora a defensabilidade metodológica do portal.

#### A3. Separação visual da meteorologia

Reclassificar a camada meteorológica em dois blocos:

- `Vento observado`
- `Condições atmosféricas estimadas`

Valor:

- preserva o que a base tem de mais forte;
- impede que chuva/umidade/temperatura simuladas ganhem aparência de medição direta local equivalente.

### Trilha B — Pode entrar, mas como evidência paralela

#### B1. Partículas sedimentáveis / “pó preto”

Há base oficial para tratar esse tema como eixo do sistema, porque o programa estadual foi explicitamente anunciado para Volta Redonda.

Mas isso não deve entrar como continuação automática do IQAr.

Forma correta:

- novo eixo “Partículas sedimentáveis e incômodo material”;
- leitura própria;
- distinção entre respirável e sedimentável;
- distinção entre saúde respiratória, incômodo, deposição e fiscalização ambiental.

Valor:

- responde a uma demanda pública real;
- fortalece o sistema territorial e político;
- evita mistura conceitual indevida com PM10/PM2.5.

#### B2. Boletins, notas e evidências oficiais

Se houver boletins ou relatórios públicos recuperáveis de forma estável, eles devem entrar como:

- camada de evidência documental;
- não como substituto direto dos datasets processados.

Valor:

- reforça rastreabilidade;
- ajuda a fechar o ciclo entre observatório e documentação pública.

### Trilha C — Não deve entrar ainda sem nova validação

#### C1. Reabilitar NO2 sem auditoria concluída

Não deve acontecer.

Primeiro é preciso fechar:

- diagnóstico da anomalia;
- critério de exclusão/correção;
- regra pública de liberação.

#### C2. Tratar a meteorologia estimada como fato medido

Não deve acontecer.

Isso hoje é o ponto mais sensível de confiança do Radar.

#### C3. Misturar partículas sedimentáveis com IQAr e OMS

Não deve acontecer.

São camadas com sentido regulatório e sanitário diferente.

## Reorganização pedagógica recomendada

## Nível 1 — O que este Radar permite afirmar

Abrir a metodologia com quatro mensagens curtas:

1. O Radar mostra padrões públicos de atenção e exposição, não diagnóstico clínico.
2. Parte da base é experimental e não traz flag oficial de QA/QC por registro.
3. Ausência de dado não significa ar bom.
4. Território e vulnerabilidade servem para priorização pública, não prova individual de dano.

## Nível 2 — O que o usuário está lendo em cada modo

Cada modo deve declarar sua pergunta:

- Visão Geral: triagem pública
- Mapa: onde está a cobertura e onde olhar primeiro
- Tempo: quando os sinais aparecem e com qual cobertura
- Território: quem vive mais perto da pressão ambiental
- Estações: o que cada ponto mede e quão confiável é a cobertura
- Metodologia: o que está liberado, experimental ou retido

## Nível 3 — Quadro de governança por poluente

Exemplo de estrutura desejada:

- PM10 — liberado com cautela experimental
- PM2.5 — liberado com cautela experimental
- SO2 — experimental expandido
- CO — experimental expandido
- NO2 — bloqueado em auditoria
- PTS — histórico técnico em auditoria
- Partículas sedimentáveis — eixo paralelo, fora do IQAr

## Nível 4 — Evidência e downloads

Centralizar em uma mesma superfície:

- manifesto;
- datasets;
- dicionário;
- relatórios de auditoria;
- notas técnicas futuras;
- boletins/ofícios públicos quando houver URL estável.

## Priorização de implementação

### Prioridade 1 — imediatamente

1. Criar matriz pública de status por parâmetro.
2. Aplicar selo de força da evidência em todos os modos do Radar.
3. Rebaixar visualmente inferências meteorológicas não observadas.
4. Uniformizar a mensagem “ausência de dado não representa ar bom”.

### Prioridade 2 — próxima rodada

1. Criar eixo próprio para partículas sedimentáveis / pó preto.
2. Integrar camada documental oficial do INEA/SEAS/município.
3. Expor melhor a diferença entre:
   - dado oficial publicado;
   - dado público processado pelo SEMEAR;
   - hipótese interpretativa.

### Prioridade 3 — após validação

1. Revisar possibilidade de reentrada de NO2.
2. Revisar PTS apenas como memória técnica/histórica.
3. Avaliar se existe acesso público reproduzível a mais variáveis observadas do SIGQAr/AQMIS.

## Decisão metodológica recomendada

O Radar INEA deve assumir publicamente uma identidade mais precisa:

> observatório cívico-técnico de leitura pública da qualidade do ar, baseado em dados públicos do ecossistema INEA/WebLakes/SIGQAr, com camadas de validação diferenciadas.

Isso é mais forte do que tentar parecer um espelho oficial completo sem a cadeia total de QA/QC.

## Próxima rodada sugerida

Implementar em código, nesta ordem:

1. componente único de `RadarEvidenceBadge` ou equivalente;
2. matriz de status por parâmetro dentro da metodologia;
3. revisão dos textos de overview/time para separar fato observado de interpretação;
4. desenho do eixo “partículas sedimentáveis / pó preto” como camada paralela.
