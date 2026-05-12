-- Migration: Blog Admin Refactor
-- Description: Alinhamento da tabela blog_posts para gestão administrativa e agendamento.

-- 1. Renomeação de colunas existentes
do $$
begin
  if exists (select 1 from information_schema.columns where table_name='blog_posts' and column_name='excerpt') then
    alter table public.blog_posts rename column excerpt to summary;
  end if;
end $$;

-- 2. Adição de novas colunas
alter table public.blog_posts
  add column if not exists cover_asset_id  uuid references public.media_assets(id) on delete set null,
  add column if not exists category        text,
  add column if not exists publish_at      timestamptz,
  add column if not exists author_name     text;

-- 3. Atualização do check constraint de status
alter table public.blog_posts drop constraint if exists blog_posts_status_check;
alter table public.blog_posts 
  add constraint blog_posts_status_check 
  check (status in ('draft', 'scheduled', 'published', 'archived'));

-- 4. Atualização das Políticas de RLS
drop policy if exists blog_posts_select_public on public.blog_posts;
create policy blog_posts_select_public
  on public.blog_posts
  for select
  to anon, authenticated
  using (
    (status = 'published' and (publish_at is null or publish_at <= now()))
    or public.is_admin()
  );

drop policy if exists blog_posts_all_editors on public.blog_posts;
create policy blog_posts_admin_all
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Comentários
comment on table public.blog_posts is 'Matérias e notícias do portal com suporte a agendamento e curadoria.';
