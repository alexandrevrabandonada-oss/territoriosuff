-- Aurassure/UFF staging: typed aggregate measurements, private while metrology is unverified.
create table if not exists public.aurassure_measurements_staging (
  station_id integer not null check (station_id in (46560, 46561, 46562)),
  measured_at timestamptz not null,
  aggregation_period_seconds integer not null check (aggregation_period_seconds in (900, 3600, 86400)),
  pm1 numeric,
  pm25 numeric,
  pm10 numeric,
  no2 numeric,
  so2 numeric,
  co numeric,
  o3 numeric,
  co2 numeric,
  temperature numeric,
  humidity numeric,
  tvoc numeric,
  provider_aqi numeric,
  provider_values jsonb not null,
  source_snapshot_id uuid not null references public.aurassure_api_snapshots(id) on delete restrict,
  source_fetched_at timestamptz not null,
  qa_status text not null default 'pending_units_calibration_and_methodology',
  qa_flags text[] not null default '{}',
  first_imported_at timestamptz not null default now(),
  last_imported_at timestamptz not null default now(),
  primary key (station_id, measured_at, aggregation_period_seconds)
);
create index if not exists aurassure_staging_measurement_time_idx
on public.aurassure_measurements_staging(measured_at desc);
alter table public.aurassure_measurements_staging enable row level security;
revoke all on public.aurassure_measurements_staging from public, anon, authenticated;
grant select, insert, update on public.aurassure_measurements_staging to service_role;

create schema if not exists aurassure_internal;
revoke all on schema aurassure_internal from public, anon, authenticated;
grant usage on schema aurassure_internal to service_role;

create or replace function aurassure_internal.refresh_measurements_staging()
returns integer language plpgsql security invoker set search_path = ''
as $function$
declare changed integer;
begin
  with snapshot_rows as (
    select
      s.id as snapshot_id,
      s.fetched_at,
      (s.request_meta->>'aggregation_period')::integer as period_seconds,
      e.item
    from public.aurassure_api_snapshots s
    cross join lateral jsonb_array_elements(s.response_json->'data') as e(item)
    where s.operation='readings'
      and s.request_meta->>'data_type'='aggregate'
      and s.response_json->>'status'='success'
      and (s.request_meta->>'aggregation_period')::integer in (900, 3600, 86400)
      and s.fetched_at >= coalesce(
        (select max(t.source_fetched_at) from public.aurassure_measurements_staging t),
        '-infinity'::timestamptz
      )
  ), normalized as (
    select
      (item->>'thing_id')::integer as station_id,
      to_timestamp((item->>'time')::bigint) as measured_at,
      period_seconds as aggregation_period_seconds,
      (item->'parameter_values'->'pm1.0'->>'avg')::numeric as pm1,
      (item->'parameter_values'->'pm2.5'->>'avg')::numeric as pm25,
      (item->'parameter_values'->'pm10'->>'avg')::numeric as pm10,
      (item->'parameter_values'->'no2'->>'avg')::numeric as no2,
      (item->'parameter_values'->'so2'->>'avg')::numeric as so2,
      (item->'parameter_values'->'co'->>'avg')::numeric as co,
      (item->'parameter_values'->'o3'->>'avg')::numeric as o3,
      (item->'parameter_values'->'co2'->>'avg')::numeric as co2,
      (item->'parameter_values'->'temp'->>'avg')::numeric as temperature,
      (item->'parameter_values'->'humid'->>'avg')::numeric as humidity,
      (item->'parameter_values'->'tvoc'->>'avg')::numeric as tvoc,
      (item->'parameter_values'->'aqi'->>'value')::numeric as provider_aqi,
      coalesce(item->'parameter_values','{}'::jsonb) as provider_values,
      snapshot_id as source_snapshot_id,
      fetched_at as source_fetched_at,
      array_remove(array[
        case when item->'parameter_values'->'pm2.5'->>'avg' is null then 'missing_pm25' end,
        case when item->'parameter_values'->'pm10'->>'avg' is null then 'missing_pm10' end,
        case when item->'parameter_values'->'aqi'->>'value' is null then 'provider_aqi_missing' end,
        case when item->'parameter_values'->'pm1.0'->>'avg' is null then 'provider_pm1_missing' end
      ],null)::text[] as qa_flags
    from snapshot_rows
    where (item->>'thing_id')::integer in (46560,46561,46562)
      and item->>'time' is not null
  ), deduped as (
    select distinct on (station_id, measured_at, aggregation_period_seconds)
      *
    from normalized
    order by station_id, measured_at, aggregation_period_seconds, source_fetched_at desc, source_snapshot_id desc
  ), changed_rows as (
    insert into public.aurassure_measurements_staging as t (
      station_id, measured_at, aggregation_period_seconds, pm1, pm25, pm10, no2, so2, co, o3,
      co2, temperature, humidity, tvoc, provider_aqi, provider_values, source_snapshot_id,
      source_fetched_at, qa_flags
    )
    select
      station_id, measured_at, aggregation_period_seconds, pm1, pm25, pm10, no2, so2, co, o3,
      co2, temperature, humidity, tvoc, provider_aqi, provider_values, source_snapshot_id,
      source_fetched_at, qa_flags
    from deduped
    on conflict (station_id, measured_at, aggregation_period_seconds)
    do update set
      pm1=excluded.pm1, pm25=excluded.pm25, pm10=excluded.pm10, no2=excluded.no2,
      so2=excluded.so2, co=excluded.co, o3=excluded.o3, co2=excluded.co2,
      temperature=excluded.temperature, humidity=excluded.humidity, tvoc=excluded.tvoc,
      provider_aqi=excluded.provider_aqi, provider_values=excluded.provider_values,
      source_snapshot_id=excluded.source_snapshot_id, source_fetched_at=excluded.source_fetched_at,
      qa_flags=excluded.qa_flags, last_imported_at=now()
    where excluded.source_fetched_at > t.source_fetched_at
    returning 1
  )
  select count(*)::integer into changed from changed_rows;
  return changed;
end;
$function$;
revoke all on function aurassure_internal.refresh_measurements_staging() from public, anon, authenticated;
grant execute on function aurassure_internal.refresh_measurements_staging() to service_role;
