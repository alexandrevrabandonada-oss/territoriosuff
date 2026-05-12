-- Migration: Agenda Admin Refactor
-- Description: Alinhamento da tabela events e registrations para gestão administrativa.

-- 1. Colunas em public.events
alter table public.events
  add column if not exists location_name       text,
  add column if not exists bairro              text,
  add column if not exists cover_asset_id      uuid references public.media_assets(id) on delete set null,
  add column if not exists registration_enabled boolean not null default true;

-- 2. Ajuste do check constraint de status
alter table public.events drop constraint if exists events_status_check;
alter table public.events 
  add constraint events_status_check 
  check (status in ('draft', 'published', 'completed', 'cancelled'));

-- 3. Políticas de RLS para events
drop policy if exists events_select_published on public.events;
create policy events_select_public
  on public.events
  for select
  to anon, authenticated
  using (
    (status = 'published' or status = 'completed')
    or public.is_admin()
  );

drop policy if exists events_admin_all on public.events;
create policy events_admin_all
  on public.events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Políticas de RLS para registrations (Inscrições)
drop policy if exists registrations_insert_public on public.registrations;
create policy registrations_insert_public
  on public.registrations
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.events
      where id = event_id and registration_enabled = true and status = 'published'
    )
  );

drop policy if exists registrations_admin_all on public.registrations;
create policy registrations_admin_all
  on public.registrations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Comentários
comment on table public.events is 'Eventos e atividades territoriais do SEMEAR.';
comment on table public.registrations is 'Inscrições de participantes em eventos.';
