# Estado da Nação — Auditoria do Cache INEA WebLakes PM2.5 2024
## VR - Retiro (ID 70) / PM2.5 (Parâmetro 20)

**Data da Auditoria:** 2026-05-28  
**Fonte dos Dados:** Plataforma pública INEA/WebLakes via cache local  
**Poluente:** Material Particulado Fino (PM2.5)  
**Ano:** 2024  
**Metodologia:** Auditoria técnica de consistência de cache e integridade estrutural.

---

## 1. Cobertura do Cache Raw e Diagnóstico por Mês

| Mês | Esperado (h) | Encontrado (h) | Cobertura (%) | Duplicados | Nulos | Negativos | Zeros | Extremos (>300) | Parser OK |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| 2024-01 | 744h | 742h | 99.73% | 0 | 0 | 0 | 99 | 0 | Sim |
| 2024-02 | 696h | 695h | 99.86% | 0 | 0 | 0 | 39 | 0 | Sim |
| 2024-03 | 744h | 744h | 100.00% | 0 | 0 | 0 | 42 | 0 | Sim |
| 2024-04 | 720h | 717h | 99.58% | 0 | 0 | 0 | 20 | 0 | Sim |
| 2024-05 | 744h | 743h | 99.87% | 0 | 0 | 0 | 29 | 0 | Sim |
| 2024-06 | 720h | 718h | 99.72% | 0 | 0 | 0 | 19 | 0 | Sim |
| 2024-07 | 744h | 742h | 99.73% | 0 | 0 | 0 | 13 | 0 | Sim |
| 2024-08 | 744h | 744h | 100.00% | 0 | 0 | 0 | 50 | 0 | Sim |
| 2024-09 | 720h | 709h | 98.47% | 0 | 0 | 0 | 16 | 0 | Sim |
| 2024-10 | 744h | 743h | 99.87% | 0 | 0 | 0 | 70 | 0 | Sim |
| 2024-11 | 720h | 719h | 99.86% | 0 | 0 | 0 | 59 | 0 | Sim |
| 2024-12 | 744h | 739h | 99.33% | 0 | 0 | 0 | 65 | 0 | Sim |

**Total Anual:** 8755/8784 horas — Cobertura Anual: **99.67%**

---

## 2. Consistência e Estrutura do Parser

O script validou que:
1.  **Célula de Concentração (cell[5]):** Todos os registros válidos exibiram conteúdo HTML consistente na célula indexada 5. O método `parseDataValueSpan()` foi capaz de extrair o atributo `data-value` contendo o número real decimal formatado sem quebra de formato.
2.  **Direção e Velocidade do Vento (cell[6] e cell[7]):** Os campos `wind_speed` e `wind_direction` continuam vindo corretamente de `cell[6]` e `cell[7]` respectivamente, apresentando valores compatíveis com as séries meteorológicas.
3.  **Duplicados e Negativos:** Detectados 0 registros duplicados na série temporal e 0 registros com valores negativos (descartados automaticamente como inválidos).
4.  **Registros Zero:** Encontrados 521 registros iguais a zero absoluto. Estes registros são sinalizados temporariamente como `ZERO_VALUE_REVIEW` para verificar se correspondem a paradas do sensor ou condições físicas singulares.

---

## 3. Conclusão da Auditoria do Cache

Os dados de PM2.5 de VR - Retiro em 2024 encontram-se estruturalmente íntegros. O parser não apresentou falhas de segmentação ou de índice de colunas. Recomenda-se avançar para o recálculo analítico, mantendo-se a sinalização de "sem QA/QC oficial explícito" em conformidade com as diretrizes metodológicas do Observatório do Ar.
