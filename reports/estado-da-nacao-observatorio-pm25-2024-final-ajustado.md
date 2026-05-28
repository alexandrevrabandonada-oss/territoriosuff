# Estado da Nação — Microcorreção Final e Ajuste Técnico PM2.5/2024

**Poluente:** PM2.5 (Material Particulado Fino)  
**Ano de Referência:** 2024  
**Data do Ajuste:** 2026-05-28  
**Status Metodológico:** Comparação experimental — Sem QA/QC oficial explícito  

---

## 1. Ajustes Realizados (Tijolo 29.1)

Em conformidade com a auditoria de consistência e refinamento editorial do conselho técnico, realizamos correções de precisão comparativa e factual no relatório comparativo de estações do ano de 2024.

As seguintes alterações foram aplicadas no relatório comparativo de PM2.5 ([estado-da-nacao-inea-pm25-2024-comparativo-estacoes.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-inea-pm25-2024-comparativo-estacoes.md)):

1.  **Refinamento de Padrões e Médias (Correção 1):**
    *   *Antes:* "Ambas apresentaram médias que ultrapassam os limites nacionais e da OMS..."
    *   *Depois:* `"Belmonte ultrapassa a média anual da OMS e da CONAMA 506; Retiro e Santa Cecília ficam abaixo da média anual da CONAMA 506, mas acima da diretriz anual da OMS."`
    *   *Justificativa:* Correção de precisão metodológica. A média anual do PM2.5 de Belmonte (11,33 µg/m³) ultrapassa tanto o limite da OMS (5 µg/m³) quanto o padrão CONAMA 506 (10 µg/m³). No entanto, Retiro (9,34 µg/m³) e Santa Cecília (8,88 µg/m³) excedem a OMS, mas estão abaixo da média anual da CONAMA 506, não devendo ser descritos como ultrapassando ambos os limites.

2.  **Identificação Factual de Pico Horário (Correção 2):**
    *   *Antes:* "...com Belmonte mostrando também o maior pico horário..."
    *   *Depois:* `"Retiro registrou o maior pico horário pontual de PM2.5 no ano."`
    *   *Justificativa:* Correção factual. O maior pico de concentração horária pontual observado em 2024 foi na estação VR - Retiro (208,58 µg/m³), superando os picos de VR - Santa Cecília (132,25 µg/m³) e VR - Belmonte (84,19 µg/m³).

---

## 2. Consolidação dos Fatos e Indicadores (PM2.5 / 2024)

Com a revisão concluída, os indicadores finais para o Material Particulado Fino (PM2.5) mantêm os seguintes parâmetros consolidados:

*   **VR - Belmonte:**
    *   Registrou a **maior média anual** entre as três estações analisadas (11,33 µg/m³).
    *   Registrou o **maior número de dias acima do limite diário CONAMA 506** (14 dias).
*   **VR - Retiro:**
    *   Registrou o **maior pico horário pontual** do ano (208,58 µg/m³).
    *   Média anual de 9,34 µg/m³ (excede diretriz anual da OMS, abaixo do limite nacional da CONAMA 506).
*   **VR - Santa Cecília:**
    *   Registrou a **menor média anual** registrada entre as três estações analisadas (8,88 µg/m³).
    *   Média anual excede diretriz anual da OMS, mas fica abaixo da média anual da CONAMA 506.

---

## 3. Resultados de Verificação e QA

*   **Linter de Termos de Freshness (`npm run inea:qa:language`):** **PASS**
    *   A conformidade editorial foi verificada, atestando que nenhuma expressão restrita de monitoramento instantâneo (não representa tempo real) ou ao vivo (não representa tempo real) foi inserida no material público.
*   **Pipeline de Compilação do Projeto (`npm run verify`):** **PASS**
    *   A execução completa do validador (eslint, typecheck e build) foi efetuada de forma limpa, garantindo a integridade técnica de toda a aplicação do portal SEMEAR.
