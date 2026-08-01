# Estado da Nação — Auditoria UI/UX 2026-07-22

Data: 2026-07-22

## Escopo

Auditoria de UI/UX do portal público (home, páginas operacionais, institucionais, acervo, blog, Radar INEA), com atenção a mobile. Admin fora do escopo.

Método:

- revisão estática do código UI (gramática portal, estados, tokens/CSS, a11y estática)
- testes automatizados existentes (`npm run test:a11y` — 37/37 PASS, axe limpo em 32 rotas)
- smoke visual com screenshots desktop 1440px + mobile 390px de 14 rotas (`tmp/ui-audit/`), dev server com SW bloqueado

## Resumo executivo

A base está saudável: axe não reporta violações em nenhuma das 32 rotas testadas, skip links/focus trap do menu móvel/tabelas com caption estão corretos, e o smoke visual desktop/mobile não mostrou quebras estruturais. Os problemas concentram-se em:

1. contraste abaixo de WCAG AA em textos pequenos (principalmente `text-cta` amarelo sobre fundo claro e variações com opacidade)
2. touch targets abaixo do mínimo de 24px (WCAG 2.2, critério 2.5.8) em chips interativos
3. hierarquia de headings quebrada no DadosPage e headings duplicados no SearchPage
4. elementos interativos aninhados em links (HTML inválido) no AcervoListPage
5. inconsistência de adoção da gramática portal (14 páginas replicam o hero manualmente; família `air/` tem skin própria)
6. camada de CSS com duplicação, cores hard-coded e dois sistemas de tokens paralelos

## Achados — Críticos

- **C1. `text-cta` #D4A514 sobre fundo claro ≈ 2.3:1** (WCAG exige 4.5:1). Headings pequenos uppercase em `src/pages/SearchPage.tsx:315,341,360,379,397` (+ badges `bg-cta/10 text-cta` :316) e `src/pages/acervo/CollectionDetailPage.tsx:126` (chips de tag), `:137` (h2 "Itens desta Coleção").
- **C2. `text-slate-600` sobre banner escuro slate-900 ≈ 2.4:1**: `src/pages/DadosPage.tsx:752`.
- **C3. Touch targets abaixo até do mínimo de 24px**: chips com `py-0.5 text-[10px]` (~18–20px) em `src/pages/acervo/AcervoItemPage.tsx:602-636` (Modo Leitura, Compartilhar, Ver na linha do tempo) e link `text-[10px]` em `src/pages/AlertasPage.tsx:416-421`.

## Achados — Altos

- **A1. Hierarquia de headings quebrada no DadosPage**: `h1` ("Leituras SEMEAR", :777) aparece depois de `h2` (:675) e `h3` (:704) e outro `h2` (:746); salto h2→h4 em :1354.
- **A2. `text-texto/40` ≈ 2.3:1** em texto 10px: `src/pages/SearchPage.tsx:402`.
- **A3. `text-texto/50` ≈ 2.9:1** em `text-xs`: `src/pages/acervo/CollectionDetailPage.tsx:189`.
- **A4. `opacity-60` sobre `text-text-secondary` ≈ 2.8:1**: `src/pages/acervo/AcervoTimelinePage.tsx:150-152`.
- **A5. `text-brand-primary/70` ≈ 3.5:1** em textos pequenos: `src/pages/AlertasPage.tsx:211`, `src/pages/acervo/AcervoItemPage.tsx:562`.
- **A6. `text-texto/60` ≈ 3.8:1** em resumo 12px: `src/pages/SearchPage.tsx:327`.
- **A7. Inputs de hora sem indicador de foco** (`focus:outline-none` sem substituto): `src/pages/AlertasPage.tsx:321,334`.
- **A8. Botões de tag dentro de `<Link>`** (interactive content aninhado, HTML inválido): `src/pages/acervo/AcervoListPage.tsx:418-426` dentro de :379.
- **A9. Headings duplicados no SearchPage**: cada seção renderiza o título via `PortalSectionHeader` e o repete num h2 logo abaixo (:272-277, :310-317, :336-341, :355-360, :374-379, :392-397).

## Achados — Médios (registrados; não corrigidos nesta rodada)

- Menu "Mais" da Navbar com `role="menu"` sem navegação por setas (`src/components/Navbar.tsx:172-176`)
- Tabs do DadosPage sem padrão de teclado (:1016-1061, :1523-1554)
- `PortalModeTabs` sem `aria-pressed`/`aria-current` (`src/components/portal/PortalModeTabs.tsx:21-32`)
- Modal de mídia sem focus trap (`src/pages/acervo/AcervoItemPage.tsx:236-253`)
- Touch targets entre 24–44px (footer social 32px, modo leitura 32px, chips de filtro ~26px, buscas populares ~26px, nav desktop ~40px)
- `text-brand-primary/80` ≈ 4.4:1 em tags 10px (`AcervoItemPage.tsx:689`)
- `aria-label` ineficaz em `<span>` no título da home (`HomePage.tsx:113`)
- Skip-link da AlertasPage sempre visível e deslocando no foco (`AlertasPage.tsx:182`)
- Emojis com `role="img"` duplicando título adjacente (`AcervoPage.tsx:134`)
- `alert()` nativo como feedback (AcervoItemPage:623, CollectionDetailPage:110, Navbar:130)
- Grupo "Período de Silêncio" sem `fieldset/legend` (`AlertasPage.tsx:307-310`)

## Achados — Consistência / dívida estrutural (recomendações)

- **Hero manual replicado em 14 páginas** (mesmo markup que `PortalHero` encapsula): GovernancaPage:31-47, ImprensaPage:35-51, SobrePage:9-22, AcervoTimelinePage:115-124, ReportsRoutePage:9-23, BlogListPage:37-53, CollectionsListPage:33-42, MapaLandingPage:34-56, MapaPage:212-234, ApresentacaoPage:103-112, InscricoesPage:109-121, PrivacidadeLgpdPage:7-16, RadarLandingPage:12-30, IneaStationPage:422. Recomendação: migração gradual para `PortalHero`.
- **Família `air/` fora da gramática**: nenhuma das 5 páginas usa `components/portal`; `IneaRadarPage` e `IneaAnalyticsPage` têm skins próprias. Recomendação: rodada dedicada (risco de regressão visual no Radar).
- **Estados de erro ad-hoc**: 7 páginas usam `<p role="alert">` inline em vez de `ErrorState` (AgendaPage:479-481, AgendaDetailPage:243-245, BlogListPage:63-66, ReportsListPage:203-206, MapaPage:237-241, AcervoItemPage:570-573, ReportDetailPage:123-129).
- **CSS**: hero escuro triplicado (`.acervo-hub-hero` ≡ `.portal-stage-hero` ≡ `.data-hero`), card de lista repetido 4×, ~10 border-radius arbitrários para a mesma família de cards, 25 ocorrências de `#005daa` hard-coded, token `focus-ring` morto, classes mortas (`.ui-nav-pill`, `.hero-*-shell`, `.surface-*-paper` etc.), dois sistemas de tokens paralelos (`primaria`/`cta`/`ciano`/`texto` vs `brand-*`) com 94 ocorrências legacy em TSX.
- **`IneaRadarPage` > 500 kB**: dívida de bundle já registrada; recomenda-se lazy-load dos modos pesados em rodada própria.
- `PagePlaceholder.tsx:8-14` usa tokens legados — verificar se ainda é roteado.

## O que está correto (verificado)

- axe limpo em 32 rotas (`test:a11y` 37/37 PASS)
- Skip links + `main#main-content` (`PortalLayout.tsx:39-61`); regra global `:focus-visible` (`index.css:135-154`); `prefers-contrast` e `forced-colors`
- Menu móvel com focus trap, ESC e retorno de foco (`Navbar.tsx:94-126`)
- Buscas com label; filtros com `aria-pressed`; tabelas com `<caption>` e `th scope`; resumo `aria-live` para gráficos canvas
- Smoke visual desktop/mobile sem quebras estruturais em 14 rotas (`tmp/ui-audit/`)

---

# Correções aplicadas (2026-07-22)

## O que mudou

### Contraste (C1, C2, A2–A6 + médios baratos)

- `SearchPage.tsx`: removidos os 5 h2 duplicados com `text-cta` (título já era exibido pelo `PortalSectionHeader`); `text-texto/60` → `text-text-secondary` (:327); `text-texto/40` → `text-text-secondary` (:402)
- `CollectionDetailPage.tsx`: chips de tag e h2 "Itens desta Coleção" `text-cta`/`bg-cta/10` → `text-accent-brown`/`bg-accent-brown/10`; ano do item `text-texto/50` → `text-text-secondary`
- `DadosPage.tsx`: nota de rodapé do banner escuro `text-slate-600` → `text-slate-400` (:752)
- `AlertasPage.tsx`: "Como funciona" `text-brand-primary/70` → `text-brand-primary` (:211)
- `AcervoItemPage.tsx`: "← Voltar ao Acervo" `text-brand-primary/70` → `text-brand-primary`; tags `text-brand-primary/80` → `text-brand-primary`
- `AcervoTimelinePage.tsx`: removido `opacity-60` do contador de itens (:150)

### Touch targets (C3)

- `AcervoItemPage.tsx`: botões "Modo Leitura"/"Compartilhar" e link "Ver na linha do tempo" `py-0.5` → `py-2` (~18px → ~31px, acima do mínimo de 24px WCAG 2.2)
- `AlertasPage.tsx`: link "Ver relatórios e médias históricas" ganhou `flex min-h-[44px]` (:416-421)

### Estrutura de headings (A1, A9)

- `PortalSectionHeader.tsx`: nova prop opcional `titleAs` ("h1" | "h2", default "h2" — retrocompatível)
- `DadosPage.tsx`: título da página agora é `h1` via `titleAs="h1"`; "Radar do Ar INEA" h3→h2; "Leituras SEMEAR" h1→h2; "Diretriz de Saúde Preventiva" h4→h3. Hierarquia final sem saltos: h1 → h2… → h3…
- `SearchPage.tsx`: duplicações removidas (ver Contraste)

### HTML válido (A8)

- `AcervoListPage.tsx`: card reestruturado — `<article>` fora do `<Link>`; botões de tag saíram de dentro do link (fim de interactive content aninhado); `group` movido para o `<article>`; faixa de tags agora fecha o card; `e.preventDefault/stopPropagation` removidos por não serem mais necessários

### Foco e navegação assistiva

- `AlertasPage.tsx`: inputs de hora ganharam `focus:ring-2 focus:ring-brand-primary/50` (:321, :334); skip-link "Pular cabeçalho" agora segue o padrão do portal (`sr-only` até receber foco) — antes ficava sempre visível e deslocava no foco
- `PortalModeTabs.tsx`: botões com `type="button"` e `aria-pressed`
- `HomePage.tsx`: título SEMEAR com texto `sr-only` + partes visuais `aria-hidden` (leitores de tela não anunciam mais "SEME AR")

## O que não mudou

- lógica de dados, ingestão INEA, contratos de API
- fluxo de notificações/permissões da `AlertasPage`
- conteúdo editorial, rotas e links de navegação
- skins próprias da família `air/` (Radar/Analytics) — dívida registrada
- sistema duplo de tokens (`primaria`/`cta`/`ciano`/`texto` vs `brand-*`) — dívida registrada
- heros manuais das 14 páginas — dívida registrada

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37, incl. ordem de headings)
- `npx playwright test tests/acervo.spec.ts tests/dados.spec.ts tests/home.spec.ts` — PASS (7/7)
- Smoke visual pós-fix em `/acervo/artigos`, `/dados`, `/alertas`, `/buscar`, `/` (`tmp/ui-audit-pos/`): card do acervo íntegro, banner do Dados legível, skip-link oculto até foco
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender + seo:assert)

Observação de ambiente: a busca (`/buscar?q=...`) falha no dev local por falta de backend, exibindo corretamente o `ErrorState` — ruído de ambiente, não regressão (mesmo comportamento pré-fix).

## Dívida técnica restante (próximas rodadas recomendadas)

1. **Médios de a11y**: menu "Mais" sem arrow-keys (ou remover roles de menu), tabs do DadosPage sem padrão de teclado, modal de mídia sem focus trap, touch targets 24–44px (footer social, chips de filtro, buscas populares)
2. **Consistência**: migrar os 14 heros manuais para `PortalHero`; aproximar família `air/` da gramática portal (rodada dedicada, risco visual no Radar); unificar estados de erro ad-hoc para `ErrorState` (7 páginas)
3. **CSS/tokens**: retokenização legacy (94 ocorrências em TSX), remoção de CSS morto (`.hero-*-shell`, `.surface-*-paper`, `.ui-nav-pill`...), consolidação de border-radius/sombras, eliminar cores hard-coded duplicando tokens
4. **Bundle**: `IneaRadarPage` > 500 kB — lazy-load dos modos pesados

---

# Rodada 2 — Médios de acessibilidade (2026-07-22)

## O que mudou

- **Menu "Mais" (Navbar.tsx)**: removidos `role="menu"`/`role="menuitem"`/`aria-haspopup="menu"` (widget é disclosure de navegação, não menu de ações — os roles exigiam arrow-keys); Escape agora devolve o foco ao botão que abriu o painel
- **Tabs do DadosPage.tsx**: as duas tablists (período e comparação) ganham navegação por `ArrowLeft/ArrowRight/Home/End` com ativação automática (`handleTabsKeyDown`). Observação: tabs de comparação seguem sem `aria-controls` — não há ids de painel estáveis no modo comparativo; roving tabindex fica como melhoria futura (todas as tabs permanecem focáveis)
- **Modal de mídia (AcervoItemPage.tsx)**: focus trap completo — Tab/Shift+Tab ciclam dentro do diálogo (`modalDialogRef`), somando-se ao foco inicial/restore/ESC já existentes
- **Touch targets → ≥32px onde o layout permite**:
  - ícones sociais do footer: 32px → 44px (`index.css` `.site-footer-social a`)
  - botões de fonte do modo leitura: `h-8 w-8` → `h-11 w-11` (44px); botões de tema: `px-3 py-1.5` → `px-4 py-2.5` (~40px)
  - chips de filtro do AcervoListPage: `py-1` → `py-2` (~34px)
  - botão "Compartilhar" do dossiê: `py-1` → `py-2` (~31px)
  - links "Buscas populares" da home: padding `0.25rem` → `0.5rem` vertical (~35px, `home.css`)

## O que não mudou

- comportamento/fluxos de clique (apenas teclado e ARIA)
- estrutura visual além dos tamanhos de alvo de toque

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37)
- `npx playwright test tests/navigation-pwa.spec.ts tests/acervo.spec.ts tests/dados.spec.ts` — PASS (10/10)
- `npm run verify` — PASS

---

# Rodada 3 — Unificação dos estados de erro (2026-07-22)

## O que mudou

As 7 páginas que renderizavam erro com `<p role="alert">` ad-hoc passaram a usar o componente padrão `ErrorState` (ícone + chip + título + descrição, com `title` default "Não foi possível carregar esta seção"):

- `AgendaPage.tsx` (:479)
- `AgendaDetailPage.tsx` (:243)
- `BlogListPage.tsx` (:63)
- `reports/ReportsListPage.tsx` (:203)
- `reports/ReportDetailPage.tsx` (:123)
- `MapaPage.tsx` (:238)
- `acervo/AcervoItemPage.tsx` (:570)

Cada arquivo ganhou o import correspondente de `components/ErrorState`. Comportamento de fetch/retry inalterado; o conteúdo da mensagem (`description`) é o mesmo texto de erro de antes.

## O que não mudou

- lógica de dados e mensagens de erro em si
- estados de loading/vazio (já padronizados ou registrados como dívida)
- erros inline de formulário da AlertasPage (banner de contexto, não estado de seção)

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37)
- `npx playwright test tests/blog.spec.ts tests/acervo.spec.ts` — PASS (5/5)
- `npm run verify` — PASS (concluído após o registro; pipeline verde também nas rodadas 4 e 5)

Nota técnica: `MapaPage.tsx` tem finais de linha mistos (LF/CRLF) — a substituição exigiu tratar `\r\n`; o bloco ficou em LF, coerente com a vizinhança.

---

# Rodada 4 — Migração dos heros → PortalHero (2026-07-24)

## O que mudou

13 das 14 páginas com hero manual (`portal-stage-hero` + grid/stat próprios) migradas para o componente padrão `PortalHero`:

- `SobrePage.tsx` — os dois parágrafos do subtítulo viraram dois `<span className="block">` dentro do `subtitle`
- `GovernancaPage.tsx`
- `ImprensaPage.tsx`
- `PrivacidadeLgpdPage.tsx`
- `reports/ReportsRoutePage.tsx` — import de `SurfaceCard` removido (ficou sem uso)
- `acervo/AcervoTimelinePage.tsx`
- `BlogListPage.tsx` e `CollectionsListPage.tsx` — `import { IconShell }` ajustado após a troca
- `MapaLandingPage.tsx`
- `MapaPage.tsx`
- `ApresentacaoPage.tsx`
- `InscricoesPage.tsx`
- `air/RadarLandingPage.tsx`

Padrões aplicados na migração: ícone/eyebrow manual → prop `badge`; stat manual → `aside={<div className="portal-stage-stat">…</div>}`; tom mapeado da classe CSS original (`portal-stage-hero-lab` → `tone="lab"`, `-seed` → `tone="seed"`, `-warm` → `tone="warm"`, `-documental` → tom default).

**Exceção registrada**: `air/IneaStationPage.tsx` mantém o hero manual — copy e stat customizados que não cabem no contrato atual do `PortalHero`.

## O que não mudou

- conteúdo dos heros (títulos, subtítulos, stats) e tons visuais de cada página
- skins próprias das páginas internas da família `air/` (Radar/Analytics/Estação) — dívida registrada

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37)
- `npx playwright test tests/blog.spec.ts tests/acervo.spec.ts tests/navigation-pwa.spec.ts` — PASS (10/10)
- Smoke visual pós-migração em 12 rotas (`tmp/ui-audit-heros/`): badge, título, subtítulo e stat renderizam corretamente em todas as amostras inspecionadas
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/`**: skins próprias do Radar/Analytics vs gramática portal — rodada dedicada, com risco visual no Radar
2. **CSS/tokens**: retokenização legacy (94 ocorrências `primaria`/`cta`/`ciano`/`texto` em TSX), remoção de CSS morto, consolidação de border-radius/sombras
3. **Bundle**: chunks pesados observados no build (vendor-pdf 428 kB, vendor-maps 161 kB, RadarVisualNotice 165 kB) — avaliar lazy-load mais agressivo dos modos do radar
4. **A11y fino**: roving tabindex nas tabs do DadosPage (hoje todas as tabs focáveis, sem roving); touch targets residuais entre 24–44px onde o layout não permitiu 44px

---

# Rodada 5 — Família air/: heros de conteúdo → PortalHero (2026-07-24)

## Escopo

Decidido com o usuário: somente as páginas de conteúdo. `IneaRadarPage` (RadarHeroCompact), `IneaStationPage` (hero customizado) e o hero escuro do `IneaAnalyticsFallback` (estado de erro) mantêm identidade própria — exceções registradas.

## O que mudou

- `air/IneaMethodologyPage.tsx`: cabeçalho manual (chip + h1 + subtítulo) → `PortalHero` `tone="lab"`. Chip "Transparência e Reprodutibilidade" preservado como badge glass junto ao ícone 🔬; aside com stat `12` "seções neste guia público" (`sections.length`). Back-link "← Voltar para Radar INEA" preservado acima do hero.
- `air/IneaAnalyticsPage.tsx` (branch principal): cabeçalho manual → `PortalHero` `tone="lab"`. Ícone 📊 no badge; os 4 chips (2 `RadarEvidenceBadge` + ciclo/metodologia) no slot `metrics` (wrapper `flex flex-wrap` com `min-[900px]:col-span-3`, alinhado ao breakpoint do grid do hero); os 2 links de ação no slot `actions`; aside com stat `3` "estações na base auditada" (`staticAnalyticsSummary.stations.length` — estático, correto mesmo com API parcial). Breadcrumb preservado acima do hero.
- `index.css`: h1 do hero no mobile (`@media` pequeno) `overflow-wrap: anywhere` → `overflow-wrap: break-word; hyphens: auto` (html já é `lang="pt-BR"`). "Metodologia" passa a hifenizar ("Metodolo-gia") em vez de quebrar sem hífen; demais heros inalterados (a regra só age em palavras que já transbordavam).

## O que não mudou

- skins do `IneaRadarPage` (e seus ~30 componentes de modo), `IneaStationPage` e `IneaAnalyticsFallback`
- conteúdo (títulos, subtítulos, chips, links) e lógica de dados das duas páginas migradas
- **observação registrada**: o botão "Ver síntese histórica" do hero de Análises aponta para a própria rota `/qualidade-ar/inea/analises` (self-link pré-existente); comportamento preservado, alvo correto a definir com o editorial

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37, incl. `/qualidade-ar/inea/analises` e `/qualidade-ar/inea/metodologia`)
- `npx playwright test tests/portal-hero-radar.spec.ts tests/navigation-pwa.spec.ts tests/home.spec.ts` — PASS (10/10)
- Smoke visual desktop + mobile (`tmp/ui-audit-air-pos/`): heros com badge/título/subtítulo/chips/ações/stat corretos; branch principal de Análises verificado com endpoints `/api/air/inea/*` mockados no Playwright (em dev local a API falha e a rota cai no fallback — comportamento esperado); h1 mobile hifenizando corretamente
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — migração possível em rodada futura, com risco visual (decidir profundidade com o editorial)
2. **CSS/tokens**: retokenização legacy (94 ocorrências `primaria`/`cta`/`ciano`/`texto` em TSX), remoção de CSS morto, consolidação de border-radius/sombras
3. **Bundle**: chunks pesados observados no build (vendor-pdf 428 kB, vendor-maps 161 kB, RadarVisualNotice 165 kB) — avaliar lazy-load mais agressivo dos modos do radar
4. **A11y fino**: roving tabindex nas tabs do DadosPage; touch targets residuais entre 24–44px
5. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises

---

# Rodada 6 — Retokenização legacy + CSS morto (2026-07-24)

## O que mudou

Fim do sistema duplo de tokens (`primaria`/`cta`/`ciano`/`texto` vs `brand-*`): todas as ocorrências em TSX migradas para tokens brand, e os tokens legacy removidos do `tailwind.config.cjs`.

**Mapeamento aplicado** (hex idêntico salvo indicação):

- `primaria` → `brand-primary` (#005DAA, idêntico)
- `cta` → `accent-yellow` (#D4A514, idêntico)
- `acento` → `accent-brown` (#6B3E2E, idêntico)
- `fundo` → `surface-1` (#FFFFFF, idêntico)
- `ciano` → `brand-primary-dark` (#16324F → #12304A, azul-noite equivalente)
- `texto` → `text-primary` (#16324F → #11263B, idem)
- `legacy-base` → `surface-2` (#F7FAFC → #F8FBFD, lavagem clara equivalente)

**Arquivos migrados**: `StatusPage.tsx` (44 ocorrências), `CollectionDetailPage.tsx` (24), `SearchPage.tsx` (15), `AcervoTimelinePage.tsx` (3). Substituição mecânica via perl com padrões delimitados (`text-ciano`, `border-ciano`...) — sem tocar em palavras portuguesas do conteúdo.

**Removidos**:

- `src/pages/PagePlaceholder.tsx` — arquivo morto (zero imports; auditado na rodada 0 como "verificar se roteado")
- `tailwind.config.cjs`: tokens legacy (`legacy-base`, `fundo`, `fundo-card`, `primaria`, `ciano`, `cta`, `acento`, `texto`, `texto-secundario`) e `focus-ring` (token brand morto — zero referências)
- `index.css` — classes mortas confirmadas (zero refs em TSX/TS/HTML/MD/JSON em todo o repo): `.ui-nav-pill`(+`-active`), `.hero-semear-shell`, `.hero-title-shell`, `.hero-search-shell`, `.hero-shortcut-chip`, `.surface-warm-paper`, `.surface-cool-paper`, `.surface-lab`, `.surface-editorial`, `.ui-pill-institutional` (e sua entrada numa media query de touch target)
- correção colateral: `.section-badge` (viva, 3 usos) fazia `@apply ui-pill-institutional` — estilos inline expandidos nela, render idêntico

## O que não mudou

- nenhuma cor visível em páginas com tokens idênticos; diferenças (#16324F→#12304A/#11263B, #F7FAFC→#F8FBFD) são imperceptíveis nos usos (textos escuros, bordas, lavagens claras)
- estrutura, conteúdo e lógica das páginas tocadas
- `tools/fix_admin_access.mjs`: modificação pré-existente no working tree, fora do escopo das rodadas

## QA executada

- grep residual: zero referências a tokens legacy e classes removidas em `src/` + `tailwind.config.cjs`
- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37, incl. `/buscar` e `/status`)
- `npx playwright test tests/portal-hero-radar.spec.ts tests/navigation-pwa.spec.ts tests/seo.spec.ts` — PASS (13/13)
- Smoke visual (`tmp/ui-audit-tokens/`): `/acervo/linha`, `/dossies/ciencia-cidada`, `/buscar`, `/status` íntegros com cores brand (chips, bordas, KPIs)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **CSS**: consolidação de border-radius/sombras duplicados; hero escuro ainda triplicado em algumas variações (`.acervo-hub-hero` ≡ `.portal-stage-hero` ≡ `.data-hero` — verificar quais seguem vivas)
3. **Bundle**: chunks pesados (vendor-pdf 428 kB, vendor-maps 161 kB, RadarVisualNotice 165 kB) — lazy-load mais agressivo
4. **A11y fino**: roving tabindex nas tabs do DadosPage; touch targets residuais entre 24–44px
5. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises

---

# Rodada 7 — Consolidação do hero do Acervo (2026-07-24)

## O que mudou

Resolvida a "triplicação do hero escuro" apontada na auditoria (`.acervo-hub-hero` ≡ `.portal-stage-hero` ≡ `.data-hero`):

- `acervo/AcervoPage.tsx`: hero manual (`.acervo-hub-hero` + grid/copy/metrics próprios) → `PortalHero` `tone="lab"` (gradiente `#071d34→#0a3a68→#005daa` ≈ idêntico ao anterior `#071d34→#0b345a→#005daa`). Badge = `AxisEyebrow` "Acervo vivo" + `semear-core-disc`; métricas reescritas como 3 `.portal-kpi-card` (padrão da home) no slot `metrics`; card-link "Linha do Tempo" (`.acervo-timeline-brief`) preservado no slot `aside`.
- `styles/acervo.css`: removidos ~60 linhas de CSS morto (`.acervo-hub-hero`(+`::before`/`::after`), `-grid`, `-copy`(+regras de h1/p/eyebrow) e `-metrics`(+div/span/small)). Mantidos `.acervo-hub`(+backdrop), `.acervo-timeline-brief` (vivo no aside), cards de área e painel de destaques.

**Decisão registrada — `.data-hero` (DadosPage) NÃO é um hero de página**: é um banner de seção operacional ("Leituras SEMEAR", h2) com faixa de indicadores vivos e estado condicional `isComparing`. Migrá-lo ao `PortalHero` (que renderiza h1 de página) seria semanticamente errado e arriscado; fica como divergência deliberada documentada. Com a migração do Acervo, a triplicação está resolvida: 1 componente (`PortalHero`), 1 banner de seção próprio (`.data-hero`).

## O que não mudou

- conteúdo do hero (título, subtítulo, métricas, link da linha do tempo)
- `.data-hero` e todo o DadosPage
- demais estilos do acervo (cards de área, painel de destaques, backdrop da página)

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run test:a11y` — PASS (37/37)
- `npx playwright test tests/acervo.spec.ts tests/portal-hero-radar.spec.ts tests/navigation-pwa.spec.ts` — PASS (11/11)
- Smoke visual desktop + mobile (`tmp/ui-audit-acervo-hero/`): hero com badge/título/subtítulo/KPIs/aside íntegros; h1 mobile hifenizando ("me-mória"); "Destaques públicos 0" é reflexo do dev local sem backend (mesmo comportamento pré-migração)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **CSS**: consolidação de border-radius/sombras duplicados (baixa prioridade — duplicações estruturais grandes já resolvidas)
3. **Bundle**: chunks pesados (vendor-pdf 428 kB, vendor-maps 161 kB, RadarVisualNotice 165 kB) — lazy-load mais agressivo
4. **A11y fino**: roving tabindex nas tabs do DadosPage; touch targets residuais entre 24–44px
5. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises

---

# Rodada 8 — A11y fino: roving tabindex nas tabs do DadosPage (2026-07-24)

## O que mudou

- `DadosPage.tsx`: as duas tablists (período, 4 tabs; comparação, 3 tabs) ganham roving tabindex — `tabIndex={ativa ? 0 : -1}` nos 7 botões. Complementa a navegação por `ArrowLeft/Right/Home/End` com ativação automática da rodada 2: a tecla Tab agora entra no grupo pela tab ativa (padrão ARIA de tabs), em vez de parar em todas as tabs. Mesmo padrão já implementado no `RadarModeNav` (`tabIndex={isActive ? 0 : -1}`).
- `tests/navigation-pwa.spec.ts`: novo teste "dados tabs use roving tabindex with arrow activation" — verifica tabindex inicial (ativa "24h" = 0, demais = -1), ativação por ArrowRight/Home/End e migração do tabindex junto com `aria-selected`.

**Decisão registrada**: `PortalModeTabs` não é tablist ARIA (botões `aria-pressed` alternando modos de navegação) — roving tabindex não se aplica; todos os botões permanecem tabuláveis.

## O que não mudou

- comportamento de clique e ativação das tabs; conteúdo e layout
- touch targets residuais entre 24–44px (footer/home/chips/nav) — já em conformidade com WCAG 2.2 AA (≥24px); elevação a 44px fica como polimento opcional de design, não como correção

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npx playwright test tests/navigation-pwa.spec.ts tests/dados.spec.ts` — PASS (8/8, incl. novo teste)
- `npm run test:a11y` — PASS (37/37)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **Bundle**: chunks pesados (vendor-pdf 428 kB, vendor-maps 161 kB, RadarVisualNotice 165 kB) — lazy-load mais agressivo
3. **CSS**: consolidação de border-radius/sombras duplicados (baixa prioridade)
4. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises

A11y: todos os itens práticos da auditoria (críticos, altos, médios e finos) estão resolvidos; restam apenas melhorias opcionais acima do AA.

---

# Rodada 9 — Bundle: precache do SW alinhado à filosofia "cache on first use" (2026-07-30)

## Diagnóstico (o que mudou em relação à dívida registrada)

Medição real do build mostrou que a dívida "lazy-load mais agressivo" já estava essencialmente paga na arquitetura de código:

- **vendor-pdf (427.6 kB / gzip 127.3)**: `pdfjs-dist` carregado apenas por dynamic import em `lib/extractPdfText.ts`, usado somente pelo admin (`AdminTransparencyLiveEditPage`). Fora do precache. Máximo lazy possível sem trocar a lib — aceito.
- **vendor-maps (161.2 kB / gzip 50.3)**: leaflet/react-leaflet já lazy em todos os 5 consumidores (`MapaPage` via `MapaLandingPage`, `TransparencyTerritoryMap`, `AirAtlasMap`, `SocialExposureMap`, `AdminReportLocationMap`). Fora do precache. Nada a fazer.
- **vendor-supabase (170.7 kB / gzip 45.4)**: o entry (`index`, 74.3 kB) importa estaticamente apenas `vendor-react` (141.9) e `vendor-router` (38) — supabase carrega só quando uma rota lazy que usa `lib/api` é visitada, ou no admin. Fora do caminho crítico.
- **RadarVisualNotice (164.7 kB / gzip 11.7)**: nome enganoso — é o shared chunk da família `/qualidade-ar` (componentes + copy compartilhados entre as 4 páginas air, extraídos pelo Rollup e nomeados pelo módulo representativo). Só baixa ao entrar na família; 11.7 kB gzip na rede. Aceito.

## O que mudou

O ponto cego real era o **precache do service worker**: 1563.73 KiB / 72 entries, incluindo ~50 chunks `/assets/` de features lazy (toda a família radar, mapas, gráficos, dados inline) — contradizendo a filosofia documentada no próprio `src/sw.ts` ("Lazy chunks and route CSS: cache on first use instead of precaching everything", via StaleWhileRevalidate 180 entries/14 dias).

- `vite.config.ts` → `injectManifest.globPatterns`: de `**/*.{js,css,html,ico,png,svg}` para whitelist do boot path — `**/*.{html,ico,png,svg}` + `assets/index-*.js` + `assets/vendor-react-*.js` + `assets/vendor-router-*.js` + `assets/*.css`. `globIgnores` anteriores mantidos como defesa caso os patterns sejam ampliados no futuro.
- `vite.config.ts` → `globIgnores`: `icons/icon-512.png` (368 KiB) fora do precache — só é requisitado online pelo navegador (install/splash; SO cacheia na instalação). Push notifications usam `icon-192.png` (48 KiB), que permanece.

**Resultado: precache 1563.73 KiB / 72 entries → 723.15 KiB / 24 entries (−53.7%).** Composição final: JS crítico (254 KiB) + CSS único (408 KiB) + HTMLs prerendered das 5 rotas (316 KiB) + ícones/brand essenciais.

## O que não mudou

- Contrato offline: nenhum `*Page-*.js` já era precacheado (rotas sempre dependeram do runtime cache na primeira visita) — a mudança só estende a mesma regra aos sub-chunks de feature. `docs/OFFLINE.md` segue correto sem alterações.
- `routeAssetsPreloader` (modulepreload por rota), `additionalManifestEntries` (12 rotas), estratégias runtime do `sw.ts` — intactos.
- Nenhum código de aplicação tocado; mudança restrita a config de build/PWA.

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npx playwright test tests/navigation-pwa.spec.ts tests/dados.spec.ts` — PASS (8/8)
- Build ×3 para medição (baseline 1563.73 KiB → 1088.05 → 723.15 KiB), precache final inspecionado entry a entry
- `npm run test:a11y` — PASS (37/37)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build com precache 24 entries/723.15 KiB + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **CSS**: `style-*.css` único de 408 KiB (`cssCodeSplit: false`, decisão deliberada) — avaliar purga/split por família; consolidação de border-radius/sombras (baixa prioridade)
3. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises

Bundle: encerrado no que é alcançável sem trocar dependências (pdfjs) ou repartir dados inline do radar (custo/benefício desfavorável: 11.7 kB gzip).

---

# Rodada 10 — CSS: split por rota (cssCodeSplit) no caminho crítico (2026-07-30)

## Diagnóstico

- `style-*.css` único: 416 KB raw / 57.2 KB gzip, `cssCodeSplit: false` (decisão do commit de prerender, sem documentação de motivo) — tudo render-blocking e precacheado.
- Composição da fonte: `index.css` 89 KB (Tailwind + design system) e `home.css` 27.5 KB, ambos eager via `main.tsx`; `admin.css` 16.7 KB, `mapa.css` 3.8 KB, `acervo.css` 2.7 KB e vendors (leaflet, uPlot) importados por módulos lazy — mas tudo parava no arquivo único.
- Contrato existente relevante: o CSS principal já é **deferred** por design — prerender injeta CSS crítico inline (`data-prerender-critical`) e o link completo ativa por interação/timeout 15s (`main.tsx`, testado em `seo.spec.ts` e exigido por `seo-static-assert.ts`). Ou seja, o custo real do CSS único era rede/parse/precache, não bloqueio de primeira pintura.

## O que mudou

- `vite.config.ts` → `cssCodeSplit: true` (com comentário registrando a decisão). O CSS do entry cai para 356.6 KB raw / **45.1 KB gzip (−12.1 KB gzip em toda página)**; cinco splits passam a carregar sob demanda com seus chunks: `AdminRoutes` 32.1 KB (gzip 4.2), `vendor-maps` 15.0 KB (gzip 6.4), `acervo` 7.9 KB (gzip 1.5), `MapaPage` 3.9 KB (gzip 1.2), `vendor-uplot` 1.7 KB (gzip 0.7).
- Nenhum ajuste de `globIgnores` necessário: os patterns legados (`Admin*.css`, `acervo-*.css`, `MapaPage-*.css`, `vendor-maps-*.css`, `vendor-uplot-*.css`) já excluíam exatamente os splits novos do precache. **Precache: 723.15 → 665.14 KiB** (só `index-*.css` entra).
- Runtime cache do SW (`StaleWhileRevalidate` em `/assets/*.css`, `sw.ts`) já cobria CSS lazy — nada a mudar.

## O que não mudou

- Contrato do CSS deferred: `seo.spec.ts` (5 testes de prerender, rodados contra preview de produção com `PLAYWRIGHT_EXPECT_PRERENDER=true`) — **5/5 PASS**, link deferred ativa por interação e hidratação sem erros React, com o split aplicado.
- `index.css`/`home.css` continuam eager (são o design system + home, página mais visitada) — redução adicional exigiria repartir Tailwind por família ou refatorar classes arbitrary-value para tokens: custo/benefício desfavorável, registrado como limite desta frente.
- Nenhum código de aplicação tocado; mudança restrita a config de build.

## QA executada

- Smoke produção (`scratch/smoke-css-split.mjs`, vite preview + Playwright, 4/4): home aplica entry CSS após ativação; `/acervo` carrega e aplica `acervo-*.css` (backdrop `::before`); `/mapa` prova lazy — `vendor-maps-*.css` ausente na landing e presente após opt-in, `.leaflet-container` com altura real; `/dados` sem CSS de feature extra
- `npx playwright test tests/seo.spec.ts tests/navigation-pwa.spec.ts tests/dados.spec.ts` — 13/13 PASS (5 skips condicionais pré-existentes de prerender)
- `tests/seo.spec.ts` com `PLAYWRIGHT_EXPECT_PRERENDER=true` contra preview — 5/5 PASS
- `npm run test:a11y` — PASS (37/37)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build com entry CSS 356.6 KB/gzip 45.1 + prerender 5 rotas + seo:assert 28 rotas)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises
3. **CSS** (limite conhecido, baixa prioridade): 356 KB raw de entry CSS são Tailwind arbitrary-values + design system; split por família ou tokenização exigiria refatoração ampla de markup

---

# Rodada 11 — Touch targets: 44px em todas as larguras (2026-07-30)

## Diagnóstico

Medição instrumentada (`scratch/measure-touch-targets.mjs`, Playwright: 6 rotas × desktop 1280px/mobile 390px, todos os interativos visíveis < 44px):

- **Mobile já estava limpo** — a regra de 44px existia mas apenas dentro de `@media (max-width: 720px)` (`index.css`), cobrindo `.home-popular a`, `.home-section-head a`, `.site-footer a`. As rodadas 1–2 já haviam corrigido os alvos críticos mobile.
- **Desktop tinha 83 alvos reais < 44px**: nav primário 41px, dropdown "Mais" ~39px, input de busca da home 23px, "buscas populares" 37px, "Ver todos" 29px, links do nav do footer 21px (1 linha) / 41px (2 linhas), chips de filtro de `/buscar` 40px. (Os itens de 21px atribuídos na auditoria ao dropdown eram, na verdade, links do footer — o dropdown nem existia no DOM com o painel fechado.)
- Skip links 1×1px: corretos por design (expandem ao foco) — não tocados.

## O que mudou

- `index.css`:
  - `.site-nav a`: padding vertical 0.65rem → 0.8rem (41 → ~45px)
  - `.site-nav .site-nav-more-panel a`: padding 0.72rem → 0.85rem (~39 → ~44px)
  - nova regra `.site-footer nav a { display: inline-flex; min-height: 2.75rem; align-items: center }` (21/41 → 44px) — escopo `nav a` deliberado: `.site-footer a` genérico (0-1-1) quebraria o `display: grid` do `.site-footer-pwa` (0-1-0) por especificidade
  - removido o bloco redundante da `@media (max-width: 720px)` (as três regras agora valem na origem, em todas as larguras)
- `styles/home.css`:
  - `.home-popular a`: + `inline-flex; min-height: 2.75rem; align-items: center` (37 → 44px)
  - `.home-section-head a`: idem (29 → 44px)
  - `.home-search input`: + `min-height: 2.75rem` (23 → 44px; área focável acompanha a altura do form)
- `SearchPage.tsx`: chips de filtro `min-h-[40px]` → `min-h-[44px]` (40 → 44px; a classe `ui-segment-tab` já dava 44px no mobile via CSS)

**Re-medição: 0 alvos reais < 44px nas 6 rotas × 2 viewports** (restam apenas os 2 skip links por página, deliberados). WCAG 2.5.8 agora atendido no tamanho-alvo **AAA** (44px), não só no mínimo AA (24px).

## O que não mudou

- Layout: footer cresce ~1 linha de ritmo vertical (links uniformes de 44px), hero da home com pills de busca popular mais altos — smoke visual desktop+mobile (`tmp/ui-audit-touch44/`) íntegro, incl. dropdown "Mais" aberto e chips de `/buscar`
- Skip links 1×1px (padrão visually-hidden-until-focus)
- `.site-footer-pwa` e `.site-footer-social a` (já 44px; protegidos da colisão de especificidade)

## QA executada

- Medição antes/depois com o mesmo instrumento: 107 → 24 ocorrências (24 = apenas skip links, 2 × 6 rotas × 2 viewports)
- Smoke visual desktop + mobile (`tmp/ui-audit-touch44/`): hero, footer, dropdown "Mais", chips de busca — íntegros
- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npx playwright test tests/navigation-pwa.spec.ts tests/home.spec.ts tests/seo.spec.ts` — 11/11 PASS (+5 skips condicionais pré-existentes)
- `npm run test:a11y` — PASS (37/37)
- `npm run verify` — PASS (lint + typecheck + inea:qa + functions smoke + build + prerender 5 rotas + seo:assert 28 rotas; rerun após órfão de dev server travar o teardown da 1ª execução — testes já haviam passado)

## Dívida técnica restante (atualizada)

1. **Família `air/` — identidade própria restante**: RadarHeroCompact e modos do Radar, hero da `IneaStationPage`, hero do fallback analítico — rodada futura com decisão editorial
2. **Editorial**: definir alvo do botão "Ver síntese histórica" (self-link) no hero de Análises
3. **CSS** (limite conhecido, baixa prioridade): 356 KB raw de entry CSS (Tailwind arbitrary-values + design system); split por família/tokenização exigiria refatoração ampla de markup

A11y: encerrado também acima do AA — touch targets 44px (AAA de 2.5.8) em todas as larguras. Não restam itens práticos da auditoria original sem dependência editorial.
