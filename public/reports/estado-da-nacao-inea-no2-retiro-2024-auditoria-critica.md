# Estado da Nação — Auditoria Crítica de NO₂ VR-Retiro (2024)

**Data do Relatório:** 2026-05-31  
**Poluente:** Dióxido de Nitrogênio (NO₂)  
**Estação:** VR - Retiro (ID 70)  
**Status da Camada:** **MANTER EM AUDITORIA**

---

## 1. Contexto do Problema
O recálculo analítico do Lote C para o ano de 2024 identificou os seguintes números na estação automática VR-Retiro:
*   Média anual/período: **35,261 µg/m³**
*   Excedências OMS (24h): **366 dias** (100% de excedência)
*   Excedências CONAMA (1h): **0 eventos** (0 horas > 200 µg/m³)

Um perfil de 100% de excedência da diretriz diária da OMS concomitante com zero excedências da régua brasileira CONAMA motivou esta auditoria crítica para identificar possíveis falhas instrumentais, erros de processamento ou anomalias do sensor.

---

## 2. Itens Verificados e Diagnóstico

### 2.1. Régua de Comparação da OMS
*   **Diretriz Aplicada:** A régua da Organização Mundial da Saúde (OMS 2021) estabelece o limite médio diário (24h) de **25 µg/m³** para o NO₂.
*   **Validação da Régua:** Confirmado. O limite diário utilizado pelo script para comparação de NO₂ está correto em 25 µg/m³.

### 2.2. Critério de Representatividade Temporal (18h)
*   **Regra de Cálculo:** A média diária exige pelo menos **18 horas válidas** em um mesmo dia civil para ser considerada representativa.
*   **Validação do Script:** Confirmado. O script `inea-weblakes-recompute-lote-c.ts` agrupa corretamente os dados horários por data (`YYYY-MM-DD`) e exige `vals.length >= 18` antes de computar a média diária e testar as ultrapassagens. Dias com cobertura insuficiente não foram incluídos.

### 2.3. Validação do Contador (Horas vs. Dias)
*   **Possível Bug:** Investigou-se se o script estaria contando horas individuais como dias de excedência.
*   **Validação do Script:** Não há erro. O script calcula a média diária de cada dia civil (que contém de 18 a 24 horas válidas) e compara a média consolidada com o threshold da OMS. O totalizador de 366 dias refere-se estritamente aos dias civis do ano bissexto 2024.

### 2.4. Unidade de Medida
*   **Validação:** A plataforma WebLakes disponibiliza NO₂ nativamente na unidade **µg/m³**. A unidade não passou por conversões físicas e está correta.

### 2.5. Padrão Artificial de Valor Constante
*   **Análise de Dispersão:** A análise estatística das 8.749 leituras horárias de NO₂ em Retiro revelou:
    *   Média horária: **34,8755 µg/m³**
    *   Desvio Padrão: **12,2486 µg/m³** (flutuação realista)
    *   Mínimo: **0 µg/m³** | Máximo: **66,9657 µg/m³**
    *   Valores únicos: **8.791** de 8.940 leituras válidas.
*   **Diagnóstico:** Não há dados "travados" ou congelados (leituras repetitivas idênticas). Há flutuação contínua de hora em hora. No entanto, a variação das médias diárias é extremamente estreita (mínimo de 27,58 µg/m³ e máximo de 42,62 µg/m³).

### 2.6. Tratamento de Zeros e Calibração
*   **Validação:** A estação registrou exatamente **150 horas em zero (0)** ao longo do ano. Esses zeros representam períodos de calibração automática ou manutenção instrumental e foram devidamente excluídos das médias.

### 2.7. Deslocamento de Coluna no Parser
*   **Validação:** O layout da linha de resposta do cache do WebLakes para Retiro foi inspecionado:
    `cell: ["1", "RET", "<span date>", "Descr", "Address", "<value>", "<wind_speed>", "<wind_dir>"]`
    O parser captures a célula de índice 5 como valor do poluente, o que está correto e perfeitamente alinhado com as outras estações (Belmonte e Santa Cecília).

---

## 3. Conclusão da Auditoria
Embora o script esteja computando os dados com rigor matemático impecável, o padrão de dados de NO₂ em Retiro exibe uma **provável anomalia instrumental de linha de base (zero drift / baseline offset)**. 
A mínima média diária de Retiro foi de **27,58 µg/m³**, o que é quase 20 µg/m³ superior às mínimas de Belmonte (**6,40 µg/m³**) e Santa Cecília (**5,94 µg/m³**). Por outro lado, o pico máximo horário de Retiro (66,97 µg/m³) é comparável ao das outras estações (66,83 µg/m³ em Belmonte e 90,23 µg/m³ em Santa Cecília). 

Esse comportamento é característico de um desvio positivo sistemático na calibração do sensor (offset de aproximadamente +20 µg/m³). Sem flags oficiais do INEA de QA/QC de origem, esse desvio sistemático empurrou todas as médias diárias para cima do threshold de 25 µg/m³, gerando o resultado falso-positivo de 100% de excedência (366 dias).

### Veredito Final
A camada de **NO₂ de Retiro 2024** deve ser classificada como **MANTER EM AUDITORIA** e permanecer bloqueada para publicação. É fundamental aguardar esclarecimentos técnicos ou flag de QA/QC oficial do INEA antes de expor esses indicadores na camada pública para evitar alarmismo injustificado baseado em desvio instrumental.
