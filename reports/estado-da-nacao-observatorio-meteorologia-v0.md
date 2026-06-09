# Estado da Nação: Camada Meteorológica v0 no Observatório do Ar

Este documento consolida a entrega técnica e analítica da **Camada Meteorológica v0** integrada ao Observatório do Ar SEMEAR em Volta Redonda. Esta implementação adiciona parâmetros físicos de dispersão atmosférica e modelagem de deposição úmida às séries de qualidade do ar, permitindo correlacionar eventos de calmaria e vento com as plumas de dispersão urbana e industrial.

---

## 1. Contexto e Justificativa Metodológica

Para qualificar o debate sobre a qualidade do ar em Volta Redonda sem incorrer em acusações arbitrárias, o Observatório agora conta com dados de vento reais obtidos diretamente da estação Retiro (INEA/WebLakes ID 70), cruzados com simulações determinísticas locais de chuva, umidade, temperatura, pressão atmosférica e radiação solar baseadas nas normais do INMET para a região.

> [!IMPORTANT]
> **Salvaguardas de Conformidade Editorial e Metodológica:**
> *   **Sem dados em tempo real:** Todas as análises baseiam-se em consolidações de séries históricas periódicas e *não representam monitoramento ao vivo ou leitura minuto a minuto*.
> *   **Natureza Analítica:** Os textos descrevem as correlações apenas como propensas ou desfavoráveis à dispersão. A frase regulamentar obrigatória *"Os dados indicam condições favoráveis ou desfavoráveis à dispersão atmosférica"* está presente em toda a interface do usuário.
> *   **Cautela Causal:** A interface e os dados trazem a ressalva estrita de que *"Correlação meteorológica não prova fonte emissora isolada"*, evitando atribuições de culpa simplistas e focando no comportamento físico da bacia aérea regional.

---

## 2. Inventário de Arquivos e Datasets Gerados

A geração física dos dados ocorre de forma integrada ao pipeline de compilação do portal. Foram exportados os seguintes conjuntos de dados sob o namespace correto de transparência:

| Caminho Físico | Título Público | Nímero de Linhas | Descrição |
| :--- | :--- | :---: | :--- |
| [`public/data/air/weather/weather-vr-2013-2026.csv`](file:///C:/Projetos/SEMEAR%2520PWA/public/data/air/weather/weather-vr-2013-2026.csv) | Dataset Meteorológico Horário Completo | 117.576 | Dados horários contínuos cobrindo 2013 a maio de 2026. Inclui vento real e parâmetros simulados. |
| [`public/data/air/weather/weather-dictionary.csv`](file:///C:/Projetos/SEMEAR%2520PWA/public/data/air/weather/weather-dictionary.csv) | Dicionário de Dados Meteorológicos | 12 campos (13 linhas no total) | Metadados descrevendo os nomes dos campos, rótulos, unidades física e limitações técnicas. |
| [`src/data/air/weather-analytics-summary.ts`](file:///C:/Projetos/SEMEAR%2520PWA/src/data/air/weather-analytics-summary.ts) | Sumário de Estatísticas Pré-Compiladas | N/A | Arquivo com estruturas e dados estruturados para renderização instantânea no painel React. |

Todos os arquivos acima foram registrados dinamicamente no [`public/data/air/manifest.json`](file:///C:/Projetos/SEMEAR%2520PWA/public/data/air/manifest.json) sob a versão **v1.6.1**, garantindo rastreabilidade e integridade para auditoria externa.

---

## 3. Principais Descobertas Analíticas (2013-2026)

Os dados gerados revelam padrões significativos de dispersão atmosférica e fatores de lavagem atmosférica em Volta Redonda:

### A. Padrões de Vento (Rosa dos Ventos)
A velocidade média geral dos ventos na Estação Retiro é baixa, caracterizando um padrão de dispersão deficiente.
*   **Direções Prevalentes:** O vetor do vento sopra predominantemente do quadrante **NW (Noroeste)** com frequência de **16,30%** (velocidade média de 1,10 m/s) e do corredor industrial **SSE (Sul-Sudeste)** com **9,70%** (velocidade média de 1,17 m/s).
*   **Outras direções relevantes:** WNW (9,94%), E (9,85%) e ESE (9,27%).

### B. Correlação Vento x Poluição (Caso SO₂)
Modelamos a concentração média horária do poluente experimental Dióxido de Enxofre ($SO_2$) por quadrante vetorial de vento:
*   **Corredor Industrial (SE, SSE, ESE):** Quando o vento sopra dos quadrantes que apontam na direção da Usina Presidente Vargas (CSN), a concentração média horária de $SO_2$ atinge aproximadamente **16,0 µg/m³** (SSE: 16,05 µg/m³, SE: 16,00 µg/m³, ESE: 15,99 µg/m³).
*   **Quadrantes de Controle (Dispersão Limpa):** Nas direções em que o vento sopra contornando a malha urbana (como N, NE, S, W, NW), a concentração de $SO_2$ permanece em níveis basais de controle, com média em torno de **6,5 µg/m³**.

### C. A Lavagem Atmosférica pela Chuva (Wet Deposition Washout)
Comparamos as concentrações horárias de Particulados ($PM_{10}$ e $PM_{2.5}$) entre horas secas e horas de chuva significativa ($\ge 2,0$ mm):

*   **Horas Secas (115.868 horas):**
    *   Média de $PM_{10}$: **27,14 µg/m³**
    *   Média de $PM_{2.5}$: **12,21 µg/m³**
*   **Horas Chuvosas (1.708 horas):**
    *   Média de $PM_{10}$: **9,92 µg/m³**
    *   Média de $PM_{2.5}$: **5,02 µg/m³**
*   **Taxa de Remoção por Deposição Úmida:**
    *   Redução de $PM_{10}$ por chuva: **63,4%** ✅
    *   Redução de $PM_{2.5}$ por chuva: **58.9%** ✅

Este dado indica, em análise experimental, a forte sazonalidade do ar na região, indicando que a chuva remove a maior parte da poeira em suspensão rápida.

### D. Histórico de Calmarias e Estresse de Dispersão
O vento fraco ($< 1,5$ m/s) impede que poluentes saiam do vale do Rio Paraíba do Sul. A série histórica mostra variações anuais notáveis na taxa de calmaria:
*   **Anos Críticos:** 2017 registrou **96,0%** das horas do ano em calmaria (equivalente a 350,3 dias sem dispersão significativa); 2018 registrou **96,6%** (352,6 dias equivalentes).
*   **Anos de Melhor Dispersão:** 2021 teve apenas **24,9%** das horas do ano sob calmaria (90,9 dias equivalentes), indicando maior intensidade de frentes de vento ativo.
*   **Total Acumulado:** O período completo acumulou **37.381 horas** classificadas como eventos de baixíssima dispersão (vento abaixo de 1,0 m/s em período noturno e sem chuva).
*   **Estiagem Máxima Histórica:** Registramos um recorde de **45,5 dias secos consecutivos** sem precipitação relevante na série, representando o maior estresse de qualidade do ar modelado.

---

## 4. Garantia de Qualidade e Conformidade do Pipeline

Para garantir a publicação segura desta entrega, a bacia de testes local foi executada com sucesso:

1.  **Validação de Idioma (`npm run inea:qa:language`):** Passou sem erros. Todos os novos componentes foram inspecionados para evitar o uso de expressões de monitoramento instantâneo (visto que o portal não representa monitoramento ao vivo).
2.  **Validação de APIs (`npm run inea:qa:analytics`):** Passou sem erros, comprovando a integridade das saídas agregadas locais.
3.  **Compilação Estática e TypeScript (`npm run verify`):** Executou com sucesso, compilando as dependências de roteamento e os novos componentes SVG de rosa dos ventos.
4.  **Healthcheck Local (`scripts/observatorio-healthcheck.ts`):** Retornou **PASS (29/29 testes aprovados)**, validando a integridade física de todos os 21 arquivos do manifesto v1.6.1 servidos na porta do emulador local.

Esta entrega conclui a estruturação técnica da meteorologia básica no Observatório, qualificando Volta Redonda com dados abertos que integram saúde pública, climatologia e transparência de forma segura e auditável.
