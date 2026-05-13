-- Migration: Reports Admin Refactor
-- Description: Atualiza a tabela reports para suporte administrativo completo e integração com media_assets.

-- 1. Adicionar novas colunas
alter table public.reports 
add column if not exists type text not null default 'relatorio' check (type in ('relatorio', 'nota técnica', 'boletim', 'anexo')),
add column if not exists status text not null default 'published' check (status in ('draft', 'published', 'archived')),
add column if not exists featured boolean not null default false,
add column if not exists pdf_asset_id uuid references public.media_assets(id) on delete set null,
add column if not exists cover_asset_id uuid references public.media_assets(id) on delete set null,
add column if not exists updated_at timestamptz not null default now();

-- 2. Atualizar RLS para Administradores
-- A política de select já existe e permite acesso público (reports_select_public).
-- Precisamos de políticas para insert/update/delete baseadas em is_admin().

drop policy if exists reports_admin_insert on public.reports;
create policy reports_admin_insert 
  on public.reports for insert 
  to authenticated 
  with check (public.is_admin());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update 
  on public.reports for update 
  to authenticated 
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists reports_admin_delete on public.reports;
create policy reports_admin_delete 
  on public.reports for delete 
  to authenticated 
  using (public.is_admin());

-- 3. Garantir permissões de escrita para usuários autenticados (com RLS controlando o acesso admin)
grant insert, update, delete on table public.reports to authenticated;

-- 4. Trigger para updated_at
drop trigger if exists tr_reports_updated_at on public.reports;
create trigger tr_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- 5. Comentários
comment on column public.reports.type is 'Tipo do documento: relatório, nota técnica, boletim ou anexo.';
comment on column public.reports.featured is 'Se verdadeiro, o relatório ganha destaque na interface pública.';
comment on column public.reports.pdf_asset_id is 'Vínculo com o arquivo PDF original em media_assets.';
comment on column public.reports.cover_asset_id is 'Vínculo com a imagem de capa em media_assets.';
