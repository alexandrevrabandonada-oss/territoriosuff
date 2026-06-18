create or replace function public.get_inea_freshness()
returns table (
  source_system text,
  data_freshness_label text,
  latest_measured_at timestamptz,
  latest_ingested_at timestamptz,
  is_realtime boolean
)
language sql
stable
set search_path = public
as $$
  with measurement_freshness as (
    select
      max(measured_at) as latest_measured_at,
      max(ingested_at) as latest_measurement_ingested_at
    from public.air_measurements
    where source = 'INEA'
  ),
  run_freshness as (
    select
      max(finished_at) as latest_run_finished_at
    from public.air_ingest_runs
    where source = 'INEA'
      and status = 'success'
  )
  select
    'CKAN_XLSX'::text as source_system,
    'Última base pública disponível'::text as data_freshness_label,
    mf.latest_measured_at,
    greatest(mf.latest_measurement_ingested_at, rf.latest_run_finished_at) as latest_ingested_at,
    false as is_realtime
  from measurement_freshness mf
  cross join run_freshness rf;
$$;

grant execute on function public.get_inea_freshness() to anon, authenticated, service_role;

comment on function public.get_inea_freshness() is 'Fonte única de metadata de frescor da base INEA integrada ao Radar: última medição pública, última ingestão e regime de atualização.';

create or replace function public.get_inea_summary()
returns table (
  total_stations integer,
  total_measurements bigint,
  min_date timestamptz,
  max_date timestamptz,
  moderate_or_worse_days_count integer,
  most_frequent_controlling_pollutant text,
  source_system text,
  data_freshness_label text,
  latest_measured_at timestamptz,
  latest_ingested_at timestamptz,
  is_realtime boolean
)
language sql
stable
set search_path = public
as $$
  with station_count as (
    select count(*)::integer as total_stations
    from public.air_stations
    where source = 'INEA'
  ),
  measurement_stats as (
    select
      count(*)::bigint as total_measurements,
      min(measured_at) as min_date,
      max(measured_at) as max_date
    from public.air_measurements
    where source = 'INEA'
  ),
  daily_flags as (
    select measured_date
    from public.get_inea_daily_aqi()
    where worst_classification in ('MODERADA', 'RUIM', 'MUITO RUIM', 'PÉSSIMA')
    group by measured_date
  ),
  controller_counts as (
    select
      upper(trim(controlling_pollutant)) as pollutant,
      count(*) as total
    from public.air_measurements
    where source = 'INEA'
      and metric_type = 'GENERAL_AQI'
      and controlling_pollutant is not null
    group by upper(trim(controlling_pollutant))
  ),
  freshness as (
    select * from public.get_inea_freshness()
  )
  select
    sc.total_stations,
    ms.total_measurements,
    ms.min_date,
    ms.max_date,
    (select count(*)::integer from daily_flags),
    coalesce((select pollutant from controller_counts order by total desc, pollutant asc limit 1), '-') as most_frequent_controlling_pollutant,
    f.source_system,
    f.data_freshness_label,
    coalesce(f.latest_measured_at, ms.max_date) as latest_measured_at,
    f.latest_ingested_at,
    f.is_realtime
  from station_count sc
  cross join measurement_stats ms
  cross join freshness f;
$$;

comment on function public.get_inea_summary() is 'Resumo principal do Radar INEA, incluindo contagem, período, dias degradados e metadata de frescor derivada de get_inea_freshness().';
