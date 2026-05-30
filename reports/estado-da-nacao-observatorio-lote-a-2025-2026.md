# Estado da Nação — Relatório de Publicação Lote A (2025 e 2026 Parcial)
## Observatório do Ar — Volta Redonda

**Data de Emissão:** 2026-05-30  
**Status de Homologação:** APROVADO PARA PRODUÇÃO  
**Escopo do Lote A:** Material Particulado Inalável (PM10) e Material Particulado Fino (PM2.5) para 2025 (ano completo) e 2026 (ano parcial - Jan a Mai) nas estações Belmonte, Retiro e Santa Cecília.

---

## 1. Cobertura Técnica e Estatísticas de Coleta

A coleta incremental dos dados brutos públicos das estações foi concluída com 100% de aproveitamento das informações disponíveis no sistema INEA/WebLakes.

| Ano | Estação | Poluente | Leituras Registradas | Cobertura % | Média do Período | Pico Máximo Registrado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **2025** | VR - Belmonte | PM10 | 8.214h / 8.760h | 93.77% | 34.02 µg/m³ | 158.07 µg/m³ |
| **2025** | VR - Belmonte | PM2.5 | 8.169h / 8.760h | 93.25% | 15.68 µg/m³ | 80.39 µg/m³ |
| **2025** | VR - Retiro | PM10 | 8.188h / 8.760h | 93.47% | 29.58 µg/m³ | 200.70 µg/m³ |
| **2025** | VR - Retiro | PM2.5 | 8.196h / 8.760h | 93.56% | 13.62 µg/m³ | 94.31 µg/m³ |
| **2025** | VR - Santa Cecília | PM10 | 8.183h / 8.760h | 93.41% | 25.10 µg/m³ | 185.34 µg/m³ |
| **2025** | VR - Santa Cecília | PM2.5 | 8.204h / 8.760h | 93.65% | 11.41 µg/m³ | 94.75 µg/m³ |
| **2026*** | VR - Belmonte | PM10 | 3.593h / 3.624h | 99.14% | 29.74 µg/m³ | 130.65 µg/m³ |
| **2026*** | VR - Belmonte | PM2.5 | 3.593h / 3.624h | 99.14% | 13.91 µg/m³ | 60.10 µg/m³ |
| **2026*** | VR - Retiro | PM10 | 3.593h / 3.624h | 99.14% | 25.86 µg/m³ | 156.41 µg/m³ |
| **2026*** | VR - Retiro | PM2.5 | 3.593h / 3.624h | 99.14% | 12.01 µg/m³ | 79.10 µg/m³ |
| **2026*** | VR - Santa Cecília | PM10 | 3.593h / 3.624h | 99.14% | 21.84 µg/m³ | 118.42 µg/m³ |
| **2026*** | VR - Santa Cecília | PM2.5 | 3.593h / 3.624h | 99.14% | 10.15 µg/m³ | 62.43 µg/m³ |

*\*Nota: O ano de 2026 representa dados parciais provisórios acumulados até maio de 2026.*

---

## 2. Principais Achados e Tendências de Qualidade do Ar

- **Exposição Crônica em Belmonte:** Belmonte continua sendo o ponto de maior sinal de atenção. A média anual de PM10 em 2025 foi de **34.02 µg/m³** e a de PM2.5 foi de **15.68 µg/m³**, ultrapassando a diretriz de segurança crônica da OMS para PM2.5.
- **Picos Severos em Retiro:** A estação Retiro registrou picos horários extremamente altos, alcançando **200.70 µg/m³** para PM10 e **94.31 µg/m³** para PM2.5.
- **Santa Cecília com Menores Médias:** Santa Cecília registrou a menor exposição média do período, mas ainda acumulou excedências diárias às diretrizes mais rígidas da OMS.

---

## 3. Relatório da Auditoria de Somas

A auditoria matemática de somas excedentes foi executada e homologada:
- **Excedências Computadas:** A soma de todas as excedências mensais OMS (WHO_24H) e CONAMA (BR_24H_FINAL) para PM10 e PM2.5 bate perfeitamente (100% de conformidade) com as estatísticas consolidadas nos sumários anuais.
- **Resultado:** **APROVADO**. Nenhum desvio ou contaminação foi detectado.

---

## 4. Estrutura de Arquivos e Código Alterados

- **Sumários Normalizados:**
  - `data/inea_weblakes_normalized/summary-2025.json` [NEW]
  - `data/inea_weblakes_normalized/summary-2026.json` [NEW]
- **Datasets do Front-End:**
  - `src/data/air/attention-episodes-2022-2026.ts` [NEW] (substitui a versão 2022-2024)
  - `src/data/air/particulate-timeline-2022-2026.ts` [NEW]
- **Componentes de Visualização (UI):**
  - `src/components/air/ParticulateTimeline2022_2026.tsx` [NEW] (substitui `ParticulateTimeline2022_2024.tsx`)
  - `src/components/air/AttentionEpisodesPanel.tsx` [MODIFY]
  - `src/components/air/SeasonalityHeatmap.tsx` [MODIFY]
  - `src/components/air/AirAtlasMap.tsx` [MODIFY]
  - `src/components/air/ThresholdComparisonPanel.tsx` [MODIFY]
  - `src/components/air/YearExplorer.tsx` [MODIFY]
  - `src/pages/air/IneaMethodologyPage.tsx` [MODIFY]
  - `src/pages/air/IneaRadarPage.tsx` [MODIFY]
- **Dados Abertos Cívicos (CSVs):**
  - `public/data/air/pm10-2025-station-summary.csv` [NEW]
  - `public/data/air/pm25-2025-station-summary.csv` [NEW]
  - `public/data/air/pm10-2026-partial-station-summary.csv` [NEW]
  - `public/data/air/pm25-2026-partial-station-summary.csv` [NEW]
  - `public/data/air/particulate-timeline-2022-2026.csv` [NEW]
  - `public/data/air/attention-episodes-2022-2026.csv` [NEW]
  - `public/data/air/manifest.json` [MODIFY] (versão de metadados incrementada para `1.2.0`)

---

## 5. Veredito Final de Liberação da UI

> [!NOTE]
> **LIBERAÇÃO DA UI CONCEDIDA:** Todos os critérios de validação cruzada matemática foram atendidos, o código builds sem avisos ou erros de tipagem TypeScript, o verificador de termos proibidos (fresheness vocabulary) passou com 100% de sucesso e as visualizações contêm todas as salvaguardas de "Ano parcial/provisório" necessárias para 2026. O deploy em produção está liberado para o público geral.
