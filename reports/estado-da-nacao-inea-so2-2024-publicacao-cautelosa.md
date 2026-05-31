# Estado da Nação — Validação de Dióxido de Enxofre (SO₂) — 2024

**Data do Relatório:** 2026-05-31  
**Poluente:** Dióxido de Enxofre (SO₂)  
**Ano de Coleta:** 2024  
**Estações:** Belmonte (69), Retiro (70) e Santa Cecília (71)  
**Status da Camada:** **PUBLICÁVEL COM CAUTELA**

---

## 1. Metodologia de Validação

O Dióxido de Enxofre (SO₂) é um poluente associado principalmente à combustão de combustíveis fósseis contendo enxofre e processos metalúrgicos. Esta auditoria valida o processamento e a consistência deste parâmetro para o ano de 2024.

### 1.1. Unidade e Cobertura de Dados
*   **Unidade Nativa:** Confirmado que a plataforma INEA/WebLakes fornece SO₂ em **µg/m³**, que é a unidade padrão para comparação internacional e nacional. Nenhuma conversão física foi necessária.
*   **Representatividade Temporal (18h):** O cálculo das médias diárias exige pelo menos **18 horas válidas** por dia. O script respeitou essa regra e descartou dias com leituras insuficientes.
*   **Cobertura Anual:** A cobertura de dados horários em todas as três estações automáticas superou a meta de **75%** estabelecida pelo Observatório:
    *   **VR - Belmonte (69):** Cobertura geral de **89,33%** (7.847h válidas).
    *   **VR - Retiro (70):** Cobertura geral de **99,61%** (8.750h válidas).
    *   **VR - Santa Cecília (71):** Cobertura geral de **80,16%** (7.041h válidas).

### 1.2. Regras de Comparação e Limites de Saúde
*   **Régua da OMS (2021):** Limite médio diário (24h) de **40 µg/m³**.
*   **Régua Nacional (CONAMA 506):** Limite médio diário (24h) de **20 µg/m³**.
*   **Rigor de Contagem:** As ultrapassagens foram computadas em nível diário civil (comparando as médias diárias de $\ge 18$h contra os respectivos limites).

---

## 2. Indicadores Consolidados (2024)

### 2.1. VR - Belmonte (ID 69)
*   **Média do Período:** **4,059 µg/m³**.
*   **Pico Máximo Horário:** **29,663 µg/m³**.
*   **Dias Válidos (\\ge 18h):** **320 dias**.
*   **Ultrapassagens OMS 24h (> 40 µg/m³):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA 24h (> 20 µg/m³):** **0 dias** (confirmado).

### 2.2. VR - Retiro (ID 70)
*   **Média do Período:** **4,672 µg/m³**.
*   **Pico Máximo Horário:** **32,234 µg/m³**.
*   **Dias Válidos (\\ge 18h):** **366 dias**.
*   **Ultrapassagens OMS 24h (> 40 µg/m³):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA 24h (> 20 µg/m³):** **0 dias** (confirmado).

### 2.3. VR - Santa Cecília (ID 71)
*   **Média do Período:** **5,868 µg/m³**.
*   **Pico Máximo Horário:** **29,567 µg/m³**.
*   **Dias Válidos (\\ge 18h):** **288 dias**.
*   **Ultrapassagens OMS 24h (> 40 µg/m³):** **0 dias** (confirmado).
*   **Ultrapassagens CONAMA 24h (> 20 µg/m³):** **0 dias** (confirmado).

---

## 3. Veredito de Validação e Segurança
A auditoria atesta que:
*   Todos os dados de SO₂ nas três estações automáticas de Volta Redonda estão em conformidade física e estatística.
*   A ocorrência de **zero (0)** ultrapassagens em todas as estações foi confirmada para ambas as réguas (nacional de 20 µg/m³ e OMS de 40 µg/m³).
*   O comportamento dos sensores é estável e não apresenta desvios sistemáticos de calibração ou lacunas graves na série temporal.

### Veredito Final
A camada de **Dióxido de Enxofre (SO₂) de 2024** está classificada como **PUBLICÁVEL COM CAUTELA**. Ela está pronta para ser liberada na seção experimental da interface pública, mantendo o rótulo de "comparação experimental — sem QA/QC oficial explícito".
