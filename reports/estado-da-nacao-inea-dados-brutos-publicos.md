# Relatório de Garimpo e Evidências Físicas — Radar INEA

**Data:** 27 de Maio de 2026  
**Status:** Implementado  
**Objetivo:** Catalogar, estruturar e apresentar evidências públicas de concentrações físicas brutas de poluentes em Volta Redonda (pré-2022) para fundamentar as cobranças de transparência ativa do Projeto SEMEAR.

---

## 1. Contexto do Garimpo de Dados

A base atualmente normalizada no Radar do Ar INEA (2022–2025) exibe índices e subíndices IQAr processados. Embora o órgão oficial alegue que a série histórica anterior não está disponível em lote aberto para download direto (motivo pelo qual criamos a modal de LAI), um garimpo em relatórios oficiais, diagnósticos setoriais e artigos acadêmicos permitiu identificar que as **concentrações físicas horárias e diárias brutas existem**, foram medidas pelas estações e circularam de forma restrita para fins de pesquisa.

Este trabalho cria uma camada de dados separada e um componente didático para expor estas evidências de forma pública, apresentando uma evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas no monitoramento da qualidade do ar de Volta Redonda.

---

## 2. Inventário de Fontes Públicas

Catalogamos as seguintes fontes prioritárias no documento [inea-fontes-dados-brutos-publicos.md](file:///C:/Projetos/SEMEAR%20PWA/reports/inea-fontes-dados-brutos-publicos.md):
1.  **Artigo RBCIAMB (2020):** Triênio 2013–2015. Contém médias diárias e máximas diárias de PM10, PTS e O3, além de registrar violações explícitas às diretrizes da OMS.
2.  **Dissertação UFF (2017):** Triênio 2013–2015. Demonstra que microdados diários brutos fornecidos pelo INEA foram utilizados em modelagens epidemiológicas associando picos de poluição com internações por doenças respiratórias no SUS.
3.  **Relatórios de Qualidade do Ar do INEA (RQAr 2010–2018):** Relatórios oficiais anuais do órgão contendo estatísticas anualizadas, médias e concentrações horárias e diárias máximas por estação.
4.  **1º Diagnóstico do IEMA (2000–2012):** Diagnóstico técnico nacional registrando a infraestrutura ativa e capacidade de medição automática das estações de Volta Redonda no período antigo.

---

## 3. Estruturação da Camada de Dados (JSON Schema & Seed)

Para garantir integridade técnica e extensibilidade futura da base de garimpo, implementamos:
*   **[schema.json](file:///C:/Projetos/SEMEAR%20PWA/data/inea_historical_sources/schema.json):** Schema padronizado contendo campos como `source_id`, `source_type`, `pollutant`, `metric`, `value`, `unit`, `extraction_method` e `confidence`.
*   **[seed-public-findings.json](file:///C:/Projetos/SEMEAR%20PWA/data/inea_historical_sources/seed-public-findings.json):** Base de dados semente contendo 10 registros garimpados das publicações oficiais e científicas.

---

## 4. Integração no Frontend

*   **Componente [HistoricalRawEvidenceBox.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/HistoricalRawEvidenceBox.tsx):** 
    *   Painel intitulado *"Encontramos rastros dos dados brutos"*.
    *   Apresenta uma explicação contextualizada ("A série completa ainda não está aberta em CSV/XLSX/API. Mas relatórios oficiais e estudos científicos mostram que concentrações físicas foram medidas, agregadas e usadas em pesquisas.") de que os dados físicos existem.
    *   Exibe um grid de 4 cards relacionando as fontes (Artigo RBCIAMB, Relatórios INEA, Diagnóstico IEMA e Dissertações UFF) com seus principais achados e métricas físicas associadas.
*   **Página [IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx):**
    *   O componente foi inserido entre a explicação do IQAr (`#iqar`) e a análise sazonal de alertas (`#alertas`).
    *   A seção *"O que ainda precisamos cobrar"* foi atualizada para incluir a **Demanda 6**: *"Publicação da série horária e diária completa que já foi usada em relatórios e pesquisas."*
    *   O grid de cobranças foi reajustado para 6 colunas (`lg:grid-cols-6`) para acomodar a nova demanda de forma responsiva.

---

## 5. Validação de Testes e Linguagem

*   O script [inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/inea-public-language-assert.ts) foi atualizado para monitorar os dois novos relatórios markdown e o novo componente React.
*   Executamos a verificação de vocabulário e compilação, obtendo sucesso completo:
    *   `npm run inea:qa:language` ➔ **PASS** (Zero termos banidos sem exceção).
    *   `npm run verify` ➔ **PASS** (0 erros de compilação, linting limpo e build gerado com sucesso).
