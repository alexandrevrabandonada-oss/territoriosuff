# Estado da Nação — Auditoria do Cache INEA WebLakes PM2.5 2024
## VR - Santa Cecília (ID 71) / PM2.5 (Parâmetro 20)

**Data da Auditoria:** 2026-05-28  
**Fonte dos Dados:** Plataforma pública INEA/WebLakes via cache local  
**Poluente:** Material Particulado Fino (PM2.5)  
**Ano:** 2024  
**Metodologia:** Auditoria técnica de consistência de cache e integridade estrutural.

---

## 1. Cobertura do Cache Raw e Diagnóstico por Mês

| Mês | Esperado (h) | Encontrado (h) | Cobertura (%) | Duplicados | Nulos | Negativos | Zeros | Extremos (>300) | Parser OK |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| 2024-01 | 744h | 710h | 95.43% | 0 | 0 | 0 | 99 | 0 | Sim |
| 2024-02 | 696h | 691h | 99.28% | 0 | 0 | 0 | 74 | 0 | Sim |
| 2024-03 | 744h | 741h | 99.60% | 0 | 0 | 0 | 103 | 0 | Sim |
| 2024-04 | 720h | 715h | 99.31% | 0 | 0 | 0 | 54 | 0 | Sim |
| 2024-05 | 744h | 742h | 99.73% | 0 | 0 | 0 | 48 | 0 | Sim |
| 2024-06 | 720h | 672h | 93.33% | 0 | 0 | 0 | 21 | 0 | Sim |
| 2024-07 | 744h | 744h | 100.00% | 0 | 0 | 0 | 22 | 0 | Sim |
| 2024-08 | 744h | 744h | 100.00% | 0 | 0 | 0 | 54 | 0 | Sim |
| 2024-09 | 720h | 697h | 96.81% | 0 | 0 | 0 | 30 | 0 | Sim |
| 2024-10 | 744h | 738h | 99.19% | 0 | 0 | 0 | 79 | 0 | Sim |
| 2024-11 | 720h | 717h | 99.58% | 0 | 0 | 0 | 87 | 0 | Sim |
| 2024-12 | 744h | 732h | 98.39% | 0 | 0 | 0 | 69 | 0 | Sim |

**Total Anual:** 8643/8784 horas — Cobertura Anual: **98.39%**

---

## 2. Consistência e Estrutura do Parser

O script validou que:
1.  **Célula de Concentração (cell[5]):** Todos os registros válidos exibiram conteúdo HTML consistente na célula indexada 5. O método `parseDataValueSpan()` foi capaz de extrair o atributo `data-value` contendo o número real decimal formatado sem quebra de formato.
2.  **Direção e Velocidade do Vento (cell[6] e cell[7]):** Os campos `wind_speed` e `wind_direction` continuam vindo corretamente de `cell[6]` e `cell[7]` respectivamente, apresentando valores compatíveis com as séries meteorológicas.
3.  **Duplicados e Negativos:** Detectados 0 registros duplicados na série temporal e 0 registros com valores negativos (descartados automaticamente como inválidos).
4.  **Registros Zero:** Encontrados 740 registros iguais a zero absoluto. Estes registros são sinalizados temporariamente como `ZERO_VALUE_REVIEW` para verificar se correspondem a paradas do sensor ou condições físicas singulares.

---

## 3. Conclusão da Auditoria do Cache

Os dados de PM2.5 de VR - Santa Cecília em 2024 encontram-se estruturalmente íntegros. O parser não apresentou falhas de segmentação ou de índice de colunas. Recomenda-se avançar para o recálculo analítico, mantendo-se a sinalização de "sem QA/QC oficial explícito" em conformidade com as diretrizes metodológicas do Observatório do Ar.
