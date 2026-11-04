-- Per-station freshness and coverage; private instrumentation, not an air-quality classification.
create or replace view aurassure_internal.station_health
with (security_invoker = true) as
with known_stations as (
 select * from (values (46560,'UFF / Vila Santa Cecília'),
                       (46561,'IFRJ / Nossa Senhora das Graças'),
                       (46562,'CRIAAD / Vila Mury')) as t(station_id,display_name)
), recent as (
 select
  m.station_id,
  max(m.measured_at) as latest_measurement_at,
  count(*) filter(where m.measured_at > now()-interval '24 hours') as readings_last_24h,
  count(*) filter(where m.measured_at > now()-interval '1 hour') as readings_last_hour
 from public.aurassure_measurements_staging m
 where m.aggregation_period_seconds=900
 group by m.station_id
)
select
 k.station_id,
 k.display_name,
 now() as inspected_at,
 r.latest_measurement_at,
 case when r.latest_measurement_at is null then null
 else round((extract(epoch from(now()-r.latest_measurement_at))/60)::numeric,1) end as minutes_since_last_measurement,
 coalesce(r.readings_last_24h,0) as readings_last_24h,
 96::integer as expected_15min_slots_in_24h,
 round((least(coalesce(r.readings_last_24h,0),96)*100.0/96)::numeric,2) as coverage_24h_percent,
 coalesce(r.readings_last_hour,0) as readings_last_hour,
 (select count(*) from aurassure_internal.measurement_gaps g
   where g.station_id=k.station_id and g.last_measured_at > now()-interval '24 hours') as detected_gaps_started_24h,
 case
   when r.latest_measurement_at is null then 'no_measurements'
   when r.latest_measurement_at < now()-interval '90 minutes' then 'stale'
   when coalesce(r.readings_last_24h,0) < 86 then 'coverage_degraded'
   else 'receiving'
 end as collection_status,
 'technical_data_presence_only_not_air_quality_validation'::text as meaning
from known_stations k left join recent r using (station_id);
revoke all on aurassure_internal.station_health from public,anon,authenticated;
grant select on aurassure_internal.station_health to service_role;