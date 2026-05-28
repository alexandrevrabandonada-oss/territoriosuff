# Estado da Nação — Auditoria e Recálculo PM10 2024 — Estação VR - Belmonte

**ID da Estação:** 69  
**Poluente:** PM10 (µg/m³)  
**Período:** 01/01/2024 a 31/12/2024  
**Nível de Confiança:** Médio (Sem QA/QC Oficial)  
**Data da Auditoria:** 2026-05-28T16:21:51.159Z

---

## 1. Indicadores Anuais Consolidados

*   **Cobertura Anual de Leituras Horárias:** **93.53%** (8216h registradas de 8784h esperadas)
*   **Média Horária Anual:** **30.97 µg/m³**
*   **Concentração Máxima Horária (Pico):** **367.52 µg/m³**
*   **Total de Leituras Válidas:** 8216
*   **Leituras Nulas/Ausentes:** 0
*   **Leituras Iguais a Zero:** 45 (sinalizadas como `ZERO_VALUE_REVIEW`)
*   **Dias com Cobertura Suficiente (≥18h válidas):** **341 dias** (de 366 dias possíveis no ano bissexto)
*   **Excedências da Diretriz OMS 24h (>45 µg/m³):** **48 dias** (cálculo experimental)
*   **Excedências da Lei CONAMA 506/2024 24h (>50 µg/m³):** **28 dias** (cálculo experimental)

---

## 2. Detalhamento Mensal de 2024

| Mês | Esperado (h) | Registrado (h) | Cobertura % | Média (µg/m³) | Máxima (µg/m³) | Dias Válidos | Exced. OMS | Exced. CONAMA 506 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2024-01 | 744h | 710h | 95.4% | 24.13 | 112.71 | 31 dias | 0 | 0 |
| 2024-02 | 696h | 668h | 96.0% | 29.06 | 131.05 | 28 dias | 3 | 0 |
| 2024-03 | 744h | 714h | 96.0% | 28.54 | 139.37 | 30 dias | 3 | 2 |
| 2024-04 | 720h | 709h | 98.5% | 40.14 | 231.12 | 30 dias | 9 | 5 |
| 2024-05 | 744h | 733h | 98.5% | 36.67 | 149.86 | 31 dias | 7 | 3 |
| 2024-06 | 720h | 709h | 98.5% | 39.60 | 367.52 | 30 dias | 9 | 3 |
| 2024-07 | 744h | 729h | 98.0% | 34.08 | 110.58 | 31 dias | 2 | 2 |
| 2024-08 | 744h | 634h | 85.2% | 36.68 | 143.66 | 24 dias | 7 | 5 |
| 2024-09 | 720h | 630h | 87.5% | 39.53 | 140.55 | 26 dias | 7 | 7 |
| 2024-10 | 744h | 686h | 92.2% | 19.70 | 86.06 | 28 dias | 1 | 1 |
| 2024-11 | 720h | 683h | 94.9% | 16.42 | 85.98 | 29 dias | 0 | 0 |
| 2024-12 | 744h | 611h | 82.1% | 26.80 | 95.97 | 23 dias | 0 | 0 |

---

## 3. Conclusão Metodológica

1.  **Integridade do Parser:** A leitura das células HTML extraiu com sucesso os valores decimais originais formatados no atributo `data-value`, garantindo a exatidão física das medições.
2.  **Validade dos Zeros:** Foram encontradas 45 horas com valor zero absoluto. Metodologicamente, estes dados foram mantidos e sinalizados para revisão técnica, sem descarte arbitrário para não inflar as médias artificiais.
3.  **Avaliação OMS e CONAMA:** O cálculo diário foi blindado pela regra de 75% de representatividade horária diária (mínimo de 18 horas válidas por dia). As excedências encontradas representam eventos de atenção em comparação experimental com as réguas OMS e CONAMA.
