-- Migration: Environmental Reports
-- Description: Criação da tabela de relatos ambientais dos cidadãos, bucket de anexo e políticas de segurança RLS correspondentes.

-- 1. Criação da tabela
create table if not exists public.environmental_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_name text not null,
  reporter_email text,
  reporter_phone text,
  category text not null,
  description text not null,
  location text not null,
  image_url text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS
alter table public.environmental_reports enable row level security;

-- 2. Políticas de segurança (RLS) para a tabela de relatos
-- Permitir que qualquer pessoa envie um relato (anon ou autenticado)
drop policy if exists environmental_reports_insert_public on public.environmental_reports;
create policy environmental_reports_insert_public
  on public.environmental_reports
  for insert
  to anon, authenticated
  with check (true);

-- Apenas administradores podem ler relatos
drop policy if exists environmental_reports_select_admin on public.environmental_reports;
create policy environmental_reports_select_admin
  on public.environmental_reports
  for select
  to authenticated
  using (public.is_admin());

-- Apenas administradores podem atualizar relatos
drop policy if exists environmental_reports_update_admin on public.environmental_reports;
create policy environmental_reports_update_admin
  on public.environmental_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Apenas administradores podem deletar relatos
drop policy if exists environmental_reports_delete_admin on public.environmental_reports;
create policy environmental_reports_delete_admin
  on public.environmental_reports
  for delete
  to authenticated
  using (public.is_admin());

-- Dar permissões
grant insert on table public.environmental_reports to anon, authenticated;
grant select, insert, update, delete on table public.environmental_reports to authenticated;

-- 3. Índices para performance
create index if not exists idx_environmental_reports_created_at
  on public.environmental_reports (created_at desc);

create index if not exists idx_environmental_reports_status
  on public.environmental_reports (status);

-- 4. Trigger para set_updated_at()
-- Nota: A função public.set_updated_at() já existe da migração admin_uploads
drop trigger if exists tr_environmental_reports_updated_at on public.environmental_reports;
create trigger tr_environmental_reports_updated_at
  before update on public.environmental_reports
  for each row execute function public.set_updated_at();

-- 5. Bucket de Storage para imagens dos relatos
insert into storage.buckets (id, name, public)
values ('environmental_reports', 'environmental_reports', true)
on conflict (id) do update set public = true;

-- Políticas de Storage para o bucket environmental_reports
-- Permitir select público para imagens do bucket
drop policy if exists environmental_reports_storage_select_public on storage.objects;
create policy environmental_reports_storage_select_public
  on storage.objects
  for select
  to public
  using (bucket_id = 'environmental_reports');

-- Permitir insert público (anon/auth) para imagens no bucket
drop policy if exists environmental_reports_storage_insert_public on storage.objects;
create policy environmental_reports_storage_insert_public
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'environmental_reports');

-- Permitir update para admins
drop policy if exists environmental_reports_storage_update_admin on storage.objects;
create policy environmental_reports_storage_update_admin
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'environmental_reports' and public.is_admin())
  with check (bucket_id = 'environmental_reports' and public.is_admin());

-- Permitir delete para admins
drop policy if exists environmental_reports_storage_delete_admin on storage.objects;
create policy environmental_reports_storage_delete_admin
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'environmental_reports' and public.is_admin());

-- Comentários
comment on table public.environmental_reports is 'Relatos ambientais enviados pelos cidadãos pelo portal.';
