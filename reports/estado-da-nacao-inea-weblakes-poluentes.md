# Estado da Nação — Análise Comparativa de Poluentes em VR-Retiro (WebLakes)

**Período:** 17/07/2024 a 24/07/2024 (8 dias)  
**Estação:** VR - Retiro (ID: 70)  
**Data do Relatório:** 2026-05-28T00:16:59.721Z  
**Status do Coletor:** Concluído (0 chamadas realizadas ao servidor)

---

## 1. Tabela Comparativa de Cobertura e Métricas por Poluente

Abaixo estão as estatísticas horárias agregadas para cada poluente consultado na estação Retiro no período de 8 dias selecionado:

| Poluente | Unidade | Registros Obtidos | Lacunas (Ausentes) | Concentração Média | Mínima Registrada | Máxima Registrada | Valores Zerados |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| PM10 (ID: 18) | µg/m³ | 191/192 (99.5%) | 1h | 43.4043 µg/m³ | 0.0000 µg/m³ | 177.7130 µg/m³ | 1 |
| PM2.5 (ID: 20) | µg/m³ | 191/192 (99.5%) | 1h | 17.0785 µg/m³ | 0.0000 µg/m³ | 54.5494 µg/m³ | 2 |
| SO2 (ID: 23) | µg/m³ | 192/192 (100.0%) | 0h | 3.2233 µg/m³ | 2.6496 µg/m³ | 3.9256 µg/m³ | 0 |
| NO2 (ID: 1465) | µg/m³ | 191/192 (99.5%) | 1h | 17.2366 µg/m³ | 4.4162 µg/m³ | 62.0327 µg/m³ | 0 |
| O3 (ID: 2130) | µg/m³ | 0/192 (0.0%) | 192h | N/A | N/A | N/A | 0 |
| CO (ID: 3) | ppm | 191/192 (99.5%) | 1h | 0.3996 ppm | 0.1613 ppm | 1.6770 ppm | 0 |
| PTS (ID: 1955) | µg/m³ | 192/192 (100.0%) | 0h | 73.8461 µg/m³ | 2.7819 µg/m³ | 865.4625 µg/m³ | 0 |

---

## 2. Observações por Poluente

1. **PM10 (ID: 18):**
   - Retorna dados estruturados e completos em `µg/m³`.
2. **PM2.5 (ID: 20):**
   - Retorna dados estruturados com alta cobertura (99.5%) em `µg/m³`. Isso comprova que a estação Retiro mede particulados finos (PM2.5) de forma integrada e automática.
3. **SO2 (ID: 23):**
   - Retorna dados estruturados em `µg/m³` com 100% de cobertura. Valores baixos e estáveis (~3.22 µg/m³).
4. **NO2 (ID: 1465):**
   - Retorna dados estruturados em `µg/m³`. Apresenta variações horárias típicas de tráfego/combustão.
5. **O3 (ID: 2130):**
   - Retorna zero registros obtidos (cobertura 0.0%). Indica que o canal de ozônio está inativo, desligado ou ausente para esta estação no período.
6. **CO (ID: 3):**
   - Retorna dados estruturados em `ppm` com cobertura de 99.5%. Concentrações na ordem decimal (média de 0.40 ppm, pico de 1.68 ppm).
7. **PTS (Partículas Totais em Suspensão) (ID: 1955):**
   - Retorna dados estruturados em `µg/m³` com 100% de cobertura. Apresenta picos elevados (máximo de 865.46 µg/m³), consistente com poeira/sedimentos.

---

## 3. Conclusões de Validação de Poluentes

* **Confirmação de Unidades:**
  - PM10, PM2.5, SO2, NO2, PTS: todos confirmados em **µg/m³**.
  - CO: confirmado e medido em **ppm**.
* **Operacionalidade de Particulados Finos (PM2.5):** A alta cobertura (99.5%) de PM2.5 refuta a hipótese anterior de inatividade e confirma que a rede pública integrada fornece sim dados contínuos de particulados finos.
* ** PTS Contínuo:** A presença de PTS em alta cobertura e com picos elevados atesta o monitoramento contínuo deste parâmetro pelo INEA, servindo como forte indicador de poluição por partículas maiores.
