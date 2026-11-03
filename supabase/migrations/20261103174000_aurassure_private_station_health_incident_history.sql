-- SEMEAR SF: private, durable operational-health log for Aurassure stations.
-- Does not publish pollution measurements, infer absent readings, or send external messages.

create table if not exists aurassure_internal.station_health_history (
  observed_bucket timestamptz not null,
  station_id integer not null check (station_id in (46560,46561,46562)),
  last_measurement_at timestamptz,
  lag_minutes numeric,
  readings_last_24h integer not null,
  coverage_24h_percent numeric not null,
  detected_gaps_started_24h integer not null,
  collection_status text not null check (
    collection_status in ('receiving','coverage_degraded','stale','no_measurements')
  ),
  recorded_at timestamptz not null default now(),
  primary key (observed_bucket,station_id)
);
create index if not exists aurassure_station_health_history_recent
  on aurassure_internal.station_health_history(station_id,observed_bucket desc);

create table if not exists aurassure_internal.station_incidents (
  id uuid primary key default gen_random_uuid(),
  station_id integer not null check (station_id in (46560,46561,46562)),
  condition text not null check (condition in ('coverage_degraded','stale','no_measurements')),
  detected_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  observation_count integer not null default 1 check (observation_count >= 1),
  resolved_at timestamptz,
  resolution_reason text,
  check (resolved_at is null or resolved_at >= detected_at)
);
create unique index if not exists aurassure_station_one_open_incident_per_station
  on aurassure_internal.station_incidents(station_id)
  where resolved_at is null;
create index if not exists aurassure_station_incidents_recent
  on aurassure_internal.station_incidents(detected_at desc,station_id);

revoke all on aurassure_internal.station_health_history,
              aurassure_internal.station_incidents
  from public, anon, authenticated;
grant select,insert,update on aurassure_internal.station_health_history,
                             aurassure_internal.station_incidents to service_role;

create or replace function aurassure_internal.record_station_health()
returns integer language plpgsql security invoker set search_path=''
as $fn$
declare
  health record;
  bucket timestamptz := to_timestamp(
    floor(extract(epoch from now()) / 900)::bigint * 900
  );
  snapshots_written integer := 0;
  did_insert integer;
begin
  for health in
    select * from aurassure_internal.station_health order by station_id
  loop
    insert into aurassure_internal.station_health_history(
      observed_bucket,station_id,last_measurement_at,lag_minutes,
      readings_last_24h,coverage_24h_percent,detected_gaps_started_24h,
      collection_status
    ) values (
      bucket,health.station_id,health.latest_measurement_at,
      health.minutes_since_last_measurement,
      health.readings_last_24h,health.coverage_24h_percent,
      health.detected_gaps_started_24h,health.collection_status
    ) on conflict (observed_bucket,station_id) do nothing;
    get diagnostics did_insert = row_count;
    snapshots_written := snapshots_written + did_insert;
    -- A repeated invocation inside the same 15-minute bucket must be idempotent.
    if did_insert = 0 then continue; end if;

    -- A stale condition replaces an older coverage issue; recovery closes the incident.
    update aurassure_internal.station_incidents i
      set resolved_at=now(),
          resolution_reason=case when health.collection_status='receiving'
            then 'sampling_resumed_or_coverage_restored'
            else 'operational_status_changed' end
    where i.station_id=health.station_id
      and i.resolved_at is null
      and i.condition is distinct from health.collection_status;

    if health.collection_status <> 'receiving' then
      insert into aurassure_internal.station_incidents(
        station_id,condition,detected_at,last_observed_at,observation_count
      ) values (
        health.station_id,health.collection_status,now(),now(),1
      )
      on conflict (station_id) where resolved_at is null do update
        set last_observed_at=now(),
            observation_count=aurassure_internal.station_incidents.observation_count+1;
    end if;
  end loop;
  return snapshots_written;
end
$fn$;
revoke all on function aurassure_internal.record_station_health()
  from public,anon,authenticated;
grant execute on function aurassure_internal.record_station_health()
  to service_role;

-- Run two minutes after each normalization. No API credentials or external network access.
select cron.schedule(
  'semear-aurassure-station-health-15min',
  '7,22,37,52 * * * *',
  $job$ select aurassure_internal.record_station_health(); $job$
);
