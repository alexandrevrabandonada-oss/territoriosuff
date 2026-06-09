# Estado da Nação — Smoke Test da Camada de Exposição Social (v0)
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório documenta a validação e homologação técnica (Smoke Test) para o lançamento da primeira versão da camada de **Exposição Social e Vulnerabilidade Territorial (v0)** do Observatório do Ar de Volta Redonda.

---

## 1. Protocolo de QA Realizado

Para garantir a confiabilidade técnica, exatidão dos dados do Censo 2022 por setor censitário e conformidade editorial, executamos um protocolo composto por três fases de testes:

### A. Verificação de Compilação e Build
*   **Comando Executado:** `npm run verify`
*   **Resultado:** **PASS** (Zero erros).
*   **Detalhes:** Todos os novos componentes de UI (`SocialExposureMap.tsx`, `SensitiveFacilitiesLayer.tsx`, `VulnerabilityLegend.tsx`) e estruturas de dados TS foram integralmente tipados e compilados com sucesso no build final de produção do Vite.

### B. Auditoria de Conformidade Editorial e Vocabular
*   **Comando Executado:** `npm run inea:qa:language`
*   **Resultado:** **PASS** (Zero violações).
*   **Verificação:** Assegura que nenhuma expressão de frescor instantâneo (visto que o portal não representa tempo real e não representa monitoramento ao vivo) tenha sido introduzida nos arquivos do portal ou relatórios de divulgação.

### C. Teste de Integridade de Arquivos (Healthcheck Local)
*   **Comando Executado:** `$env:OBSERVATORIO_BASE_URL="http://localhost:5173"; npx tsx scripts/observatorio-healthcheck.ts`
*   **Resultados de Integridade Física para os Novos Arquivos:**
    1.  `vr-vulnerabilidade-setores-2022.csv`: **200 OK** (15 setores carregados e validados)
    2.  `equipamentos-sensiveis-vr.csv`: **200 OK** (13 equipamentos georreferenciados)
    3.  `social-data-dictionary.csv`: **200 OK** (18 definições mapeadas)
    4.  `manifest.json`: **200 OK** (Manifesto de dados sociais íntegro)

---

## 2. Salvaguardas Editoriais na Interface (UI)

Validamos que os 4 avisos obrigatórios estão visíveis e destacados nas interfaces do portal:

1.  **Índice Experimental:** Identificado como versão experimental v0 (camada secundária informativa).
2.  **Não mede risco individual:** Explicitamente destacado no callout da página e na legenda flutuante.
3.  **Não prova causalidade:** Frase obrigatória incluída tanto em `IneaRadarPage.tsx` quanto na metodologia de `IneaMethodologyPage.tsx`.
4.  **Priorização Territorial:** Objetivo definido claramente como suporte ao planejamento público local.

---

## 3. Veredito de Publicação

> [!TIP]
> **VEREDITO: APROVADO PARA DEPLOY CONTROLADO**
> A camada de Exposição Social (v0) cumpre todos os requisitos de integridade física dos dados e atende rigorosamente às diretrizes metodológicas e editoriais de justiça ambiental, sem sugerir qualquer causalidade direta de adoecimento individual.
