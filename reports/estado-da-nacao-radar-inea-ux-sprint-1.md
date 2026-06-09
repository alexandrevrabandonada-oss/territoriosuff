# Estado da Nação — Radar INEA UX Sprint 1

Este relatório documenta as alterações visuais, de arquitetura da informação e de usabilidade realizadas na página do Radar INEA (`/qualidade-ar/inea`) no âmbito do **Tijolo 54: UX Sprint 1**.

---

## 1. Modificações Realizadas

### 1.1. Ajustes de Cabeçalho e Responsividade
*   **Breakpoint de Colapso:** O breakpoint para colapso do menu horizontal superior foi alterado de `1240px` para `1340px` no arquivo [index.css](file:///C:/Projetos/SEMEAR%20PWA/src/index.css). Isso força o menu do cabeçalho a se transformar em menu hambúrguer mais cedo, evitando sobreposição com o botão PWA em notebooks comuns.
*   **Ajuste Intermediário (1341px - 1440px):** Foram reduzidos os paddings e gaps das fontes e botões de ação para garantir que o menu caiba perfeitamente no cabeçalho sem quebras ou sobreposições.
*   **Empilhamento de z-index:** O cabeçalho foi mantido com `z-index: 50` e a nova subnavegação sticky com `z-index: 40`.

### 1.2. Reorganização e Nova Arquitetura de IneaRadarPage.tsx
A página [IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx) foi completamente reestruturada, seguindo o fluxo de leitura e didática pública:
1.  **Hero Narrativo:** Compactado e atualizado com novos textos explicativos, um badge claro contendo a advertência de dados e sem QA/QC oficial, 4 KPIs estáticos (4 estações, séries 2013-2026, 4 poluentes publicados, 33/33 testes operacionais saudáveis) e 4 CTAs rápidos direcionados por scroll suave.
2.  **Resumo em 30 Segundos:** Substituição dos cartões métricos dinâmicos por 4 cartões de introdução rápida estruturados e estáticos ("O que há aqui?", "O que olhar primeiro?", "O que exige cuidado?", "Por que importa?").
3.  **Subnav Sticky:** Inclusão de barra horizontal com links de âncoras fixas deslizantes (`top: 5.45rem`) que acompanham o scroll abaixo do cabeçalho principal.
4.  **Explorar no Mapa (`#mapa`):** Renderiza o `AirAtlasMap` acompanhado da microguia padronizada.
5.  **Comparar no Tempo (`#tempo`):** Divisão por abas interativas para mitigar sobrecarga cognitiva:
    *   *Tendências e Séries:* Contém o explorer anual (`YearExplorer`), a timeline plurianual de particulados (`ParticulateTimeline2020_2026`), a linha do tempo da base pública e o gráfico de série histórica com seletor de estações.
    *   *Alertas e Ultrapassagens:* Contém os episódios de atenção, painel de comparação de limites de segurança, sazonalidade mensal dos alertas e o gráfico de poluentes controladores.
    *   *Silêncio e Lacunas:* Exibe o painel de lacunas instrumentais, frisando a ausência de dados.
6.  **Quem respira esse ar? (`#exposicao-social`):** Renderiza o mapa social (`SocialExposureMap`) integrado à base demográfica e equipamentos sensíveis do IBGE.
7.  **Estações e últimas leituras (`#estacoes`):** Exibe as fichas operacionais das estações físicas e a tabela de últimas leituras integradas.
8.  **Como ler sem cair em erro (`#como-ler`):** Apresenta o guia didático de classificações do IQAr e a lista de FAQs interativas agrupadas por acordeons colapsáveis.
9.  **O que fazer com isso? (`#encaminhamentos`):** Contém os 5 encaminhamentos cívicos priorizados e a minuta de transparência para pedidos via Lei de Acesso à Informação (LAI).
10. **Metodologia e dados abertos (`#metodologia`):** Consolida notas técnicas de fontes, réguas, downloads de bases, quarentena de homologação e a caixa de evidências brutas de dados históricos.

### 1.3. Padronização de Títulos e Microguias
Foi implementado um componente visual reutilizável de `Microguide` em 4 blocos cruciais da página, contendo as explicações de:
*   *O que você está vendo*
*   *Como ler*
*   *Por que importa*

---

## 2. Garantias Metodológicas e Linguísticas
*   **Limites de Culpabilidade:** Mantida a neutralidade técnica e os termos de salvaguarda ("não mede risco individual", "não prova causalidade direta", "setores analisados", "priorização territorial").
*   **Regras de Vocabulário (Freshness):** Garantido que referências a leituras históricas usem frases excepcionais de isenção de tempo real ("não representa tempo real" e "não representa monitoramento ao vivo"), inclusive na FAQ interativa.

---

## 3. Resultados de QA e Validação

Todas as verificações locais foram executadas e concluídas com sucesso antes da homologação:

1.  **Conformidade Linguística:**
    ```powershell
    npm run inea:qa:language
    ```
    *Resultado:* `QA LANGUAGE COMPLIANCE PASSED: All files are compliant with freshness vocabulary guidelines.`
2.  **Verificação Geral (Lint + Typecheck + Build):**
    ```powershell
    npm run verify
    ```
    *Resultado:* Compilação limpa concluída e bundle gerado com sucesso por meio do Vite e PWA builders.
3.  **Auditoria Operacional (Healthcheck):**
    ```powershell
    npx tsx scripts/observatorio-healthcheck.ts
    ```
    *Resultado:* `Status: PASS (33/33 passed)` no ambiente local e no espelho de produção da Vercel.
