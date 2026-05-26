-- Migration: INEA Air Quality Tables
-- Description: Criação das tabelas para estações do INEA, medições e logs de ingestão.

-- 1. Tabela de Estações (air_stations)
create table if not exists public.air_stations (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_system text,
  external_id text,
  code text,
  name text not null,
  city text,
  neighborhood text,
  lat double precision,
  lng double precision,
  active boolean default true,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.air_stations enable row level security;

-- Unique constraint para o código ou ID externo da estação do INEA
create unique index if not exists ux_air_stations_source_code
  on public.air_stations (source, coalesce(code, external_id));

-- Trigger para updated_at
drop trigger if exists tr_air_stations_updated_at on public.air_stations;
create trigger tr_air_stations_updated_at
  before update on public.air_stations
  for each row execute function public.set_updated_at();


-- 2. Tabela de Medições (air_measurements)
create table if not exists public.air_measurements (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.air_stations(id) on delete cascade,
  source text not null,
  source_system text,
  pollutant text not null,
  value double precision not null,
  unit text,
  measured_at timestamptz not null,
  averaging_period text,
  quality_flag text,
  raw_json jsonb,
  ingested_at timestamptz default now()
);

-- Habilitar RLS
alter table public.air_measurements enable row level security;

-- Índice único composto defensivo (evitar duplicatas)
create unique index if not exists ux_air_measurements_prevent_duplicates
  on public.air_measurements (station_id, pollutant, measured_at, coalesce(averaging_period, ''));

-- Índice para performance de consultas
create index if not exists idx_air_measurements_station_pollutant_ts
  on public.air_measurements (station_id, pollutant, measured_at desc);

create index if not exists idx_air_measurements_measured_at
  on public.air_measurements (measured_at desc);


-- 3. Tabela de Histórico de Ingestão (air_ingest_runs)
create table if not exists public.air_ingest_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_system text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text not null,
  rows_read integer default 0,
  rows_inserted integer default 0,
  rows_updated integer default 0,
  error_message text,
  report_json jsonb
);

-- Habilitar RLS
alter table public.air_ingest_runs enable row level security;

-- Índice para histórico
create index if not exists idx_air_ingest_runs_started_at
  on public.air_ingest_runs (started_at desc);


-- 4. Políticas de Segurança RLS
-- air_stations
drop policy if exists air_stations_select_public on public.air_stations;
create policy air_stations_select_public
  on public.air_stations
  for select
  to anon, authenticated
  using (true);

drop policy if exists air_stations_all_admin on public.air_stations;
create policy air_stations_all_admin
  on public.air_stations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- air_measurements
drop policy if exists air_measurements_select_public on public.air_measurements;
create policy air_measurements_select_public
  on public.air_measurements
  for select
  to anon, authenticated
  using (true);

drop policy if exists air_measurements_all_admin on public.air_measurements;
create policy air_measurements_all_admin
  on public.air_measurements
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- air_ingest_runs
drop policy if exists air_ingest_runs_select_admin on public.air_ingest_runs;
create policy air_ingest_runs_select_admin
  on public.air_ingest_runs
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists air_ingest_runs_all_admin on public.air_ingest_runs;
create policy air_ingest_runs_all_admin
  on public.air_ingest_runs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- 5. Grants de Permissões
grant select on table public.air_stations to anon, authenticated;
grant select on table public.air_measurements to anon, authenticated;

grant select, insert, update, delete on table public.air_stations to authenticated;
grant select, insert, update, delete on table public.air_measurements to authenticated;
grant select, insert, update, delete on table public.air_ingest_runs to authenticated;

-- Comentários descritivos
comment on table public.air_stations is 'Estações oficiais de monitoramento da qualidade do ar (ex. INEA).';
comment on table public.air_measurements is 'Medições históricas de qualidade do ar coletadas de fontes oficiais.';
comment on table public.air_ingest_runs is 'Histórico e logs das rodadas de ingestão de dados de qualidade do ar.';
