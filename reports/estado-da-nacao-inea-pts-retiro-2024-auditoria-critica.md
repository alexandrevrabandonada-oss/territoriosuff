# Estado da Nação — Auditoria Crítica de PTS VR-Retiro (2024)

**Data do Relatório:** 2026-05-31  
**Poluente:** Partículas Totais em Suspensão (PTS)  
**Estação:** VR - Retiro (ID 70)  
**Status da Camada:** **SOMENTE HISTÓRICO-TÉCNICO EM AUDITORIA**

---

## 1. Contexto do Problema
O recálculo analítico do Lote C para o ano de 2024 revelou indicadores severamente anômalos para o parâmetro PTS na estação automática VR-Retiro:
*   Média anual/período: **445,165 µg/m³**
*   Pico máximo horário: **882,987 µg/m³**
*   Excedências CONAMA 24h: **366 dias** (100% de excedência do limite de 240 µg/m³)
*   Valores muito superiores a Belmonte (média **60,018 µg/m³**) e Santa Cecília (média **34,871 µg/m³**).

Uma média anual de 445,2 µg/m³ excede o limite regulatório anual de 80 µg/m³ por mais de 5 vezes. Esta auditoria investiga se este resultado é uma leitura física real ou decorre de erro instrumental ou de processamento.

---

## 2. Itens Verificados e Diagnóstico

### 2.1. Unidade de Medida
*   **Validação:** O poluente Partículas Totais em Suspensão (PTS) é disponibilizado na plataforma INEA/WebLakes em **µg/m³**. Não houve erro de conversão de unidade por parte do script.

### 2.2. Parâmetro e Parser
*   **Validação:** O parser do script `inea-weblakes-recompute-lote-c.ts` lê a célula de índice 5 na linha de resposta da tabela do WebLakes. Foi confirmado que o índice 5 representa os valores medidos de PTS para todas as estações. O layout do JSON de Retiro é idêntico ao de Belmonte e Santa Cecília, descartando qualquer deslocamento de coluna exclusivo para Retiro.
*   **Identificação do Parâmetro:** O ID do parâmetro no WebLakes é `1955`, que corresponde de fato ao sensor de PTS da estação Retiro.

### 2.3. Consistência Mensal e Padrão Temporal
*   As médias mensais de PTS em Retiro são extremamente estáveis ao longo de 2024:
    *   Jan: 444,33 µg/m³ | Fev: 438,46 µg/m³ | Mar: 449,86 µg/m³
    *   Abr: 449,57 µg/m³ | Mai: 452,41 µg/m³ | Jun: 445,14 µg/m³
    *   Jul: 447,05 µg/m³ | Ago: 446,23 µg/m³ | Set: 446,05 µg/m³
    *   Out: 436,71 µg/m³ | Nov: 445,12 µg/m³ | Dez: 440,72 µg/m³
*   **Diagnóstico:** As médias mensais são quase constantes (oscilando apenas entre 436,7 e 452,4 µg/m³), embora as leituras horárias variem individualmente (Desvio Padrão horário: **165,81 µg/m³**, valores únicos: 8.804 de 8.939 leituras válidas). Esse comportamento de média mensal ultraestável com alta variação horária sugere um offset sistemático gigantesco.

### 2.4. Hipótese de Fator de Escala (Divisão por 10)
*   **Análise:** Caso apliquemos um divisor de escala de **10** sobre as leituras de Retiro PTS:
    *   A média do período cairia de **445,17 µg/m³** para **44,52 µg/m³**.
    *   O intervalo diário de flutuação passaria a ser de **33,1 µg/m³** a **52,9 µg/m³**.
    *   Esses valores hipotéticos são perfeitamente coerentes e proporcionais à média de Belmonte (**60,02 µg/m³**) e Santa Cecília (**34,87 µg/m³**).
*   **Diagnóstico:** É provável que tenha ocorrido um erro de posicionamento de ponto decimal ou fator de escala (multiplicador de 10) na inserção de dados no banco do INEA/WebLakes para o sensor de Retiro, ou que o sensor tenha operado com um ganho descalibrado por um fator de 10.

### 2.5. Comparação Reguladora (CONAMA 03/1990)
*   **Diretriz Aplicada:** O padrão diário histórico de PTS da Resolução CONAMA 03/1990 é de **240 µg/m³**.
*   **Resultados Brutos:** Como todas as médias diárias brutas ficaram acima de 331 µg/m³, o sistema computou 366 dias de excedência da CONAMA (100% de excedência).

---

## 3. Conclusão da Auditoria e Veredito Editorial
A estação Retiro está localizada em Volta Redonda em um ponto exposto a plumas industriais da usina siderúrgica da CSN (zona urbana densa sob influência de poeira sedimentável). No entanto, um nível de fundo constante superior a 330 µg/m³ (com médias mensais ultraplanas em torno de 445 µg/m³) viola os limites físicos normais e contrasta severamente com os sensores de Belmonte e Santa Cecília.

Há indícios evidentes de **descalibração física de ganho (baseline offset acumulado)** ou **erro de fator de escala (multiplicação por 10)**. Sem uma confirmação ou flag de correção oficial emitida pelo órgão gestor (INEA), é impossível alterar os dados arbitrariamente.

### Veredito Final
O status do parâmetro PTS para Retiro em 2024 deve ser mantido estritamente como **SOMENTE HISTÓRICO-TÉCNICO EM AUDITORIA**. 
1.  **Bloqueio de Alertas Públicos:** Os dados brutos não devem ser publicados como indicadores de qualidade ambiental ou utilizados para gerar alertas de saúde para o cidadão comum, pois possuem alta probabilidade de falso-positivo por vício instrumental.
2.  **Destinação Técnica:** A camada servirá puramente como histórico-técnico interno para depuração de engenharia de sensores e auditorias cruzadas de rede.
