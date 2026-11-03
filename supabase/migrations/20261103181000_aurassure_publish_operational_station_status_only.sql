-- SEMEAR SF | Public, non-metrological station-collection status for Aurassure/UFF.
-- Exposes ONLY operational data presence, not vendor pollutant values, QA evidence, or secrets.
create table if not exists public.aurassure_public_station_status (
  station_id integer primary key check (station_id in (46560,46561,46562)),
  station_name text not null,
  neighborhood text not null,
  source_label text not null default 'Aurassure / UFF',
  last_measured_at timestamptz,
  last_capture_at timestamptz,
  last_checked_at timestamptz not null,
  readings_last_24h integer not null check(readings_last_24h between 0 and 96),
  coverage_24h_percent numeric not null check(coverage_24h_percent between 0 and 100),
  collection_status text not null check(collection_status in ('receiving','coverage_degraded','stale','no_measurements')),
  release_status text not null default 'measurements_pending_technical_review'
    check(release_status='measurements_pending_technical_review')
);
alter table public.aurassure_public_station_status enable row level security;
revoke all on public.aurassure_public_station_status from public,anon,authenticated;
grant select on public.aurassure_public_station_status to anon,authenticated;
grant select,insert,update,delete on public.aurassure_public_station_status to service_role;
drop policy if exists aurassure_station_status_public_read_only on public.aurassure_public_station_status;
create policy aurassure_station_status_public_read_only
on public.aurassure_public_station_status for select
to anon,authenticated using (true);

create or replace function aurassure_internal.refresh_public_station_status()
returns integer language plpgsql security invoker set search_path=''
as $fn$
declare affected integer;
begin
  insert into public.aurassure_public_station_status as dst (
    station_id,station_name,neighborhood,source_label,last_measured_at,last_capture_at,last_checked_at,
    readings_last_24h,coverage_24h_percent,collection_status,release_status
  )
  select
    h.station_id,
    case h.station_id when 46560 then 'UFF' when 46561 then 'IFRJ' else 'CRIAAD' end,
    case h.station_id when 46560 then 'Vila Santa Cecília'
                      when 46561 then 'Nossa Senhora das Graças'
                      else 'Vila Mury' end,
    'Aurassure / UFF',
    h.latest_measurement_at,
    (select max(s.fetched_at) from public.aurassure_api_snapshots s where s.operation='readings'),
    now(),
    least(greatest(h.readings_last_24h,0),96)::integer,
    h.coverage_24h_percent,
    h.collection_status,
    'measurements_pending_technical_review'
  from aurassure_internal.station_health h
  on conflict (station_id) do update
    set station_name=excluded.station_name,
        neighborhood=excluded.neighborhood,
        source_label=excluded.source_label,
        last_measured_at=excluded.last_measured_at,
        last_capture_at=excluded.last_capture_at,
        last_checked_at=excluded.last_checked_at,
        readings_last_24h=excluded.readings_last_24h,
        coverage_24h_percent=excluded.coverage_24h_percent,
        collection_status=excluded.collection_status,
        release_status=excluded.release_status;
  get diagnostics affected = row_count;
  return affected;
end
$fn$;
revoke all on function aurassure_internal.refresh_public_station_status() from public,anon,authenticated;
grant execute on function aurassure_internal.refresh_public_station_status() to service_role;

-- No additional scheduled job: reuses the already-proven 15-minute health cycle.
create or replace function aurassure_internal.process_quality_cycle()
returns jsonb language plpgsql security invoker set search_path=''
as $fn$
declare health_rows integer; review_rows integer; public_station_rows integer;
begin
  health_rows := aurassure_internal.record_station_health();
  review_rows := aurassure_internal.flag_post_gap_30m_reviews();
  public_station_rows := aurassure_internal.refresh_public_station_status();
  return jsonb_build_object(
    'station_health_snapshots',health_rows,
    'new_qa_flags',review_rows,
    'public_station_status_rows',public_station_rows
  );
end
$fn$;
revoke all on function aurassure_internal.process_quality_cycle() from public,anon,authenticated;
grant execute on function aurassure_internal.process_quality_cycle() to service_role;

-- Publish the verified operational snapshot immediately; no pollutant values exposed.
select aurassure_internal.refresh_public_station_status();
