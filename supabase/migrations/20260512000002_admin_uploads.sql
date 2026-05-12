-- Migration: Admin Uploads
-- Description: Criação de buckets de storage e tabela de metadados para gestão centralizada de arquivos.

-- 1. Criação dos Buckets (se não existirem)
insert into storage.buckets (id, name, public)
values 
  ('reports', 'reports', true),
  ('blog', 'blog', true),
  ('media', 'media', true),
  ('transparency', 'transparency', true),
  ('acervo', 'acervo', true)
on conflict (id) do update set public = true;

-- 2. Políticas de Storage para Administradores
-- Função is_admin() já deve existir da migration anterior.

-- Política de leitura pública para todos os buckets mencionados
do $$
declare
  b text;
  buckets_list text[] := array['reports', 'blog', 'media', 'transparency', 'acervo'];
begin
  foreach b in array buckets_list loop
    -- Select público
    execute format('drop policy if exists %I_public_select on storage.objects', b);
    execute format('create policy %I_public_select on storage.objects for select to public using (bucket_id = %L)', b, b);
    
    -- Insert para Admins
    execute format('drop policy if exists %I_admin_insert on storage.objects', b);
    execute format('create policy %I_admin_insert on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_admin())', b, b);
    
    -- Update para Admins
    execute format('drop policy if exists %I_admin_update on storage.objects', b);
    execute format('create policy %I_admin_update on storage.objects for update to authenticated using (bucket_id = %L and public.is_admin())', b, b);
    
    -- Delete para Admins
    execute format('drop policy if exists %I_admin_delete on storage.objects', b);
    execute format('create policy %I_admin_delete on storage.objects for delete to authenticated using (bucket_id = %L and public.is_admin())', b, b);
  end loop;
end $$;

-- 3. Tabela media_assets para metadados
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  title text,
  description text,
  alt_text text,
  credit text,
  source text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Garantir que imagens publicadas tenham alt_text
  constraint image_needs_alt check (
    (mime_type not like 'image/%') or 
    (status != 'published') or 
    (alt_text is not null and alt_text <> '')
  )
);

-- Habilitar RLS em media_assets
alter table public.media_assets enable row level security;

-- Políticas para media_assets
create policy "media_assets_select_public" 
  on public.media_assets for select to public using (true);

create policy "media_assets_admin_all" 
  on public.media_assets for all to authenticated 
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_media_assets_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

-- 5. Comentários
comment on table public.media_assets is 'Metadados centralizados para arquivos enviados ao Storage.';
