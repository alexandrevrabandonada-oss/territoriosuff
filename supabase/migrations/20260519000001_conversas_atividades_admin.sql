-- Admin support for "Conversas e atividades".
-- Activities reuse conversations so the portal keeps one public section and the
-- admin can publish Instagram-backed field records without creating a new table.

alter table public.conversations
  add column if not exists meta jsonb default '{}'::jsonb;

drop policy if exists conversations_select_public on public.conversations;
drop policy if exists "Público pode ver conversas publicadas" on public.conversations;

create policy conversations_select_public
  on public.conversations
  for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists conversations_admin_insert on public.conversations;
drop policy if exists conversations_admin_update on public.conversations;
drop policy if exists conversations_admin_delete on public.conversations;

create policy conversations_admin_insert
  on public.conversations
  for insert
  to authenticated
  with check (public.is_admin());

create policy conversations_admin_update
  on public.conversations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy conversations_admin_delete
  on public.conversations
  for delete
  to authenticated
  using (public.is_admin());

grant select on table public.conversations to anon;
grant select, insert, update, delete on table public.conversations to authenticated;

create index if not exists idx_conversations_meta_kind
  on public.conversations ((meta->>'kind'));
