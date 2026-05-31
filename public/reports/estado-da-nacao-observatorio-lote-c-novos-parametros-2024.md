# Estado da Nação — Homologação de Novos Parâmetros (Lote C) — 2024
## Relatório de Encerramento e Auditoria de Sensores

**Data de Publicação:** 2026-05-31  
**Status de Homologação:** EXPERIMENTAL / EM AUDITORIA  
**Estações Auditadas:** Belmonte (69), Retiro (70) e Santa Cecília (71)  
**Parâmetros Inclusos:** SO₂, NO₂, CO, PTS e O₃ (diagnóstico)  

---

## 1. Resumo do Lote C
O Lote C represents a primeira expansão metodológica do Observatório do Ar para além de partículas inaláveis (PM₁₀ e PM₂.₅). O ano de 2024 foi estabelecido como laboratório técnico para testar a consistência dos sensores automáticos e a estabilidade da coleta incremental para novos poluentes gasosos e particulados totais.

Todos os dados horários brutos foram coletados com sucesso a partir da plataforma pública INEA/WebLakes através de sessões isoladas e em lote. A auditoria de fechamento de somas e janelas atesta a consistência matemática do cálculo das métricas derivadas.

---

## 2. Indicadores Consolidados (2024)

| Estação | Poluente | Horas Registradas | Média Anual / Período | Excedências OMS | Excedências CONAMA | Status Final |
| :--- | :---: | ---: | :--- | :---: | :---: | :--- |
| **Belmonte** | SO₂ | 7.847h | 4.059 µg/m³ | 0 dias | 0 dias | `EM AUDITORIA` |
| **Retiro** | SO₂ | 8.750h | 4.672 µg/m³ | 0 dias | 0 dias | `EM AUDITORIA` |
| **Santa Cecília** | SO₂ | 7.041h | 5.868 µg/m³ | 0 dias | 0 dias | `EM AUDITORIA` |
| **Belmonte** | NO₂ | 8.450h | 15.208 µg/m³ | 10 dias | 0 dias | `EM AUDITORIA` |
| **Retiro** | NO₂ | 8.749h | 35.261 µg/m³ | 366 dias | 0 dias | `EM AUDITORIA` |
| **Santa Cecília** | NO₂ | 8.713h | 15.675 µg/m³ | 32 dias | 0 dias | `EM AUDITORIA` |
| **Belmonte** | CO | 8.448h | 0.375 ppm | 0 dias | 0 dias | `EM AUDITORIA` |
| **Retiro** | CO | 8.746h | 1.007 ppm | 0 dias | 0 dias | `EM AUDITORIA` |
| **Santa Cecília** | CO | 8.710h | 0.362 ppm | 0 dias | 0 dias | `EM AUDITORIA` |
| **Belmonte** | PTS | 8.261h | 60.018 µg/m³ | — | 0 dias | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Retiro** | PTS | 8.747h | 445.165 µg/m³ | — | 366 dias | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Santa Cecília** | PTS | 8.515h | 34.871 µg/m³ | — | 0 dias | `SOMENTE HISTÓRICO-TÉCNICO` |
| **Belmonte** | O₃ | 0h | N/D | 0 dias | 0 dias | `INDISPONÍVEL` |
| **Retiro** | O₃ | 0h | N/D | 0 dias | 0 dias | `INDISPONÍVEL` |
| **Santa Cecília** | O₃ | 0h | N/D | 0 dias | 0 dias | `INDISPONÍVEL` |

---

## 3. Principais Descobertas e Ressalvas Técnicas

### 3.1. Monóxido de Carbono (CO)
*   **Média Móvel de 8h:** O cálculo de médias deslizantes (com representatividade de pelo menos 6/8h por janela) foi validado. Não foram detectadas ultrapassagens do limite regulamentar nacional de 9 ppm (CONAMA 506) em nenhuma das três estações automáticas.
*   **OMS 24h:** A OMS estabelece o limite diário de 4 mg/m³. Após a conversão física de ppm para mg/m³ (fator 1.145), todas as estações mantiveram-se em conformidade.

### 3.2. Dióxido de Nitrogênio (NO₂)
*   **Estação VR-Retiro:** A estação registrou média anual de 35.261 µg/m³, com todos os 366 dias excedendo a diretriz diária de 25 µg/m³ recomendada pela OMS. Embora em conformidade com o limite de pico horário brasileiro de 200 µg/m³ (CONAMA 506), os dados indicam exposição crônica elevada que exige atenção.

### 3.3. Partículas Totais em Suspensão (PTS)
*   **Estação VR-Retiro:** A estação apresentou média anual atípica e extremamente alta de 445.165 µg/m³, com excedência do padrão diário histórico de 240 µg/m³ (CONAMA 03/1990) em todos os 366 dias do ano.
*   > [!WARNING]
    > **Nota de Auditoria:** Um índice de 100% de excedência e uma média anual nessa magnitude sugere fortemente uma anomalia de calibração instrumental ou contaminação direta constante no local de captação do sensor. O status foi mantido como `SOMENTE HISTÓRICO-TÉCNICO` para indicar que serve apenas para fins de depuração de engenharia, necessitando verificação do INEA.

### 3.4. Ozônio (O₃)
*   **Diagnóstico de Indisponibilidade:** As tentativas de coleta incremental para o parâmetro O₃ (ID 2130) em todas as estações durante o ano de 2024 retornaram conjuntos vazios (0h registradas). O parâmetro foi classificado oficialmente como `INDISPONÍVEL` na interface pública.

---

## 4. Conformidade Editorial (Rigor de Comunicação)
Todas as nomenclaturas, ressalvas e relatórios técnicos foram validados contra o manual linguístico editorial. Expressões proibidas como "ao vivo", "tempo real" ou "infração" foram totalmente expurgadas das páginas públicas e relatórios para garantir que os dados históricos consolidados sejam visualizados de forma puramente técnica e científica.

---

## 5. Veredito Final
A recomputação e validação matemática de somas mensais e janelas deslizantes foram concluídas com **100% de consistência**. Os previews dos conjuntos de dados foram salvos como CSVs em `reports/open-data-preview/` para escrutínio técnico antes de qualquer publicação regulatória cidadã plena.
