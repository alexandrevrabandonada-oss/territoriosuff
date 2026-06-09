# Estado da Nação — Automação de Preservação de Imprensa

Data: 2026-06-08

## Objetivo

Desenhar a próxima etapa operacional da preservação de notícias e matérias sem ativar ainda nenhuma automação real.

Foco:

1. revisão periódica de capturas antigas
2. revisão periódica de itens preservados sem snapshot HTML
3. rotina editorial mínima para fechamento de pendências

## Situação atual

O admin já possui:

- fila dedicada em `/admin/acervo/imprensa`
- filtros persistidos na URL
- leitura de backlog
- leitura de capturas antigas
- leitura de itens preservados sem snapshot
- status editorial da preservação
- recaptura assistida e recaptura rápida
- exportação CSV total e filtrada
- resumo no dashboard principal

Isso significa que a automação futura não precisa decidir a regra de negócio.
Ela só precisa executar uma rotina de vigilância e devolver uma lista curta de ação.

## Automação 1 — Revisão semanal de capturas antigas

### Frequência recomendada

- semanal
- segunda-feira, início da manhã

### Filtro-base

- `/admin/acervo/imprensa?queue=stale`

### Critério

- itens com última captura acima de 30 dias

### Saída esperada

- contagem total
- top 10 itens mais antigos
- quantos também estão com `editorial=pending_review`
- quantos já têm snapshot e quantos não têm

### Ação humana posterior

- abrir os 3 primeiros para recaptura
- revisar se houve alteração relevante no texto
- fechar status editorial quando apropriado

## Automação 2 — Revisão semanal de preservadas sem snapshot

### Frequência recomendada

- semanal
- quarta-feira

### Filtro-base

- `/admin/acervo/imprensa?queue=preserved_without_snapshot`

### Critério

- item preservado em Markdown, mas sem HTML bruto salvo

### Saída esperada

- contagem total
- lista curta com:
  - título
  - fonte
  - data da última captura
  - status editorial

### Ação humana posterior

- recapturar quando a origem ainda estiver acessível
- avaliar se o snapshot é realmente recuperável
- marcar como `ready` apenas quando o caso estiver suficientemente estável

## Automação 3 — Revisão editorial de fechamento

### Frequência recomendada

- quinzenal

### Filtro-base

- `/admin/acervo/imprensa?editorial=pending_review`

### Critério

- item ainda não marcado como preservação fechada

### Saída esperada

- quantos itens seguem pendentes
- quantos estão pendentes apesar de já terem:
  - captura
  - snapshot
  - link original

### Ação humana posterior

- validar texto preservado
- validar contexto editorial
- fechar como `ready` ou marcar `needs_recapture`

## Ordem recomendada de implantação

1. ativar monitor de `queue=stale`
2. ativar monitor de `queue=preserved_without_snapshot`
3. ativar monitor editorial de `pending_review`

Razão:

- `stale` afeta atualização do acervo
- `preserved_without_snapshot` afeta robustez arquivística
- `pending_review` afeta governança editorial

## Formato mínimo de saída da automação

Cada rodada deve devolver:

- data/hora da verificação
- nome da fila
- total encontrado
- links já filtrados para ação direta
- top itens que exigem atenção

## Não fazer ainda

- recaptura automática em massa no backend
- alteração automática de status editorial
- substituição automática de texto preservado sem revisão humana

## Próximo passo recomendado

Quando for ativar de fato, a primeira automação deve monitorar:

- `/admin/acervo/imprensa?queue=stale&sort=capture_age`

e produzir um relatório curto com os 10 casos mais antigos.
