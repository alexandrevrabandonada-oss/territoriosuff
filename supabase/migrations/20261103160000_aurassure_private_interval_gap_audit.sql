-- Private gap evidence from real 15-minute Aurassure/UFF samples.
-- No interpolation; leading/trailing missing coverage is not inferred.
create or replace view aurassure_internal.measurement_gaps
with (security_invoker = true) as
with ordered as (
  select station_id, measured_at,
    lag(measured_at) over(partition by station_id order by measured_at) as previous_at
  from public.aurassure_measurements_staging
  where aggregation_period_seconds=900
)
select
 station_id,
 previous_at as last_measured_at,
 measured_at as next_measured_at,
 (extract(epoch from (measured_at-previous_at))/900)::integer-1 as missing_15min_slots,
 extract(epoch from (measured_at-previous_at))/3600 as interval_hours,
 case when measured_at-previous_at >= interval '4 hours' then 'major'
      when measured_at-previous_at >= interval '1 hour' then 'significant'
      else 'short' end as gap_class
from ordered
where previous_at is not null
  and measured_at-previous_at > interval '15 minutes';
revoke all on aurassure_internal.measurement_gaps from public,anon,authenticated;
grant select on aurassure_internal.measurement_gaps to service_role;
