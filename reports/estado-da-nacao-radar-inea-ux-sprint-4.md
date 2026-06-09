# Estado da Nação — Radar INEA (UX Sprint 4 Rearchitecture)

Este documento resume as implementações, melhorias de usabilidade e resultados do ciclo de homologação do **Radar INEA** sob o escopo da **UX Sprint 4** no **SEMEAR PWA**.

---

## 1. O Problema da Página Infinita

Anteriormente, a página `/qualidade-ar/inea` (renderizada por `src/pages/air/IneaRadarPage.tsx`) concentrava todos os conteúdos históricos, análises temporais, mapas espaciais, dados abertos e metodologia em um único fluxo vertical infinito. Isso causava:
1. **Sobrecarga de Informação**: Dificuldade de focar em uma perspectiva por vez (ex: focar apenas no mapa ou apenas na metodologia).
2. **Problemas de Performance**: Renderização pesada de múltiplos gráficos grandes e mapas interativos simultaneamente na mesma página.
3. **Rolagem Exaustiva**: Perda de contexto e fadiga de scroll para usuários em dispositivos móveis.

---

## 2. A Solução: Arquitetura Orientada a Modos de Uso

A página foi totalmente reestruturada em torno de um seletor de estados (`currentMode`) que divide o conteúdo em **6 abas/modos dinâmicos**:

### A. Camada Inicial (Sempre Visível)
* **Hero Narrativo**: Apresentação visual limpa com CTAs de redirecionamento rápido que atualizam o modo ativo e rolam suavemente até a âncora da subnavegação (`#subnav-anchor`).
* **Resumo Rápido (30s)**: Grid de 4 cartões cobrindo rapidamente as perguntas fundamentais: *O que há aqui?*, *O que olhar primeiro?*, *O que exige cuidado?* e *Por que importa?*.
* **Últimas Leituras Compacto**: Uma linha com mini-cards das 4 estações exibindo o último índice e classificação de cor correspondente.
* **Aviso Metodológico Unificado**: Aviso curto lembrando as ressalvas de freshness (os dados baseiam-se em séries históricas consolidadas em lotes periódicos, não representando monitoramento ao vivo ou tempo real).

### B. Modos Condicionais
1. **Visão Geral (`OVERVIEW`)**:
   * Dashboard introdutório contendo o ranking de estações por atenção.
   * Tabela detalhada de últimas leituras.
   * Encaminhamentos cívicos e orientações práticas de cidadania ("Três formas de usar" e "O que fazer com isso?").
2. **Mapa (`MAP`)**:
   * O mapa interativo completo (`AirAtlasMap.tsx`).
   * Painel dinâmico da estação selecionada.
   * Legenda pedagógica e o `Microguide` dedicado ao mapa.
3. **Tempo (`TIME`)**:
   * Gráficos temporais organizados em sub-abas internas (`Tendência`, `Excedências` e `Cobertura`).
   * Gráficos de sazonalidade e frequência de poluentes controladores.
   * `Microguide` temporal.
4. **Território (`TERRITORY`)**:
   * O mapa de exposição social e vulnerabilidade socioambiental (`SocialExposureMap.tsx`).
   * Notas de saúde pública e o `Microguide` territorial correspondente.
5. **Estações (`STATIONS`)**:
   * Grid de 4 cartões representativos de cada estação física, com coordenadas geográficas, status de atividade e link direto para suas respectivas séries individuais (`IneaStationPage.tsx`).
6. **Metodologia e Dados (`METHODOLOGY`)**:
   * Guia visual "Como ler sem cair em erro" composto por 6 cartões didáticos.
   * Seção de poluentes gasosos experimentais de 2024.
   * Regras de quarentena de dados e validação.
   * Grid com os 5 cards para download direto de arquivos CSV de dados abertos.
   * Tabela interativa de evidências físicas históricas coletadas.

---

## 3. Navegação e Usabilidade

Para garantir uma navegação natural e sem atrito:
* **Subnav Sticky**: Um menu flutuante fixado no topo da tela com abas estilizadas de forma premium. O botão do modo ativo recebe uma borda destacada e cores de alto contraste, sinalizando claramente onde o usuário está.
* **Scroll Inteligente**: Cliques em CTAs do Hero mudam a aba e movem o scroll automaticamente para `#subnav-anchor`, evitando que o usuário precise rolar a tela manualmente para visualizar a aba selecionada.
* **Voltar ao Topo**: Botões discretos de `"▲ Voltar ao topo"` foram colocados no rodapé de todas as abas, permitindo um retorno instantâneo ao Hero.

---

## 4. Validação e Controle de Qualidade

Para garantir a estabilidade do sistema e o cumprimento das diretrizes de governança:
1. **Typecheck e Compilação**: Executados e aprovados com 100% de sucesso.
2. **Vite Production Build**: Bundle gerado com sucesso para produção em `/dist`.
3. **QA de Linguagem (`npm run inea:qa:language`)**: Passou em conformidade absoluta com as regras de vocabulário e freshness.
4. **Healthchecks de APIs (`npx tsx scripts/observatorio-healthcheck.ts`)**: Executados diretamente contra o ambiente de produção, resultando em **PASS (33/33 aprovados)**.
5. **Deploy de Produção**: Publicado e aliased com sucesso em [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app).
