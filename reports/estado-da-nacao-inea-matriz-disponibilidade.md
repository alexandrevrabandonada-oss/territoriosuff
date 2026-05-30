# Estado da Nação — Matriz de Disponibilidade de Dados Horários (INEA/WebLakes)

Este relatório apresenta a Matriz de Disponibilidade amostral de dados horários brutos do portal governamental INEA/WebLakes para o município de Volta Redonda-RJ, cobrindo 14 anos (2013–2026), 4 estações e 7 parâmetros.

---

## 1. Visão Geral do Diagnóstico

*   **Total de Combinações Testadas:** 392 (4 estações × 7 parâmetros × 14 anos).
*   **Amostragem Executada:** Janelas curtas de 3 dias em janeiro, abril, julho e setembro (2026 testado até abril).
*   **Resultados Gerais:**
    *   **Disponível (AVAILABLE):** 209 combinações (todas as janelas amostrais com dados físicos).
    *   **Disponível Provável (LIKELY_AVAILABLE):** 45 combinações (maioria das janelas amostradas com dados).
    *   **Vazio (EMPTY):** 138 combinações (janelas retornaram zero registros).
    *   **Erro (ERROR):** 0 combinações (nenhum erro crítico de rede ou recusa de sessão persistiu).
    *   **Parser/Unidade (REVIEW):** 0 combinações (unidades e parsers validados com 100% de sucesso).

---

## 2. Disponibilidade por Estação

| ID Estação | Nome Curto | Status Geral de Disponibilidade | Observações |
| :--- | :--- | :--- | :--- |
| **69** | VR - Belmonte | **Excelente** (72 AVAILABLE, 12 LIKELY, 14 EMPTY) | Cobertura robusta de dados históricos. |
| **70** | VR - Retiro | **Excelente** (70 AVAILABLE, 13 LIKELY, 15 EMPTY) | Cobertura robusta de dados históricos. |
| **71** | VR - Santa Cecília | **Excelente** (67 AVAILABLE, 20 LIKELY, 11 EMPTY) | Cobertura robusta de dados históricos. |
| **72** | VR - Meteorológica | **Sem Dados** (98 EMPTY) | Não possui dados de poluentes de qualidade do ar. |

---

## 3. Disponibilidade por Parâmetro (Poluente)

| Poluente | ID Parâmetro | Unidade Esperada | Anos Disponíveis | Lacunas e Limitações Detectadas |
| :--- | :---: | :---: | :--- | :--- |
| **PM10** | 18 | µg/m³ | 2013–2026 | Disponível para todo o período histórico. |
| **PM2.5** | 20 | µg/m³ | 2021–2026 | **Indisponível antes de 2021** (2013–2020 retornam 100% EMPTY). |
| **SO2** | 23 | µg/m³ | 2013–2026 | Disponível para todo o período nas 3 principais estações. |
| **NO2** | 1465 | µg/m³ | 2013–2026 | Disponível para todo o período nas 3 principais estações. |
| **O3** | 2130 | µg/m³ | Parcial | **Grandes lacunas detectadas**: Belmonte (69) está vazio em 2019-2024. Retiro (70) está vazio em 2017-2021 e 2023-2024. Santa Cecília (71) tem melhor cobertura, mas vazio em 2021, 2024 e 2026. |
| **CO** | 3 | ppm | 2013–2026 | Disponível para todo o período nas 3 principais estações. |
| **PTS** | 1955 | µg/m³ | 2013–2026 | Disponível para todo o período nas 3 principais estações. |

---

## 4. Análise de Cobertura Potencial por Ano

*   **2021 a 2025:** Anos com a maior cobertura potencial agregada de parâmetros, contendo dados físicos ativos para particulados finos (PM2.5) e grossos (PM10).
*   **2013 a 2020:** Anos com boa cobertura histórica para PM10, SO2, NO2, CO e PTS, mas **completamente vazios para PM2.5**.
*   **2026 (Parcial):** Dados iniciais (janelas de janeiro e abril) respondendo corretamente com status ativo.

---

## 5. Parâmetros com Revisão de Unidade e Métricas Especiais

*   **CO (Monóxido de Carbono):**
    *   **Identificação:** A plataforma exibe leituras de CO na unidade `ppm`.
    *   **Régua OMS:** O limite de saúde da OMS é estipulado em `mg/m³`.
    *   **Regra de Conversão:** Implementada em `derivedMetrics.ts` com a fórmula física correspondente (multiplicação por 1.145 sob condições normais de 25°C e 1 atm) para permitir comparações corretas contra as metas de saúde.
*   **O3 (Ozônio) e CO:**
    *   **Averaging Period:** Exigem o cálculo de **média móvel de 8 horas** para a avaliação correta de excedências. A função genérica `computeMoving8h` foi validada e aplicada a ambos os parâmetros.
*   **PTS (Partículas Totais em Suspensão):**
    *   Trata-se de um parâmetro de monitoramento histórico regulatório nacional. Não possui limite de saúde estabelecido pela OMS 2021. Deve ser tratado estritamente como registro histórico-técnico comparativo contra o limite nacional histórico revogado da CONAMA 03/1990 (240 µg/m³ diário e 80 µg/m³ anual).

---

## 6. Próximos Passos de Coleta Recomendados

1.  **Lote A (Imediato):** Coleta completa de PM10 e PM2.5 para os anos de 2025 e 2026 (parcial) nas três estações principais (Belmonte, Retiro, Santa Cecília).
2.  **Lote B (Histórico PM10):** Coleta da série de PM10 para os anos de 2020, 2021 e 2022 (para fechar o ciclo plurianual completo antes do período atual do Observatório).
3.  **Lote C (Expansão de Parâmetros):** Coleta do SO2, NO2, O3, CO e PTS referentes ao ano de 2024 para homologação da nova camada de gasosos e particulados totais.
