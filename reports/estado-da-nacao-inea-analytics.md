# Estado da Nação — Análises Públicas do Radar do Ar INEA (Volta Redonda-RJ)

**Data do Relatório:** 2026-05-26  
**Status da Camada Analítica:** Concluída, Testada e Homologada  

---

## 1. Escopo e APIs Criadas

Para suportar o painel de interpretação e visualizações públicas de Volta Redonda, desenvolvemos 5 novos endpoints serverless sob o diretório `api/air/inea/analytics/`:

1. **`GET /api/air/inea/analytics/degraded-days`**: Retorna a contagem agregada de dias em que cada estação apresentou qualidade do ar classificada como MODERADA ou pior.
2. **`GET /api/air/inea/analytics/controller-frequency`**: Consolida a frequência relativa (contagem e porcentagem) com que cada poluente (PM10, PM2.5, SO2, NO2, O3, CO) atuou como o controlador da qualidade do ar (responsável pelo maior subíndice).
3. **`GET /api/air/inea/analytics/monthly-profile`**: Agrupa o perfil de degradação por meses do ano (Janeiro-Dezembro), ajudando a identificar sazonalidades e períodos de piora.
4. **`GET /api/air/inea/analytics/station-ranking`**: Classifica as estações monitoradas pelo percentual de dias degradados e pelo maior pico de índice de qualidade registrado (`max_aqi`).
5. **`GET /api/air/inea/analytics/data-gaps`**: Audita a integridade temporal de cada estação, calculando o percentual de cobertura das leituras esperadas e identificando a quantidade de lacunas temporais maiores que 24 horas.

---

## 2. Interface de Usuário e Visualização Pública

Criamos a página de visualização analítica `/qualidade-ar/inea/analises` ([IneaAnalyticsPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaAnalyticsPage.tsx)):
- **Título Prominente**: *"O que os dados oficiais mostram?"*
- **Avisos Claros**: Incorpora o componente [DataFreshnessNotice.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/DataFreshnessNotice.tsx) e o aviso metodológico informando que se trata de índices adimensionais IQAr, e não de concentrações físicas físicas de poluentes.
- **Gráficos SVG / HTML Inline**:
  - Breakdown horizontal de dias medidos por classificação (BOA, MODERADA, RUIM, etc.).
  - Barras horizontais de poluente controlador mais frequente.
  - Heatmap colorido de degradação por mês.
  - Tabela completa de auditoria de lacunas e cobertura.
- **Tradução Popular**: Exibe o componente [PublicInterpretationBox.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/PublicInterpretationBox.tsx) que orienta o cidadão a enxergar as medições como indícios públicos / sinais de atenção para engajamento e cobrança técnica, em vez de pânico irracional ou declarações precipitadas de crimes ambientais.

---

## 3. Principais Achados no Banco de Dados

Executamos auditorias diretamente no banco de dados Supabase e extraímos os seguintes achados reais:

### A. Estações e Picos de Poluição
- **Santa Cecília**: Apresenta **2,5%** de dias degradados (17 de 684 dias medidos), com pico de índice geral registrado em **62** (classificado como **MODERADA**).
- **Nossa Sra. das Graças (Van)**: Apresenta **5,1%** de dias degradados (16 de 316 dias medidos), registrando o pior índice geral da base com valor **85** (classificado como **RUIM**).
- **Belmonte e Retiro**: Apresentam 100% de dias classificados como BOA no período amostrado (com pico de índice registrado igual a 0).

### B. Poluente Controlador Mais Frequente
- **SO2 (Dióxido de Enxofre)**: É o principal fator de degradação do ar na cidade, controlando **48,7%** das medições de índice geral.
- **MP10 (Material Particulado)**: Fica em segundo lugar, controlando **30,6%** das leituras.
- **MP2,5 (Material Particulado Fino)**: Atua como controlador em **13,3%** das leituras.
- **O3 (Ozônio)**: Controla **7,2%** das leituras.
- **NO2 (Dióxido de Nitrogênio)**: Controla **0,2%** das leituras.

### C. Sazonalidade (Perfil Mensal)
- **Novembro**: Apresentou a maior proporção histórica de degradação, com **10,4%** dos dias registrados como MODERADA ou pior.
- **Setembro**: Ficou em segundo lugar, com **8.9%** de degradação diária.
- **Agosto**: Registrou **3,3%** de dias degradados.

### D. Lacunas e Cobertura de Dados
- As estações fixas permanentes (Belmonte, Retiro, Santa Cecília) mostram cobertura total acumulada de apenas **1,7%** do tempo total de funcionamento histórico devido a grandes lacunas de desativação (com a maior interrupção contínua chegando a **10.104 horas** consecutivas sem registros).
- A estação móvel (Van de Nossa Sra. das Graças) apresenta uma cobertura de **3,7%** do período em que operou, com a maior lacuna contínua de **168 horas** (7 dias).

---

## 4. Limitações e Cautelas Metodológicas

1. **Planilha Batch**: Os dados analisados vêm da planilha histórica do Dados Abertos RJ, cobrindo lotes de registros passados (não representa tempo real / não implementado / roadmap futuro).
2. **Índices de Poluentes**: O banco armazena subíndices IQA. A correlação direta com a massa física ($\mu\text{g/m}^3$) não é possível sem a fórmula de regressão reversa do INEA.
3. **Representatividade Sazonal**: O banco atual contém uma amostra de medições oficiais. Conclusões anuais robustas exigem a importação de planilhas históricas de anos anteriores adicionais.

---

## 5. Próximos Passos (Utilidade Social e LAI)

Para maximizar a utilidade social dos achados:
1. **Requerimento via LAI (Lei de Acesso à Informação)**:
   - Solicitar ao INEA os dados horários de concentrações brutas físicas (em $\mu\text{g/m}^3$ e $\text{ppm}$) para Volta Redonda das estações Belmonte, Retiro, Santa Cecília e Nossa Senhora das Graças de 2020 a 2026.
   - Questionar os motivos das grandes lacunas temporais identificadas (ex.: paralisações de mais de 10.000 horas).
2. **Investigação Técnica e Ética**:
   - Continuar a investigar endpoints públicos carregados pelo frontend do SIGQAR, sem burlar autenticação, captcha, limites de acesso ou barreiras técnicas, para tentar coletar atualizações diárias e horárias.
3. **Divulgação Cidadã**:
   - Publicar um post informativo traduzindo a dominância do SO2 (associado a processos de queima industrial e combustíveis fósseis) e as lacunas no monitoramento oficial como sinais de atenção que justificam o fortalecimento da Rede Cidadã SEMEAR UFF.
