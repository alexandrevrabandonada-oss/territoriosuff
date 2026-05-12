-- Migration: Acervo Papers Flow
-- Description: Adição de suporte especializado para artigos científicos (Papers).

-- 1. Coluna de Relevância
alter table public.acervo_items
  add column if not exists relevance_level text check (relevance_level in ('referencia central', 'complementar', 'historico', 'tecnico'));

-- 2. Índice único parcial para DOI (evitar duplicidade de artigos)
create unique index if not exists ux_acervo_doi 
  on public.acervo_items (doi) 
  where doi is not null and doi <> '';

-- 3. Comentários
comment on column public.acervo_items.relevance_level is 'Nível de relevância científica do item.';
