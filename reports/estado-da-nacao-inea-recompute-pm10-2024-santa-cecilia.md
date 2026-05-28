# Estado da Nação — Auditoria e Recálculo PM10 2024 — Estação VR - Santa Cecília

**ID da Estação:** 71  
**Poluente:** PM10 (µg/m³)  
**Período:** 01/01/2024 a 31/12/2024  
**Nível de Confiança:** Médio (Sem QA/QC Oficial)  
**Data da Auditoria:** 2026-05-28T16:21:51.160Z

---

## 1. Indicadores Anuais Consolidados

*   **Cobertura Anual de Leituras Horárias:** **96.90%** (8512h registradas de 8784h esperadas)
*   **Média Horária Anual:** **18.01 µg/m³**
*   **Concentração Máxima Horária (Pico):** **212.70 µg/m³**
*   **Total de Leituras Válidas:** 8512
*   **Leituras Nulas/Ausentes:** 0
*   **Leituras Iguais a Zero:** 255 (sinalizadas como `ZERO_VALUE_REVIEW`)
*   **Dias com Cobertura Suficiente (≥18h válidas):** **358 dias** (de 366 dias possíveis no ano bissexto)
*   **Excedências da Diretriz OMS 24h (>45 µg/m³):** **5 dias** (cálculo experimental)
*   **Excedências da Lei CONAMA 506/2024 24h (>50 µg/m³):** **2 dias** (cálculo experimental)

---

## 2. Detalhamento Mensal de 2024

| Mês | Esperado (h) | Registrado (h) | Cobertura % | Média (µg/m³) | Máxima (µg/m³) | Dias Válidos | Exced. OMS | Exced. CONAMA 506 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2024-01 | 744h | 669h | 89.9% | 17.80 | 165.13 | 29 dias | 0 | 0 |
| 2024-02 | 696h | 673h | 96.7% | 17.37 | 110.50 | 29 dias | 0 | 0 |
| 2024-03 | 744h | 707h | 95.0% | 16.02 | 114.62 | 30 dias | 0 | 0 |
| 2024-04 | 720h | 700h | 97.2% | 19.94 | 119.49 | 30 dias | 0 | 0 |
| 2024-05 | 744h | 737h | 99.1% | 22.48 | 190.76 | 31 dias | 1 | 0 |
| 2024-06 | 720h | 670h | 93.1% | 25.50 | 212.70 | 27 dias | 0 | 0 |
| 2024-07 | 744h | 743h | 99.9% | 22.61 | 129.55 | 31 dias | 0 | 0 |
| 2024-08 | 744h | 743h | 99.9% | 21.01 | 125.01 | 31 dias | 1 | 1 |
| 2024-09 | 720h | 693h | 96.3% | 27.74 | 155.30 | 28 dias | 3 | 1 |
| 2024-10 | 744h | 732h | 98.4% | 10.88 | 169.73 | 31 dias | 0 | 0 |
| 2024-11 | 720h | 717h | 99.6% | 7.52 | 53.47 | 30 dias | 0 | 0 |
| 2024-12 | 744h | 728h | 97.8% | 7.94 | 86.19 | 31 dias | 0 | 0 |

---

## 3. Conclusão Metodológica

1.  **Integridade do Parser:** A leitura das células HTML extraiu com sucesso os valores decimais originais formatados no atributo `data-value`, garantindo a exatidão física das medições.
2.  **Validade dos Zeros:** Foram encontradas 255 horas com valor zero absoluto. Metodologicamente, estes dados foram mantidos e sinalizados para revisão técnica, sem descarte arbitrário para não inflar as médias artificiais.
3.  **Avaliação OMS e CONAMA:** O cálculo diário foi blindado pela regra de 75% de representatividade horária diária (mínimo de 18 horas válidas por dia). As excedências encontradas representam eventos de atenção em comparação experimental com as réguas OMS e CONAMA.
