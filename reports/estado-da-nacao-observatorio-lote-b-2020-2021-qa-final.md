# Estado da Nação — Relatório de QA Final do Lote B (2020 e 2021)
## Observatório do Ar — Volta Redonda

**Data do Relatório:** 2026-05-30  
**Status do Lote B:** HOMOLOGADO E PRONTO PARA LIBERAÇÃO PLENA  
**Versão do Dataset:** 1.3.1  
**Autor:** Antigravity (Advanced Agentic Coding Agent)

---

## 1. Introdução e Contexto

Este relatório documenta a homologação final do **Lote B** do Observatório do Ar, que estende a cobertura histórica de material particulado para Volta Redonda:
- **Ano 2020:** PM10 completo para as estações Belmonte, Retiro e Santa Cecília.
- **Ano 2021:** PM10 e PM2.5 completos para as estações Belmonte, Retiro e Santa Cecília.

Durante a auditoria de qualidade final, identificou-se que a estação **VR-Santa Cecília (ID 71)** no ano de **2021** obteve cobertura horária abaixo do limiar metodológico regulatório de 75%:
- **PM10:** 74,19% de cobertura anual.
- **PM2.5:** 71,23% de cobertura anual.

Para manter a integridade e transparência da plataforma, foi concebida a classificação de **"Cobertura insuficiente para comparação anual plena"**, a qual foi aplicada a todas as saídas de dados e interfaces de usuário.

---

## 2. Medidas Técnicas de Resguardo Metodológico (Selo Metodológico)

### 2.1. Alterações no Schema de Dados e Manifest
1. **Coluna `coverage_status`:** Adicionada aos cabeçalhos de todos os CSVs de sumarização anual e da linha do tempo plurianual:
   - `particulate-timeline-2020-2026.csv`
   - `attention-episodes-2020-2026.csv`
   - `pm10-2021-station-summary.csv`
   - `pm25-2021-station-summary.csv`
2. **Classificação dos Registros:**
   - Sete registros de Santa Cecília em 2021 marcados como `"INSUFFICIENT_ANNUAL_COVERAGE"`.
   - Todos os outros registros válidos marcados como `"SUFFICIENT"`.
3. **Versão do Dataset:** Elevada de `1.3.0` para `1.3.1` no `manifest.json` público.

### 2.2. Modificações na UI (React)
As salvaguardas de interface foram implementadas de maneira a impedir comparações indevidas sem afetar os dados de excedência locais válidos:
- **Linha do Tempo (`ParticulateTimeline2020_2026.tsx`):** Alerta no topo quando a combinação Santa Cecília / 2021 é selecionada. Rótulo "Insuficiente" aplicado ao lado da média de Santa Cecília 2021.
- **Explorador de Anos (`YearExplorer.tsx`):** Exibe uma tag de aviso visual `"Cobertura Insuficiente"` ao lado da porcentagem e insere o texto didático de ressalva explicativa na Nota de Exposição da estação.
- **Painel de Comparação (`ThresholdComparisonPanel.tsx`):** Adiciona cartão de ressalva metodológica e destaca no valor observado que a média está sob ressalva devido à cobertura.
- **Painel de Episódios de Atenção (`AttentionEpisodesPanel.tsx`):** Exibe banner explicativo informando a limitação estatística no cômputo da média de 2021.

> [!IMPORTANT]
> **Nota Didática de Cobertura Insuficiente:**
> *“Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo do patamar metodológico de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.”*
>
> A contagem de excedências diárias e os picos horários continuam visíveis, pois representam dados físicos coletados de forma segura, porém a média anual perde qualificação estatística para efeito de representação anual plena.

---

## 3. Correção de Linguagem Editorial e Exatidão Técnica

Foram efetuadas as seguintes correções de nomenclatura no front-end e relatórios históricos para assegurar exatidão técnica e afastar termos não regulatórios:
1. **Indisponibilidade de PM2.5 em 2020:**
   - **Termo Anterior:** *"Não existia fisicamente"* / *"Sensor inexistente"*.
   - **Termo Corrigido:** *"Não há dados públicos disponíveis na plataforma INEA/WebLakes no recorte analisado"* / *"O sensor para monitoramento de PM2.5 não retornou dados públicos na plataforma INEA/WebLakes no recorte analisado no ano de 2020."*
2. **Nomenclatura de Picos de Concentração:**
   - **Termo Anterior:** *"Picos de poluição significativos"*.
   - **Termo Corrigido:** *"Picos horários pontuais de concentração"*.

---

## 4. Auditoria de Somas e QA (Rigor Matemático)

Todas as verificações lógicas e matemáticas foram executadas e retornaram sucesso:
- **Auditoria de Somas:** `scripts/inea-analytics-assert.ts` (Soma das tabelas de episódios versus sumários anuais bateu 100% com 20/20 de asserções corretas).
- **Asserções de Linguagem:** `scripts/inea-public-language-assert.ts` validou que nenhuma palavra proibida (como "picos de poluição significativos") permaneceu nos textos de front-end.
- **Linter e Typechecker:** Executados com sucesso (`npm run verify`).
- **Healthcheck de Rotas:** O arquivo `scripts/observatorio-healthcheck.ts` foi executado localmente, testando a resposta correta de todos os endpoints e JSONs.

---

## 5. Veredito Final de Homologação

**RECOMENDAÇÃO DE LIBERAÇÃO PLENA: SIM**

O Lote B está 100% em conformidade metodológica, com os selos de cobertura e salvaguardas didáticas ativas na interface. Todos os arquivos CSVs e JSON estão sincronizados na versão `1.3.1`.
