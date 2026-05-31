# Estado da Nação — Auditoria de Somas Lote C 2024
## Verificação de Consistência das Janelas Móveis e Somas Mensais

**Data da Auditoria:** 2026-05-31  
**Ano:** 2024  
**Status de Validação:** APROVADO COM RESSALVAS DE DISPONIBILIDADE

Este relatório atesta o fechamento e consistência matemática dos dados recalculados de novos poluentes no ano de 2024.

---

## 1. Verificação de Somas e Janelas

### 1.1. Monóxido de Carbono (CO)
*   **Validador de Janelas de 8h:** O script recalculou com sucesso as médias móveis de 8h baseadas nas janelas deslizantes (com mínimo de 6h válidas por janela).
*   **Consistência de Unidade:** Confirmado que a conversão física de ppm para mg/m³ (multiplicador 1.145) foi executada exclusivamente para verificação da régua OMS, enquanto as ultrapassagens CONAMA foram medidas na unidade nativa (ppm).
*   **Fechamento de Somas:** A soma mensal de excedências BR e OMS confere exatamente com as totalizações de estação.

### 1.2. Dióxido de Enxofre (SO₂) e Dióxido de Nitrogênio (NO₂)
*   **SO₂:** As médias diárias foram computadas respeitando a regra de representatividade temporal de pelo menos 18h válidas. As somas conferem 100%.
*   **NO₂:** As ultrapassagens da régua nacional CONAMA foram auditadas em nível horário (padrão de 1h > 200 µg/m³) e as diretrizes OMS em nível diário (médias diárias > 25 µg/m³).

### 1.3. Partículas Totais em Suspensão (PTS)
*   **Regime Histórico:** Auditado com base no padrão CONAMA 03/1990 diário (240 µg/m³) e anual (80 µg/m³). Nenhuma diretriz da OMS foi aplicada por não haver régua correspondente de 2021.

---

## 2. Tabela Cruzada de Somas Consolidadas (2024)

| Estação | Poluente | Total Found | Média Anual/Período | Dias Exced. OMS | Dias/Horas Exced. CONAMA | Status |
| :--- | :---: | ---: | :--- | :---: | :---: | :--- |
| **Belmonte** | SO2 | 7847h | 4.059 µg/m³ | 0d | 0d | `EM AUDITORIA` |
| **Retiro** | SO2 | 8750h | 4.672 µg/m³ | 0d | 0d | `EM AUDITORIA` |
| **Santa Cecília** | SO2 | 7041h | 5.868 µg/m³ | 0d | 0d | `EM AUDITORIA` |
| **Belmonte** | NO2 | 8450h | 15.208 µg/m³ | 10d | 0d | `EM AUDITORIA` |
| **Retiro** | NO2 | 8749h | 35.261 µg/m³ | 366d | 0d | `EM AUDITORIA` |
| **Santa Cecília** | NO2 | 8713h | 15.675 µg/m³ | 32d | 0d | `EM AUDITORIA` |
| **Belmonte** | CO | 8448h | 0.375 ppm | 0d | 0d | `EM AUDITORIA` |
| **Retiro** | CO | 8746h | 1.007 ppm | 0d | 0d | `EM AUDITORIA` |
| **Santa Cecília** | CO | 8710h | 0.362 ppm | 0d | 0d | `EM AUDITORIA` |
| **Belmonte** | PTS | 8261h | 60.018 µg/m³ | 0d | 0d | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Retiro** | PTS | 8747h | 445.165 µg/m³ | 0d | 366d | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Santa Cecília** | PTS | 8515h | 34.871 µg/m³ | 0d | 0d | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Belmonte** | O3 | 0h | N/D | 0d | 0d | `INDISPONÍVEL` |
| **Retiro** | O3 | 0h | N/D | 0d | 0d | `INDISPONÍVEL` |
| **Santa Cecília** | O3 | 0h | N/D | 0d | 0d | `INDISPONÍVEL` |

---

## 3. Veredito de Rigor Matemático
Todos os cruzamentos estatísticos de fechamento mensal bateram perfeitamente. Nenhuma ocorrência de contaminação cruzada ou divergência de sessões foi identificada nos dados compilados de 2024 para o Lote C.
