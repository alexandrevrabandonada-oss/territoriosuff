# Estado da Nação — Relatório de Publicação de SO₂ e CO (2024)

**Data do Relatório:** 2026-05-31  
**Estágio de Implantação:** Publicação Cautelosa e Experimental  
**Estações:** Belmonte, Retiro e Santa Cecília  
**Versão do Dataset:** 1.4.0  

---

## 1. Respostas aos Questionamentos Críticos do QA

### 1.1. Dióxido de Enxofre (SO₂) foi publicado?
**SIM**. O SO₂ foi publicado experimentalmente e com cautela na interface pública por meio de um novo painel de cards de estações na página do Radar INEA (`/qualidade-ar/inea`), contendo a média do período, pico horário, cobertura e excedências. A base física de dados também está disponível para download público no formato de dados abertos.

### 1.2. Monóxido de Carbono (CO) foi publicado?
**SIM**. O CO foi publicado experimentalmente na interface pública, adotando a exibição de médias em ppm e mg/m³, contendo o cálculo de média móvel de 8h e a conversão de unidade diária para o padrão OMS.

### 1.3. Quais CSVs entraram no manifest?
Os seguintes novos arquivos CSV de sumários de estações foram gerados e adicionados de forma oficial à lista de downloads do manifesto público:
1.  [`so2-2024-station-summary.csv`](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/so2-2024-station-summary.csv)
2.  [`co-2024-station-summary.csv`](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/co-2024-station-summary.csv)

### 1.4. NO₂, PTS e O₃ continuam bloqueados?
**SIM, CONTINUAM BLOQUEADOS**. Eles estão retidos sob quarentena estrita na interface no novo bloco *"Parâmetros ainda em auditoria"*, sem publicação automática ou ativação no mapa e downloads públicos principais:
*   **NO₂:** Bloqueado devido a provável anomalia sistemática de linha de base (*baseline offset* / desvio de calibração) na estação Retiro.
*   **PTS:** Bloqueado devido a provável anomalia física de fator de escala ($10\times$) na estação Retiro.
*   **O₃:** Bloqueado devido a inatividade completa da rede local de sensores em 2024 (0h de registros coletados).
Os arquivos de preview desses poluentes permanecem em quarentena de homologação, salvos apenas internamente no diretório `reports/open-data-preview/` para análises acadêmicas restritas.

### 1.5. O Healthcheck passou?
**SIM**. O healthcheck local e a compilação completa do build (`npm run verify` e `npx tsx scripts/observatorio-healthcheck.ts`) passaram com **100% de sucesso (20/20 passed)**, atestando a integridade física de todas as rotas, manifestos e endpoints.

### 1.6. A versão do dataset subiu para 1.4.0?
**SIM**. O arquivo [`manifest.json`](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/manifest.json) de metadados de dados abertos teve seu número de versão (`version` e `dataset_version`) atualizado oficialmente de `1.3.1` para **`1.4.0`**, contendo a descrição das novas planilhas e a data do último cômputo.

---

## 2. Sumário da Padronização Lingüística

Em conformidade com a **Tarefa 1**, todas as páginas públicas de interface, relatórios markdown e disclaimers foram auditados para afastar termos instantâneos ou punitivos:
*   Substituição de *"sem QA/QC oficial de origem"* por **`"sem QA/QC oficial explícito"`**.
*   Substituição de *"dados públicos governamentais brutos"* por **`"dados horários públicos exibidos pela plataforma INEA/WebLakes"`**.
*   Exclusão total de expressões de tempo real ou ao vivo.
*   A salvaguarda metodológica de que *"ausência de dado não representa ar bom"* foi devidamente preservada em todas as exibições.
