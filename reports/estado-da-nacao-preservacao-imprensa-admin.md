# Estado da Nação — Preservação de Imprensa no Admin

Data: 2026-06-08

## Escopo desta rodada

Evolução operacional do fluxo de preservação de notícias e matérias no admin, sem alterar schema, APIs públicas, datasets ou lógica editorial sensível.

## O que foi consolidado

### 1. Captura e preservação no editor

- campo de link original no editor do acervo para `noticia` e `materia`
- captura server-side da matéria por URL
- armazenamento da cópia preservada em Markdown no próprio item
- snapshot HTML bruto quando disponível
- histórico de capturas no `meta`
- revisão antes de substituir texto preservado existente

### 2. Governança da fila de imprensa

Página dedicada:

- `/admin/acervo/imprensa`

Capacidades atuais:

- KPIs de preservação
- leitura de backlog
- leitura de capturas antigas
- leitura de itens preservados sem snapshot
- cobertura de preservação:
  - com link
  - com captura
  - com snapshot
  - com revisão fechada
- gargalos da fila:
  - sem link
  - sem captura
  - sem snapshot
  - revisão pendente

### 3. Filtros e triagem

Filtros operacionais:

- fila
- prioridade
- idade da captura
- status editorial

Persistência na URL:

- `queue`
- `priority`
- `age`
- `editorial`

Isso permite recarregar a página sem perder o recorte e compartilhar links internos de triagem.

### 4. Ações rápidas

- abrir próximo pendente
- abrir 3 primeiros para recaptura
- recaptura automática no editor via `?autocapture=1`
- limpar filtros

### 5. Exportação

Downloads CSV disponíveis:

- total bruto da fila
- recorte filtrado atualmente visível

Campos exportados:

- id
- título
- slug
- tipo
- status de publicação
- estado de preservação
- prioridade
- status editorial
- presença de link
- presença de captura
- presença de snapshot
- última captura
- idade da captura em dias
- fonte
- URL de origem

## Decisões de desenho

- sem migration nova nesta etapa
- persistência de status editorial em `meta.editorial_preservation_status`
- sem fila assíncrona nova para recaptura
- sem automação em lote no backend nesta etapa

## Ganho operacional

Antes:

- fluxo disperso entre lista e editor
- pouca visibilidade sobre o que faltava para uma preservação robusta
- recaptura manual item por item

Agora:

- fila dedicada para imprensa
- leitura clara de cobertura e gargalos
- recorte persistente por URL
- recaptura acelerada
- exportação para acompanhamento e auditoria

## Próximas etapas recomendadas

1. Ordenação manual da fila por prioridade, idade da captura e título.
2. Exportação com carimbo temporal no nome do arquivo.
3. Relatório periódico automatizado da fila de imprensa.
4. Eventual recaptura em lote controlada no backend, se o volume justificar.
