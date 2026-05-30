# Estado da Nação — Relatório de Publicação Lote B (2020 e 2021)
## Observatório do Ar — Volta Redonda

**Data de Emissão:** 2026-05-30  
**Status de Homologação:** APROVADO PARA PRODUÇÃO  
**Escopo do Lote B:** Expansão histórica contendo Material Particulado Inalável (PM10) para 2020 (ano completo) e Material Particulado Inalável (PM10) e Fino (PM2.5) para 2021 (ano completo) nas estações Belmonte, Retiro e Santa Cecília.

---

## 1. Cobertura Técnica e Estatísticas de Coleta

A coleta histórica e normalização dos microdados brutos públicos das estações foi concluída com 100% de aproveitamento das informações disponíveis na plataforma INEA/WebLakes.

| Ano | Estação | Poluente | Leituras Registradas | Cobertura % | Média do Período | Pico Máximo Registrado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **2020** | VR - Belmonte | PM10 | 8.160h / 8.784h | 92.90% | 15.74 µg/m³ | 188.00 µg/m³ |
| **2020** | VR - Belmonte | PM2.5 | 0h / 8.784h | 0.00% | N/D (Não existia) | N/D |
| **2020** | VR - Retiro | PM10 | 6.843h / 8.784h | 77.90% | 28.09 µg/m³ | 303.00 µg/m³ |
| **2020** | VR - Retiro | PM2.5 | 0h / 8.784h | 0.00% | N/D (Não existia) | N/D |
| **2020** | VR - Santa Cecília | PM10 | 6.939h / 8.784h | 79.00% | 19.81 µg/m³ | 258.78 µg/m³ |
| **2020** | VR - Santa Cecília | PM2.5 | 0h / 8.784h | 0.00% | N/D (Não existia) | N/D |
| **2021** | VR - Belmonte | PM10 | 8.109h / 8.760h | 92.57% | 28.33 µg/m³ | 251.38 µg/m³ |
| **2021** | VR - Belmonte | PM2.5 | 7.856h / 8.760h | 89.68% | 10.93 µg/m³ | 94.00 µg/m³ |
| **2021** | VR - Retiro | PM10 | 8.562h / 8.760h | 97.74% | 27.45 µg/m³ | 264.77 µg/m³ |
| **2021** | VR - Retiro | PM2.5 | 8.568h / 8.760h | 97.81% | 9.48 µg/m³ | 82.36 µg/m³ |
| **2021** | VR - Santa Cecília | PM10 | 6.499h / 8.760h | 74.19% | 16.79 µg/m³ | 234.27 µg/m³ |
| **2021** | VR - Santa Cecília | PM2.5 | 6.240h / 8.760h | 71.23% | 8.28 µg/m³ | 92.97 µg/m³ |

*\*Nota: O monitoramento de PM2.5 não existia fisicamente em Volta Redonda em 2020, iniciando-se somente em 2021.*

---

## 2. Principais Achados e Tendências de Qualidade do Ar (Histórico)

- **Limitação de PM2.5 em 2020:** Confirmou-se fisicamente que o monitoramento em Volta Redonda foi restrito ao PM10 em 2020. A rede oficial começou a coletar PM2.5 apenas em 2021.
- **Distorções Sazonais de Inverno:** O ano de 2021 exibiu altos níveis de poluição concentrados no inverno (maio a setembro), com a estação Belmonte liderando as excedências de PM10 (55 dias de ultrapassagens OMS) e PM2.5 (69 dias de ultrapassagens OMS).
- **Picos no Retiro em 2020:** A estação Retiro apresentou picos de poluição significativos já em 2020, com a maior média anual observada no ano (**28.09 µg/m³** para PM10) e 22 dias acima das diretrizes da OMS.

---

## 3. Relatório da Auditoria de Somas

A auditoria matemática de somas excedentes foi executada e homologada:
- **Conformidade de Matriz:** A soma de todas as excedências diárias mensais (OMS e CONAMA 506) bate perfeitamente com os sumários anuais de 2020 e 2021 em 100% das checagens.
- **Resultado:** **APROVADO**. Todos os cruzamentos matemáticos estão corretos e consistentes.

---

## 4. Estrutura de Arquivos e Código Alterados

- **Sumários Normalizados:**
  - `data/inea_weblakes_normalized/summary-2020.json` [NEW]
  - `data/inea_weblakes_normalized/summary-2021.json` [NEW]
- **Datasets do Front-End:**
  - `src/data/air/attention-episodes-2020-2026.ts` [NEW] (substitui a versão 2022-2026)
  - `src/data/air/particulate-timeline-2020-2026.ts` [NEW]
- **Componentes de Visualização (UI) e Páginas:**
  - `src/components/air/ParticulateTimeline2020_2026.tsx` [NEW] (substitui `ParticulateTimeline2022_2026.tsx`)
  - `src/components/air/AttentionEpisodesPanel.tsx` [MODIFY]
  - `src/components/air/SeasonalityHeatmap.tsx` [MODIFY]
  - `src/components/air/AirAtlasMap.tsx` [MODIFY]
  - `src/components/air/ThresholdComparisonPanel.tsx` [MODIFY]
  - `src/components/air/YearExplorer.tsx` [MODIFY]
  - `src/pages/air/IneaMethodologyPage.tsx` [MODIFY]
  - `src/pages/air/IneaRadarPage.tsx` [MODIFY]
- **Dados Abertos Cívicos (CSVs):**
  - `public/data/air/pm10-2020-station-summary.csv` [NEW]
  - `public/data/air/pm10-2021-station-summary.csv` [NEW]
  - `public/data/air/pm25-2021-station-summary.csv` [NEW]
  - `public/data/air/particulate-timeline-2020-2026.csv` [NEW]
  - `public/data/air/attention-episodes-2020-2026.csv` [NEW]
  - `public/data/air/manifest.json` [MODIFY] (versão de metadados incrementada para `1.3.0`)
- **Rotas de Rede:**
  - `vercel.json` [MODIFY] (excluída a pasta `data/` do roteador de fallback SPA local para evitar erros no Vercel Dev)

---

## 5. Veredito Final de Liberação da UI

> [!NOTE]
> **LIBERAÇÃO DA UI CONCEDIDA:** Todos os critérios de validação de dados históricos foram atendidos. As salvaguardas de interface exibem avisos claros sobre a indisponibilidade de PM2.5 no ano de 2020, os datasets abertos batem perfeitamente com os arquivos consolidados locais, e a suite de healthcheck em produção está 100% verde (20/20 PASS). O deploy em produção está plenamente validado e funcional.
