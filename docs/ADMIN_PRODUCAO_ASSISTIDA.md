# Admin SEMEAR: Producao Assistida

Este documento orienta a equipe a executar testes reais no painel administrativo do SEMEAR usando conteudo de verdade, sem alterar o produto, sem criar features novas e sem mexer diretamente em banco.

Escopo deste roteiro:
- validar operacao assistida do painel admin
- testar os fluxos reais ja existentes
- registrar erros com contexto suficiente para reproducao
- confirmar se o conteudo chega ao portal publico

Pre-condicoes:
1. Ter acesso administrativo ao painel em `/admin`.
2. Trabalhar em ambiente controlado, com janela combinada de testes editoriais.
3. Ter pelo menos uma imagem e um PDF validos disponiveis localmente.
4. Evitar reutilizar slugs ja usados em testes anteriores.
5. Ao final da rodada, rodar `npm run done` no projeto.

Convencao recomendada para dados de teste:
- Prefixar titulos com `Teste Assistido`.
- Incluir data no slug quando possivel.
- Usar tags como `teste`, `producao-assistida`, `admin`.

## 1. Upload de imagem

Objetivo:
- validar o fluxo de upload para `media_assets`, o preenchimento minimo de metadados e a reutilizacao posterior do asset.

Dados minimos obrigatorios:
- arquivo de imagem em JPG, PNG ou WEBP
- titulo
- descricao curta
- `alt_text`
- credito
- tags

Passo a passo:
1. Abrir `/admin/uploads`.
2. Selecionar uma imagem valida.
3. Preencher `Titulo do Arquivo`.
4. Preencher `Descricao Curta`.
5. Preencher `Texto Alternativo`.
6. Preencher `Creditos`.
7. Preencher `Tags` com pelo menos `teste,producao-assistida`.
8. Manter bucket coerente com o uso esperado.
9. Clicar em `Iniciar Upload`.
10. Ao concluir, usar `Copiar URL`.
11. Confirmar que o card aparece em `Ultimos Envios`.

Resultado esperado:
- upload concluido sem erro
- URL publica copiada com sucesso
- item visivel em uploads recentes
- asset reutilizavel via atalhos `Usar no Acervo`, `Usar em Relatorio` ou `Usar no Blog`

Problemas comuns:
- arquivo acima do limite aceito
- tipo MIME nao suportado
- tentativa de publicar imagem sem `alt_text`
- titulo vazio ou metadados incompletos
- upload concluido, mas item nao aparece em `Ultimos Envios`

Como registrar bug:
- informar rota (`/admin/uploads`)
- nome do arquivo enviado
- horario aproximado
- bucket escolhido
- mensagem exibida em tela
- se a URL foi gerada ou nao

## 2. Criar item do Acervo

Objetivo:
- validar criacao, salvamento, publicacao e exibicao publica de um item do Acervo usando asset real enviado no passo anterior.

Dados minimos obrigatorios:
- titulo
- slug
- resumo
- tipo do item
- fonte, quando exigida pelo tipo
- asset de imagem ou documento associado

Passo a passo:
1. A partir de `/admin/uploads`, clicar em `Usar no Acervo` no asset enviado; alternativamente abrir `/admin/acervo/novo?assetId=<id>`.
2. Confirmar que o asset foi anexado ou preselecionado.
3. Preencher `Titulo do Item`.
4. Ajustar `Slug da URL`.
5. Preencher `Resumo Executivo`.
6. Preencher `Corpo do Texto (Markdown)` com conteudo minimo.
7. Preencher `Veiculo / Fonte` quando o tipo exigir.
8. Confirmar `Status Editorial = Rascunho` e salvar rascunho.
9. Reabrir o item, revisar dados e clicar em `Publicar Agora`.
10. Usar `Preview` ou `Ver no portal`.
11. Confirmar que o item aparece em `/acervo` e em `/acervo/item/:slug`.

Resultado esperado:
- item salvo em rascunho sem erro
- publicacao concluida sem travar o editor
- preview publico abre
- item visivel na listagem publica e na pagina individual

Problemas comuns:
- slug vazio ou duplicado
- resumo ausente na publicacao
- fonte ausente para tipos que exigem esse campo
- imagem associada sem `alt_text`
- item publicado mas nao encontrado em `/acervo`

Como registrar bug:
- informar rota (`/admin/acervo/novo` ou `/admin/acervo/:id`)
- titulo e slug usados
- tipo escolhido
- status em que a falha ocorreu
- URL publica esperada
- se apareceu em `/acervo` e se abriu em `/acervo/item/:slug`

## 3. Criar artigo cientifico

Objetivo:
- validar o fluxo editorial de artigo cientifico no Acervo com metadados bibliograficos minimos, rascunho, publicacao e abertura no portal.

Dados minimos obrigatorios:
- titulo
- resumo
- autores
- ano ou data original
- DOI ou link externo
- tags
- PDF ou link associado

Passo a passo:
1. Abrir `/admin/acervo/artigos/novo` se o fluxo do wizard estiver sendo usado pela equipe; se a operacao estiver centralizada no editor normal, usar `/admin/acervo/novo` com tipo `Artigo Cientifico`.
2. Preencher `Titulo`.
3. Preencher `Resumo`.
4. Informar `Autor(es)`.
5. Informar `Ano` ou `Data Original`.
6. Preencher `DOI` ou `Link Externo` no campo aplicavel do fluxo usado pela equipe.
7. Preencher `Tags`.
8. Anexar PDF ou associar link.
9. Salvar como rascunho.
10. Revisar e publicar.
11. Abrir no portal pelo preview ou link publico.

Resultado esperado:
- artigo salvo como rascunho
- artigo publicado sem erro
- link publico abre corretamente
- metadados principais aparecem de forma coerente no portal

Problemas comuns:
- dados bibliograficos incompletos
- PDF nao anexado quando o fluxo exige documento
- link externo invalido
- slug divergente do padrao esperado

Como registrar bug:
- informar qual fluxo foi usado (`wizard` ou editor padrao)
- titulo, slug e autores
- se houve PDF, link ou ambos
- etapa exata da falha
- URL publica gerada

## 4. Criar Relatorio

Objetivo:
- validar upload/associacao de PDF, criacao de relatorio em rascunho, publicacao e abertura em `/relatorios/:slug`.

Dados minimos obrigatorios:
- titulo
- slug
- resumo
- tipo do documento
- ano
- PDF
- tags

Passo a passo:
1. Se o PDF ainda nao estiver em `media_assets`, subir o arquivo em `/admin/uploads` ou usar upload rapido no editor.
2. Abrir `/admin/relatorios/novo`.
3. Preencher `Titulo do Documento`.
4. Ajustar `Slug da URL`.
5. Preencher `Resumo`.
6. Selecionar o `Tipo de Documento`.
7. Confirmar `Ano`.
8. Associar o PDF.
9. Definir `Status Editorial = Rascunho` e salvar.
10. Reabrir o relatorio em `/admin/relatorios/:id`.
11. Publicar.
12. Abrir `/relatorios/:slug`.

Resultado esperado:
- rascunho salvo com PDF associado
- publicacao concluida
- pagina publica do relatorio abre com o slug correto

Problemas comuns:
- tentativa de publicar sem PDF
- slug vazio ou duplicado
- tipo/kind incoerente
- relatorio salvo mas nao encontrado na rota publica

Como registrar bug:
- informar rota (`/admin/relatorios/novo` ou `/admin/relatorios/:id`)
- titulo e slug usados
- nome do PDF utilizado
- status antes da falha
- resultado ao abrir `/relatorios/:slug`

## 5. Criar post de Blog

Objetivo:
- validar criacao de materia com capa, preview markdown, publicacao e abertura da rota `/blog/:slug`.

Dados minimos obrigatorios:
- titulo
- resumo
- corpo em Markdown
- categoria
- slug
- imagem de capa com `alt_text`
- tags

Passo a passo:
1. Abrir `/admin/blog/novo`.
2. Preencher `Titulo da Noticia`.
3. Preencher `Resumo (Lide)`.
4. Escrever `Conteudo Markdown`.
5. Selecionar `Categoria`.
6. Ajustar `Slug Personalizado` se necessario.
7. Associar uma imagem de capa valida.
8. Acionar `Ver Preview` para revisar o markdown.
9. Salvar como rascunho.
10. Publicar.
11. Abrir `/blog/:slug`.

Resultado esperado:
- preview markdown renderiza sem quebrar o editor
- rascunho salva normalmente
- publicacao conclui sem erro
- post abre no portal com slug correto

Problemas comuns:
- resumo ou corpo vazios na hora de publicar
- capa sem `alt_text`
- imagem de capa nao associada corretamente
- anexo PDF aparecendo de forma inesperada no markdown

Como registrar bug:
- informar rota (`/admin/blog/novo` ou `/admin/blog/:id`)
- titulo e slug usados
- categoria escolhida
- se o preview funcionou
- URL publica final

## Checklist final da rodada

- [ ] upload funciona?
- [ ] item aparece no publico?
- [ ] link publico abre?
- [ ] validacao funciona?
- [ ] `alt_text` foi exigido?
- [ ] relatorio sem PDF e bloqueado?
- [ ] `npm run done` continua passando?

## Template de checklist para execucao

```md
# Rodada de Producao Assistida - Admin SEMEAR

Data:
Responsavel:
Ambiente:

## 1. Upload de imagem
- Status:
- Asset criado:
- URL copiada:
- Apareceu em uploads recentes:
- Observacoes:

## 2. Item do Acervo
- Status:
- Titulo:
- Slug:
- Salvou draft:
- Publicou:
- Aparece em /acervo:
- Abre em /acervo/item/:slug:
- Observacoes:

## 3. Artigo cientifico
- Status:
- Titulo:
- Slug:
- Salvou draft:
- Publicou:
- PDF ou link associado:
- Abre no portal:
- Observacoes:

## 4. Relatorio
- Status:
- Titulo:
- Slug:
- PDF associado:
- Salvou draft:
- Publicou:
- Abre em /relatorios/:slug:
- Observacoes:

## 5. Post de Blog
- Status:
- Titulo:
- Slug:
- Preview markdown ok:
- Capa associada:
- Publicou:
- Abre em /blog/:slug:
- Observacoes:

## Checklist final
- [ ] upload funciona
- [ ] item aparece no publico
- [ ] link publico abre
- [ ] validacao funciona
- [ ] alt_text foi exigido
- [ ] relatorio sem PDF e bloqueado
- [ ] npm run done continua passando

## Bugs encontrados
- Bug 1:
- Bug 2:
```

## Como registrar bug

Sempre registrar:
1. rota exata onde a falha ocorreu
2. titulo e slug do conteudo testado
3. horario aproximado
4. resultado esperado
5. resultado observado
6. mensagem de erro em tela, se houver
7. URL publica testada, quando aplicavel
8. captura de tela, se disponivel

Se a falha impedir validacao posterior da rodada, marcar o teste como `bloqueado` e nao mascarar o problema com edicao direta em banco.