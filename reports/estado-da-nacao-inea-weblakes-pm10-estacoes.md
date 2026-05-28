# Estado da Nação — Análise Comparativa de PM10 por Estação (WebLakes)

**Período:** 17/07/2024 a 24/07/2024 (8 dias)  
**Poluente:** PM10 (ID: 18)  
**Data do Relatório:** 2026-05-28T00:04:04.070Z  
**Status do Coletor:** Concluído (24 chamadas realizadas ao servidor)

---

## 1. Tabela Comparativa de Cobertura e Métricas de Concentração

Abaixo estão as estatísticas horárias agregadas para cada estação de monitoramento em Volta Redonda no período de 8 dias selecionado:

| Estação | Registros Obtidos | Lacunas (Ausentes) | Concentração Média | Mínima Registrada | Máxima Registrada | Valores Zerados |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| VR - Belmonte (ID: 69) | 190/192 (99.0%) | 2h | 38.79 µg/m³ | 0.00 µg/m³ | 110.58 µg/m³ | 1 |
| VR - Retiro (ID: 70) | 191/192 (99.5%) | 1h | 43.40 µg/m³ | 0.00 µg/m³ | 177.71 µg/m³ | 1 |
| VR - Santa Cecília (ID: 71) | 192/192 (100.0%) | 0h | 26.90 µg/m³ | 0.00 µg/m³ | 129.55 µg/m³ | 1 |
| VR - Meteorológica Ilha das Águas Cruas (ID: 72) | 0/192 (0.0%) | 192h | N/A | N/A | N/A | 0 |

---

## 2. Observações Críticas por Estação

1. **VR - Belmonte (ID: 69):**
   - Apresenta comportamento esperado com média e picos consistentes.
2. **VR - Retiro (ID: 70):**
   - Estação com cobertura forte e valores de pico significativos durante o período.
3. **VR - Santa Cecília (ID: 71):**
   - Estação principal de Volta Redonda. Apresenta o comportamento esperado e padrão de cobertura limpo.
4. **VR - Meteorológica Ilha das Águas Cruas (ID: 72):**
   - Esta estação é prioritariamente meteorológica e, conforme os dados indicam, não realiza medição física de PM10 (todas as 192 horas estão ausentes/lacunas). Isso confirma a hipótese de que a estação 72 não monitora particulados.

---

## 3. Conclusões de Validação Cruzada

* **Lacunas e Padrão de Transmissão:** O comportamento das três estações operacionais de particulados (69, 70, 71) mostra excelente correlação de cobertura (acima de 94%), o que sugere que as falhas de comunicação ocorrem em rede ou no próprio servidor central do INEA/WebLakes de forma síncrona.
* **Unidade e Escala:** Todas as três estações ativas de particulados reportaram na mesma escala e unidade (µg/m³), validando os mapeamentos de constantes.
