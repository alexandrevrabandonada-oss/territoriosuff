# Estado da Nação — Validação de Monóxido de Carbono (CO) — 2024

**Data do Relatório:** 2026-05-31  
**Poluente:** Monóxido de Carbono (CO)  
**Ano de Coleta:** 2024  
**Estações:** Belmonte (69), Retiro (70) e Santa Cecília (71)  
**Status da Camada:** **PUBLICÁVEL COM CAUTELA**

---

## 1. Metodologia de Validação

O Monóxido de Carbono (CO) adota metodologias distintas para comparação regulatória nacional (CONAMA) e internacional (OMS), exigindo rigor metodológico nas conversões e representações das médias.

### 1.1. Unidade de Medida e Conversão Física
*   **Dados Originais:** Os dados horários brutos de CO são fornecidos em **ppm** (partes por milhão) na plataforma INEA/WebLakes.
*   **Conversão para OMS:** A diretriz de qualidade do ar da OMS (2021) adota o limite diário de **4 mg/m³**. Para fins de comparação com a OMS, as médias diárias calculadas em ppm foram convertidas multiplicando-as pelo fator de conversão física de **1.145** (calculado para 25°C e 1 atm).
*   **Limitação da Conversão:** A conversão por `1.145` foi aplicada **exclusivamente** para a verificação da régua diária da OMS. A comparação regulatória nacional seguiu na unidade nativa (ppm).

### 1.2. Média Móvel de 8 Horas e Representatividade
*   **Regra Regulatória da CONAMA:** O limite da CONAMA 506/2024 estabelece o teto de **9 ppm** para a média móvel de 8 horas consecutivas.
*   **Algoritmo de Média Móvel:** Foi implementada uma janela deslizante horária de 8 horas. Exigiu-se o mínimo de **6 horas válidas** em cada janela de 8 horas para garantir a representatividade. Janelas abaixo de 6 leituras válidas foram descartadas.
*   **Rigor Metodológico:** Confirmou-se que o script de cálculo distingue adequadamente horas de dias civis, aplicando a média móvel de 8h sobre o fluxo contínuo de horas e agrupando as contagens de ultrapassagens regulamentares de maneira correta (sem contar horas individuais de excedência como múltiplos dias).

---

## 2. Indicadores Consolidados (2024)

### 2.1. VR - Belmonte (ID 69)
*   **Cobertura Temporal:** **96,17%** (8.448h válidas de 8.784h esperadas).
*   **Média do Período:** **0,375 ppm** (aproximadamente 0,429 mg/m³).
*   **Média Máxima de 8h:** **2,201 ppm**.
*   **Ultrapassagens OMS (4 mg/m³ diários):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA (9 ppm em média móvel 8h):** **0 eventos** (confirmado).

### 2.2. VR - Retiro (ID 70)
*   **Cobertura Temporal:** **99,57%** (8.746h válidas de 8.784h esperadas).
*   **Média do Período:** **1,007 ppm** (aproximadamente 1,153 mg/m³).
*   **Média Máxima de 8h:** **2,901 ppm**.
*   **Ultrapassagens OMS (4 mg/m³ diários):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA (9 ppm em média móvel 8h):** **0 eventos** (confirmado).

### 2.3. VR - Santa Cecília (ID 71)
*   **Cobertura Temporal:** **99,16%** (8.710h válidas de 8.784h esperadas).
*   **Média do Período:** **0,362 ppm** (aproximadamente 0,414 mg/m³).
*   **Média Máxima de 8h:** **2,342 ppm**.
*   **Ultrapassagens OMS (4 mg/m³ diários):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA (9 ppm em média móvel 8h):** **0 eventos** (confirmado).

---

## 3. Veredito de Validação e Segurança
Todos os cálculos e verificações analíticas fecharam com consistência absoluta:
*   As coberturas de dados ultrapassam a meta de 75% em todas as três estações automáticas.
*   Confirmada a ocorrência de **zero (0)** ultrapassagens tanto para a diretriz diária da OMS (4 mg/m³) quanto para o padrão de média móvel de 8h da CONAMA (9 ppm).
*   Não foram identificadas anomalias nos dados brutos, que apresentam variação diurna realista correlacionada ao tráfego veicular e atividades industriais de Volta Redonda.

### Veredito Final
A camada de **Monóxido de Carbono (CO) de 2024** está classificada como **PUBLICÁVEL COM CAUTELA**. Os dados são representativos e estão matematicamente consistentes, podendo ser integrados na seção experimental da interface pública, mantendo o aviso padrão de "comparação experimental — sem QA/QC oficial de origem".
