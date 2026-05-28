# Estado da Nação — QA de Consistência do Cache WebLakes 2024
## VR-Retiro / PM10 (Parâmetro 18)

**Data de auditoria:** 2026-05-28  
**Fonte dos dados:** Cache local WebLakes/INEAPublico (sem chamadas adicionais à API)  
**Metodologia:** Experimental — sem QA/QC explícito da plataforma WebLakes  
**Resolução:** Dados brutos com média horária, agregados em diária com mínimo de 18 leituras  

> ⚠ **Aviso metodológico:** Os dados provêm de plataforma pública sem validação explícita.
> Todos os resultados devem ser tratados como experimentais. Ausência de dado não é ar bom.

---

## 1. Diagnóstico do Cache Raw

| Mês | Esperado | Encontrado | Cobertura | Válidos | Zeros | Nulos | Cache OK |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| 2024-01 | 744h | 718h | 96.5% | 699 | 19 | 0 | ✓ |
| 2024-02 | 696h | 671h | 96.4% | 669 | 2 | 0 | ✓ |
| 2024-03 | 744h | 721h | 96.9% | 720 | 1 | 0 | ✓ |
| 2024-04 | 720h | 710h | 98.6% | 706 | 4 | 0 | ✓ |
| 2024-05 | 744h | 742h | 99.7% | 741 | 1 | 0 | ✓ |
| 2024-06 | 720h | 716h | 99.4% | 714 | 2 | 0 | ✓ |
| 2024-07 | 744h | 719h | 96.6% | 717 | 2 | 0 | ✓ |
| 2024-08 | 744h | 739h | 99.3% | 738 | 1 | 0 | ✓ |
| 2024-09 | 720h | 708h | 98.3% | 708 | 0 | 0 | ✓ |
| 2024-10 | 744h | 731h | 98.3% | 725 | 6 | 0 | ✓ |
| 2024-11 | 720h | 639h | 88.8% | 637 | 2 | 0 | ✓ |
| 2024-12 | 744h | 684h | 91.9% | 671 | 13 | 0 | ✓ |

**Total:** 8498/8784 horas encontradas — cobertura anual: **96.7%**

---

## 2. Consistência do Parser (data-value span)

✅ **Parser consistente** em todos os 12 meses analisados.  
O método `parseDataValueSpan()` extraiu corretamente o atributo `data-value` de todos os spans HTML nos arquivos de cache.

---

## 3. Recálculo de Métricas PM10 Mensais

| Mês | Média Horária | Máxima Horária | Dias c/ Dados | Excedências OMS (>45 µg/m³) | Excedências CONAMA 506 (>50 µg/m³) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 2024-01 | 25.16 µg/m³ | 136.14 µg/m³ | 30 | 0 | 0 |
| 2024-02 | 26.37 µg/m³ | 139.63 µg/m³ | 28 | 2 | 1 |
| 2024-03 | 24.91 µg/m³ | 167.19 µg/m³ | 31 | 1 | 1 |
| 2024-04 | 32.82 µg/m³ | 209.29 µg/m³ | 30 | 2 | 2 |
| 2024-05 | 29.24 µg/m³ | 205.06 µg/m³ | 31 | 3 | 2 |
| 2024-06 | 36.33 µg/m³ | 193.41 µg/m³ | 30 | 7 | 3 |
| 2024-07 | 35.19 µg/m³ | 177.71 µg/m³ | 29 | 4 | 3 |
| 2024-08 | 35.66 µg/m³ | 134.21 µg/m³ | 31 | 10 | 8 |
| 2024-09 | 45.54 µg/m³ | 211.66 µg/m³ | 29 | 14 | 10 |
| 2024-10 | 30.97 µg/m³ | 300.76 µg/m³ | 31 | 3 | 3 |
| 2024-11 | 18.89 µg/m³ | 93.61 µg/m³ | 29 | 0 | 0 |
| 2024-12 | 15.16 µg/m³ | 62.56 µg/m³ | 28 | 0 | 0 |

**Resumo anual PM10 — VR-Retiro 2024 (dados experimentais):**
- Média horária anual: **29.89 µg/m³**
- Pico horário anual: **300.76 µg/m³**
- Dias com dados suficientes: **357**
- Excedências experimentais OMS 24h (>45 µg/m³): **46 dias**
- Excedências experimentais CONAMA 506/2024 (>50 µg/m³): **33 dias**

---

## 4. Régua Legal — CONAMA 506/2024

A resolução CONAMA 506/2024 substituiu a CONAMA 491/2018. Para PM10:

| Regime | Período | Valor (µg/m³) | Status Legal |
| :--- | :--- | ---: | :--- |
| CONAMA 506/2024 Padrão Final | 24h | 50 | Vigente |
| OMS 2021 | 24h | 45 | Recomendação internacional |
| OMS 2021 | Anual | 15 | Recomendação internacional |

> O valor CONAMA 506/2024 de 50 µg/m³ (24h) é numericamente idêntico ao Padrão Final da CONAMA 491/2018.
> A migração de régua legal não altera os valores-limite do padrão final para PM10,
> mas contextualiza a referência normativa correta vigente em 2024.

---

## 5. Nível de Confiança dos Resultados

🟢 **Nível de confiança: ALTO**

Cobertura ≥90%, parser consistente em todos os meses, sem truncamento detectado.

---

## 6. Notas de Auditoria

- 2024-01-03: apenas 11 leituras horárias — média diária não calculável (mínimo 18).
- 2024-02-15: apenas 13 leituras horárias — média diária não calculável (mínimo 18).
- 2024-07-29: apenas 12 leituras horárias — média diária não calculável (mínimo 18).
- 2024-07-30: apenas 11 leituras horárias — média diária não calculável (mínimo 18).
- 2024-09-24: apenas 14 leituras horárias — média diária não calculável (mínimo 18).
- 2024-11-16: apenas 16 leituras horárias — média diária não calculável (mínimo 18).
- 2024-12-03: apenas 16 leituras horárias — média diária não calculável (mínimo 18).
- 2024-12-06: apenas 16 leituras horárias — média diária não calculável (mínimo 18).
- 2024-12-10: apenas 15 leituras horárias — média diária não calculável (mínimo 18).

---

## 7. Origem e Integridade do Cache

- **Fonte das chamadas originais:** `scripts/inea-weblakes-historical-extract.ts` e piloto `scripts/inea-weblakes-pilot.ts`
- **Localização do cache:** `.cache/inea/weblakes/raw/70/18/`
- **Total de arquivos mensais verificados:** 12
- **API calls adicionais realizadas nesta auditoria:** 0 (100% de cache local)
- **Nenhum dado foi modificado no cache** durante esta auditoria — leitura somente.

---

## 8. Próximos Passos Recomendados

1. Validar que os zeros (53 horas) correspondem a lacunas reais de medição ou falhas de sensor.
2. Antes de publicar excedências como afirmação definitiva, verificar via cruzamento com fonte IQAr/Dados Abertos RJ para o mesmo período.
3. Atualizar todos os relatórios e componentes do Observatório para referenciar CONAMA 506/2024 como régua legal vigente.
4. Implementar rótulo de nível de confiança (ALTO) na interface pública do Observatório.
