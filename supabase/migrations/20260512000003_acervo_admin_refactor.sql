-- Migration: Acervo Admin Refactor
-- Description: Alinhamento da tabela acervo_items para gestão administrativa e novos requisitos de conteúdo.

-- 1. Renomeação de colunas existentes (se existirem)
do $$
begin
  if exists (select 1 from information_schema.columns where table_name='acervo_items' and column_name='kind') then
    alter table public.acervo_items rename column kind to type;
  end if;
  
  if exists (select 1 from information_schema.columns where table_name='acervo_items' and column_name='excerpt') then
    alter table public.acervo_items rename column excerpt to summary;
  end if;
end $$;

-- 2. Adição de novas colunas
alter table public.acervo_items
  add column if not exists status                text not null default 'published' check (status in ('draft', 'scheduled', 'published', 'archived')),
  add column if not exists publish_at             timestamptz,
  add column if not exists cover_asset_id         uuid references public.media_assets(id) on delete set null,
  add column if not exists related_collection_id  uuid references public.acervo_collections(id) on delete set null;

-- 3. Ajuste do check constraint para 'type'
alter table public.acervo_items drop constraint if exists acervo_items_kind_check;
alter table public.acervo_items drop constraint if exists acervo_items_type_check;

alter table public.acervo_items
  add constraint acervo_items_type_check 
  check (type in ('artigo_cientifico', 'noticia', 'materia', 'foto', 'video', 'documento', 'relatorio_tecnico', 'memoria', 'outro', 'paper', 'news', 'report', 'link'));

-- Mapeamento de tipos antigos para novos (opcional, mas bom para consistência)
update public.acervo_items set type = 'artigo_cientifico' where type = 'paper';
update public.acervo_items set type = 'noticia' where type = 'news';
update public.acervo_items set type = 'relatorio_tecnico' where type = 'report';
update public.acervo_items set type = 'outro' where type = 'link';

-- 4. Atualização das Políticas de RLS
drop policy if exists acervo_items_select_public on public.acervo_items;
create policy acervo_items_select_public
  on public.acervo_items
  for select
  to anon, authenticated
  using (
    (status = 'published' and (publish_at is null or publish_at <= now()))
    or public.is_admin()
  );

drop policy if exists acervo_items_write_editors on public.acervo_items;
create policy acervo_items_admin_all
  on public.acervo_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Atualização do search_vec (Generated Column)
alter table public.acervo_items drop column if exists search_vec;
alter table public.acervo_items
  add column search_vec tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(authors, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'D')
  ) stored;

create index if not exists idx_acervo_search_vec 
  on public.acervo_items using gin (search_vec);

-- 6. Comentários
comment on column public.acervo_items.status is 'Estado do item no fluxo editorial (draft, scheduled, published, archived).';
comment on column public.acervo_items.publish_at is 'Data e hora para publicação automática (agendamento).';
