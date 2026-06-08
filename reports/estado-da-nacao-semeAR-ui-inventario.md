# Estado da Nacao — SEMEAR UI Inventario

Data: 2026-06-02

## Objetivo

Mapear as rotas publicas principais do portal SEMEAR, identificar funcoes, problemas visuais, prioridade de redesign, risco tecnico e oportunidades de reutilizacao de componentes antes da consolidacao visual global.

## Leitura geral

O portal ja possuia tres familias visuais coexistindo:

1. paginas antigas com casca propria e classes especificas (`home-*`, `data-*`, `site-*`);
2. paginas intermediarias com `portal-stage-*`, `SurfaceCard`, `AxisEyebrow` e `BrandSystem`;
3. Radar INEA mais novo, com linguagem APS/Concreto Zen mais forte.

O problema central nao era ausencia de UI, mas fragmentacao de linguagem e recorrencia de componentes sem um contrato global unico.

## Rotas publicas mapeadas

| Rota | Funcao | Componentes atuais / padrao | Problemas visuais | Prioridade | Risco tecnico | Reuso recomendado |
|---|---|---|---|---|---|---|
| `/` | Home / hub institucional | `home-*`, cards custom, banners INEA | mistura de eras visuais, hero proprio, acessos rapidos sem mesmo sistema do Radar | Alta | Medio | `PortalHero`, `PortalSectionHeader`, `PortalCard`, `PortalMetricCard` |
| `/dados` | painel de dados da rede SEMEAR | `SurfaceCard`, `AxisEyebrow`, `EmptyState`, `data-*` | boa densidade, mas com trechos ainda administrativos e atalhos heterogeneos | Alta | Medio | `PortalPageShell`, `PortalSectionHeader`, `PortalNotice`, `PortalEmptyState`, `PortalModeTabs` |
| `/qualidade-ar/inea` | observatorio do ar INEA | sistema novo componentizado | referencia positiva do portal | Baixa | Medio | fonte de referencia para todo o resto |
| `/qualidade-ar/inea/metodologia` | biblioteca metodologica INEA | pagina tecnica robusta | extensa, mas ja coerente | Media | Medio | `PortalDownloadCard`, `PortalNotice`, `PortalSectionHeader` |
| `/qualidade-ar/inea/historia` | historia / narrativa dos dados INEA | familia INEA | provavelmente ja alinhada ao novo eixo | Media | Medio | shell INEA + downloads/documental |
| `/qualidade-ar/inea/analises` | analitica INEA | familia INEA | mais tecnica, precisa so ajuste fino futuro | Media | Medio | `PortalMetricCard`, `PortalModeTabs` |
| `/qualidade-ar/inea/estacoes/:stationId` | detalhe de estacao INEA | familia INEA | precisa revisao futura de consistencia | Media | Medio | `PortalNotice`, `PortalCard` |
| `/acervo` | hub de acervo | `BrandSystem`, `AxisSystem`, `EditorialCard` | relativamente maduro, faltava contrato global explicito | Media | Baixo | `PortalPageShell`, `PortalSectionHeader`, `PortalCard` |
| `/acervo/linha` | linha do tempo do acervo | `SurfaceCard`, `EditorialCard` | coerente, mas com header local proprio | Media | Baixo | `PortalSectionHeader`, `PortalEmptyState` |
| `/acervo/:area` | lista por area do acervo | familia documental | precisa polimento futuro | Media | Medio | `PortalSectionHeader`, `PortalCard`, `PortalEmptyState` |
| `/acervo/item/:slug` | detalhe do item do acervo | pagina documental | ainda fora do contrato global novo | Media | Medio | `PortalPageShell`, `PortalDownloadCard`, `PortalNotice` |
| `/dossies` | colecoes / dossies | familia documental | precisa alinhamento futuro | Media | Medio | `PortalCard`, `PortalHero` |
| `/dossies/:slug` | detalhe de colecao | familia documental | precisa alinhamento futuro | Media | Medio | `PortalCard`, `PortalSectionHeader` |
| `/relatorios` | central de relatorios e evidencias | `DocumentalCard`, `SurfaceCard`, filtros proprios | relativamente madura; faltava unificacao de filtros e hero | Alta | Baixo | `PortalPageShell`, `PortalSectionHeader`, `PortalEmptyState` |
| `/relatorios/:slug` | detalhe do relatorio | documental | futura unificacao | Media | Medio | `PortalDownloadCard`, `PortalNotice` |
| `/agenda` | agenda publica | lista simples com hero local | estrutura funcional, mas vazios e CTA fracos | Alta | Baixo | `PortalHero`, `PortalEmptyState`, `PortalSectionHeader` |
| `/conversar` | mobilizacao e atividades | hero local + formulario + listas | heterogeneo e com estados vazios simples | Alta | Medio | `PortalHero`, `PortalEmptyState`, `PortalSectionHeader`, `PortalNotice` |
| `/conversar/:slug` | detalhe de conversa | pagina editorial | precisa alinhamento futuro | Media | Medio | `PortalPageShell`, `PortalCard` |
| `/como-ler-dados` | guia pedagogico | `SurfaceCard` local | util, mas ainda isolado no sistema | Alta | Baixo | `PortalHero`, `PortalSectionHeader`, `PortalNotice` |
| `/como-participar` | guia de participacao | pagina institucional | precisa alinhamento futuro | Media | Baixo | `PortalHero`, `PortalActionCard` |
| `/sobre` | institucional / apresentacao | pagina de conteudo | label no header confundia com "Guias" | Media | Baixo | `PortalHero`, `PortalSectionHeader` |
| `/transparencia` | transparencia do projeto | institucional | precisa casca comum | Media | Baixo | `PortalNotice`, `PortalDownloadCard` |
| `/governanca` | governanca / equipe | institucional | precisa casca comum | Media | Baixo | `PortalHero`, `PortalCard` |
| `/imprensa` | relacao com imprensa | institucional | precisa casca comum | Media | Baixo | `PortalCard`, `PortalSectionHeader` |
| `/apresentacao` | apresentacao do projeto | institucional | precisa casca comum | Media | Baixo | `PortalHero` |
| `/programa-uff-territorio` | pagina institucional tematica | institucional | precisa casca comum | Media | Baixo | `PortalHero`, `PortalCard` |
| `/alertas` | alertas e leituras | pagina funcional | precisa polimento futuro | Media | Medio | `PortalNotice`, `PortalMetricCard` |
| `/mapa` | mapa | superficie operacional | nao priorizada neste sprint | Media | Medio | `PortalPageShell`, `PortalNotice` |
| `/inscricoes` | inscricoes em eventos | utilitaria | nao priorizada neste sprint | Baixa | Medio | `PortalNotice`, `PortalCard` |
| `/status` | status publico | institucional tecnica | precisa so alinhamento fino futuro | Baixa | Baixo | `PortalNotice`, `PortalMetricCard` |
| `/buscar` | busca global | utilitaria | precisa unificacao futura | Media | Medio | `PortalEmptyState`, `PortalSectionHeader` |
| `/privacidade-lgpd` | politica / FAQ | institucional | baixa urgencia visual | Baixa | Baixo | `PortalPageShell`, `PortalSectionHeader` |

## Problemas transversais encontrados

1. **Heroes de familias diferentes**  
   Havia hero do tipo `home-*`, hero `portal-stage-*` e hero do Radar INEA, cada um com densidade, sombra e contraste diferentes.

2. **Estados vazios inconsistentes**  
   Algumas paginas tinham texto seco; outras ja usavam componentes ilustrados.

3. **Header e footer parcialmente coerentes, mas com semantica desalinhada**  
   O link "Guias" apontava para `/sobre`, o que confundia a navegacao.

4. **Cards sem contrato semantico unificado**  
   Existiam `card-leitura`, `semear-card-*`, `DocumentalCard`, `home-feature-card`, `portal-thread-row`, etc.

5. **Copias de CTA e atalhos com pesos visuais diferentes**  
   Em varias paginas os botoes nao pareciam pertencer ao mesmo produto.

## Componentes reutilizaveis candidatos

Componentes consolidados ou propostos para reuso global:

- `PortalPageShell`
- `PortalHero`
- `PortalSectionHeader`
- `PortalCard`
- `PortalMetricCard`
- `PortalActionCard`
- `PortalNotice`
- `PortalEmptyState`
- `PortalDownloadCard`
- `PortalModeTabs`

Componentes existentes mantidos como base:

- `SurfaceCard`
- `IconShell`
- `AxisEyebrow`
- `DocumentalCard`
- `EditorialCard`

## Prioridade de rollout visual

### Camada 1 — impacto imediato

- `/`
- `/dados`
- `/relatorios`
- `/agenda`
- `/conversar`
- `/como-ler-dados`

### Camada 2 — documental / institucional

- `/acervo`
- `/acervo/linha`
- `/sobre`
- `/transparencia`
- `/governanca`
- `/imprensa`

### Camada 3 — operacionais / utilitarias

- `/alertas`
- `/mapa`
- `/inscricoes`
- `/buscar`
- `/status`

## Conclusao

O portal nao precisava de um redesign total do zero. Precisava de uma camada global de contrato visual e semantico para fazer as paginas parecerem partes do mesmo produto. O Radar INEA passou a funcionar como referencia de maturidade. O restante do trabalho era consolidar primitives globais e aplica-las primeiro nas rotas de maior impacto publico.
