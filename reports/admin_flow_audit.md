# Auditoria do fluxo editorial/admin

Data: 2026-05-13

Escopo auditado:
- /admin
- /admin/uploads
- /admin/acervo
- /admin/acervo/novo
- /admin/acervo/:id
- /admin/relatorios
- /admin/relatorios/novo
- /admin/relatorios/:id
- /admin/blog
- /admin/blog/novo
- /admin/blog/:id

Metodo:
- auditoria estatica de codigo nas rotas admin e nas paginas reais ligadas a cada rota
- foco em existencia da rota, carga de componente real, leitura/gravação Supabase, validacoes, status editoriais, integracao com media_assets, assetId por querystring e link publico
- sem criar feature nova; sem assumir comportamento sem evidencia em codigo
- sem reexecutar navegacao autenticada ponta a ponta nesta etapa

Legenda:
- FUNCIONAL: rota real, componente real, acoes primarias completas para o escopo da tela
- PARCIAL: rota real, mas com lacuna relevante no fluxo principal
- PLACEHOLDER: tela essencialmente vazia ou so de encaminhamento
- QUEBRADO: evidencia direta de falha estrutural no fluxo principal

## Resumo executivo

Resultado geral: o fluxo auditado esta majoritariamente FUNCIONAL. As rotas pedidas existem no subtree admin, usam componentes reais e, nos fluxos editoriais de Acervo, Relatorios e Blog, ha leitura e escrita direta no Supabase, validacoes de publicacao, integracao com `media_assets`, suporte a `assetId` por querystring e CTA para abrir o conteudo publico.

Risco residual deste audit: a conclusao sobre "aparece no portal publico" foi inferida por codigo e pelo contrato entre editor, rotas publicas e slugs salvos; isso nao foi revalidado por um browser autenticado nesta etapa.

## Classificacao por rota

| Rota | Classificacao | Evidencia resumida |
| --- | --- | --- |
| /admin | FUNCIONAL | Dashboard real com `loadDashboard()`, consultas consolidadas no Supabase, pendencias, atividade e acoes rapidas. |
| /admin/uploads | FUNCIONAL | Faz upload real via `adminUploadMedia`, lista `media_assets`, valida `alt_text` para imagem publicada e encaminha `assetId` para Acervo/Relatorios/Blog. |
| /admin/acervo | FUNCIONAL | Lista real de `acervo_items`, filtros de busca/tipo/status, editar, excluir e abrir item publico. |
| /admin/acervo/novo | FUNCIONAL | Usa editor real de Acervo com insert no Supabase, validacao de publicacao, `assetId`, anexos, capa, ordenacao de midias e sucesso com link publico. |
| /admin/acervo/:id | FUNCIONAL | Mesmo editor real em modo edicao, com load por `id`, update no Supabase e link para `/acervo/item/:slug`. |
| /admin/relatorios | FUNCIONAL | Lista real de `reports`, filtros, alerta de item sem PDF, preview publico, editar e excluir. |
| /admin/relatorios/novo | FUNCIONAL | Editor real com insert, validacao de PDF para publicacao, selecao/upload de PDF/capa, `assetId` e link publico. |
| /admin/relatorios/:id | FUNCIONAL | Validado em runtime com fixture controlada `admin-fixture-relatorio-teste`, abrindo o editor por `id`, carregando campos e mantendo update em `reports`. |
| /admin/blog | FUNCIONAL | Lista real de `blog_posts`, filtros por busca/status, preview publico, editar e excluir. |
| /admin/blog/novo | FUNCIONAL | Editor real com insert, preview markdown, capa, PDF como anexo, `assetId`, validacoes de publicacao e link publico. |
| /admin/blog/:id | FUNCIONAL | Mesmo editor em modo edicao, com load por `id`, update no Supabase e retorno visual de publicacao. |

## Matriz de capacidades

| Rota | Existe | Carrega tela real | Busca dados reais | Salva no Supabase | Validacao | Status editorial | Media/assets | assetId querystring | Ver no portal | Aparenta no portal publico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /admin | sim | sim | sim | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| /admin/uploads | sim | sim | sim (`media_assets`) | sim (via `adminUploadMedia`) | sim | parcial (`draft`/`published`) | sim | n/a | abre arquivo/copiar URL | n/a |
| /admin/acervo | sim | sim | sim (`acervo_items`) | nao, tela de lista | filtros e confirmacao de delete | sim | link com `assetId` para criar | n/a na propria tela | sim | indireto |
| /admin/acervo/novo | sim | sim | sim (`acervo_collections`, `media_assets`) | sim (`insert`) | sim, incluindo acessibilidade | sim (`draft`/`published`/`scheduled`/`archived`) | sim | sim | no fluxo publicado | inferido como sim |
| /admin/acervo/:id | sim | sim | sim (`acervo_items`, `media_assets`) | sim (`update`) | sim, incluindo acessibilidade | sim | sim | nao aplicavel na rota de edicao | sim | inferido como sim |
| /admin/relatorios | sim | sim | sim (`reports`) | nao, tela de lista | filtros e confirmacao de delete | sim | alerta de PDF faltante | n/a | sim | indireto |
| /admin/relatorios/novo | sim | sim | sim (`media_assets`) | sim (`insert`) | sim, PDF obrigatorio para publicar | sim (`draft`/`published`/`archived`) | sim | sim | no fluxo publicado | inferido como sim |
| /admin/relatorios/:id | sim | sim | sim (`reports`, `media_assets`) | sim (`update`) | sim | sim | sim | nao aplicavel na rota de edicao | sim | sim |
| /admin/blog | sim | sim | sim (`blog_posts`) | nao, tela de lista | filtros e confirmacao de delete | sim | link com `assetId` via Uploads | n/a | sim | indireto |
| /admin/blog/novo | sim | sim | sim (`media_assets`) | sim (`insert`) | sim, incluindo corpo/resumo/capa acessivel quando usada | sim (`draft`/`published`/`scheduled`/`archived`) | sim | sim | no fluxo publicado | inferido como sim |
| /admin/blog/:id | sim | sim | sim (`blog_posts`, `media_assets`) | sim (`update`) | sim | sim | sim | nao aplicavel na rota de edicao | sim | inferido como sim |

## Evidencias por area

### Dashboard `/admin`

- A rota index do admin aponta para `AdminDashboardPage`.
- `loadDashboard()` consulta `acervo_items`, `blog_posts`, `reports`, `media_assets` e `events`.
- A tela monta cards de stats, lista de pendencias e grupos de atividade recentes.
- Ha acoes rapidas para novo artigo, nova materia, novo relatorio, novo evento, upload e revisao de rascunhos.

Classificacao: FUNCIONAL.

### Uploads `/admin/uploads`

- Busca os uploads recentes em `media_assets`.
- Faz upload via `adminUploadMedia`.
- Valida `alt_text` ao publicar imagens.
- Ao concluir, oferece `Usar no Acervo`, `Usar em Relatorio` e `Usar no Blog` com `assetId` na querystring.
- A sidebar de uploads recentes repete os atalhos de reaproveitamento.

Classificacao: FUNCIONAL.

### Acervo `/admin/acervo`, `/admin/acervo/novo`, `/admin/acervo/:id`

- Lista consulta `acervo_items` com busca, filtro por tipo e status, editar, excluir e abrir no portal.
- Editor novo/edicao usa a mesma tela real.
- Carrega colecoes e `media_assets`, aceita `assetId` e preanexa midia/capa.
- Salva por `insert` ou `update` em `acervo_items`.
- Valida titulo, slug, resumo, tipo, fonte para tipos especificos e `alt_text` de imagens antes de publicar.
- Mantem `draft`, `published`, `scheduled` e `archived`.
- Permite adicionar, remover, reordenar midias e definir capa.
- Quando publicado, mostra aviso de sucesso com CTA `Ver no portal` para `/acervo/item/:slug`.

Classificacao: FUNCIONAL.

### Relatorios `/admin/relatorios`, `/admin/relatorios/novo`, `/admin/relatorios/:id`

- Lista consulta `reports` com filtros por busca, tipo, ano e status.
- Sinaliza visualmente relatorios publicados sem PDF.
- Editor novo/edicao usa a mesma tela real.
- Carrega `media_assets`, aceita `assetId`; PDF vira documento principal e imagem vira capa.
- Salva por `insert` ou `update` em `reports`.
- Na publicacao, exige titulo, slug e PDF.
- Mantem `draft`, `published` e `archived`.
- Tem preview e link publico para `/relatorios/:slug`.

Classificacao: FUNCIONAL.

### Blog `/admin/blog`, `/admin/blog/novo`, `/admin/blog/:id`

- Lista consulta `blog_posts` com busca e filtro por status.
- Editor novo/edicao usa a mesma tela real.
- Carrega `media_assets`, aceita `assetId`; imagem vira capa e PDF pode virar anexo.
- Salva por `insert` ou `update` em `blog_posts`.
- Na publicacao, valida titulo, resumo e corpo; alerta quando nao ha capa e barra publicacao com capa sem `alt_text`.
- Mantem `draft`, `published`, `scheduled` e `archived`.
- Possui preview markdown em tempo real.
- Ao salvar com PDF selecionado, injeta bloco de anexo no markdown se necessario.
- Tem preview e link publico para `/blog/:slug`.

Classificacao: FUNCIONAL.

## Smokes adicionados

Foram criados smokes estaticos para reduzir regressao estrutural sem depender de dados reais:

- `tools/admin-routes-smoke.mjs`
- `tools/admin-upload-flow-smoke.mjs`
- `tools/admin-acervo-flow-smoke.mjs`
- `tools/admin-reports-flow-smoke.mjs`
- `tools/admin-blog-flow-smoke.mjs`

Eles validam:
- arvore de rotas admin esperada
- presenca de consultas Supabase reais nas listas e editores
- presenca de `insert`/`update` nos editores
- validacoes centrais de publicacao
- fluxo `assetId` via querystring
- integracao com `media_assets`
- links e CTAs para o portal publico

## Conclusao

No escopo pedido, nao encontrei tela classificada como `PLACEHOLDER` ou `QUEBRADO`. Tambem nao encontrei lacuna suficiente para marcar como `PARCIAL` as rotas auditadas. O estado atual do fluxo editorial/admin auditado e `FUNCIONAL`, com o caveat de que esta conclusao foi sustentada por leitura do codigo e smokes estruturais, nao por navegacao autenticada ponta a ponta nesta mesma rodada.

## Complemento runtime autenticado

Execucao adicional em 2026-05-13, com login administrativo real em ambiente local (`/admin/login`) usando usuario temporario provisionado apenas para auditoria.

Rotas confirmadas em navegador autenticado:

- `/admin`: dashboard abriu com cards, pendencias e acoes rapidas.
- `/admin/uploads`: abriu com formulario de upload e estado vazio coerente para uploads recentes.
- `/admin/acervo`: abriu com tabela real e acoes de preview/edicao.
- `/admin/acervo/novo`: abriu corretamente apos correcao local no loader.
- `/admin/acervo/:id`: abriu corretamente a partir do botao `Editar` da primeira linha da lista.
- `/admin/relatorios`: abriu com filtros e empty state real (`Nenhum relatório encontrado.`) antes da fixture controlada.
- `/admin/relatorios/novo`: abriu corretamente com formulario completo de criacao.
- `/admin/relatorios/:id`: abriu corretamente com a fixture `admin-fixture-relatorio-teste` (`61b2bcba-3491-415c-8b3f-e5cfe374f6cc`), carregando titulo, slug, resumo, status `draft`, tags e preview publico.
- `/admin/blog`: abriu com lista real de posts.
- `/admin/blog/novo`: abriu corretamente apos correcao local no loader.
- `/admin/blog/:id`: abriu corretamente a partir do botao `Editar` da primeira linha da lista.

Achado runtime corrigido durante a auditoria:

- `src/pages/admin/AdminAcervoEditPage.tsx` e `src/pages/admin/AdminBlogEditPage.tsx` mantinham `loading` na lista de dependencias do `useCallback(loadData)`. Isso fazia o loader se recriar a cada troca de loading e mantinha `/admin/acervo/novo` e `/admin/blog/novo` presos em `Carregando editor...` com requisicoes reiniciando em loop.
- A correcao minima foi remover `loading` dessas dependencias. Depois disso, os dois editores carregaram normalmente em runtime.

Limitacao restante desta rodada runtime:

- a prova runtime de `/admin/relatorios/:id` agora depende da fixture controlada `admin-fixture-relatorio-teste` ou de dado real equivalente; sem isso, a validacao volta a ficar pendente de dado.