-- Migration: Admin Base
-- Description: Criação da infraestrutura para o painel administrativo do SEMEAR.

-- 1. Tabela de Administradores
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- Habilitar RLS
alter table public.admin_users enable row level security;

-- 2. Função para verificar se o usuário é admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 3. Políticas de RLS para admin_users
-- Apenas admins podem ver a lista de admins
drop policy if exists admin_users_select_admin on public.admin_users;
create policy admin_users_select_admin
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin() or auth.uid() = id);

-- 4. Permissões de tabelas existentes (Exemplo: permitir que admins editem tudo)
-- Nota: Isso deve ser expandido para cada tabela conforme necessário.
-- Por enquanto, garantimos que a tabela admin_users seja acessível para leitura do próprio usuário.

grant select on table public.admin_users to authenticated;

-- 5. Comentários
comment on table public.admin_users is 'Lista de usuários com permissão de acesso ao Painel Administrativo.';
comment on function public.is_admin is 'Verifica se o usuário autenticado atual é um administrador.';
