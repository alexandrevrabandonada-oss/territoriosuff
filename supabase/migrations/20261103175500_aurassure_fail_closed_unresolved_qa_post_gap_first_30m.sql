-- SEMEAR SF / Aurassure QA: open reviewer flags are publication blockers,
-- not just high-severity incidents. Quarantine first 30 min after a 5h+ data gap.
-- The original vendor observations are preserved exactly; no QA interpretation is
-- treated as a proven sensor failure or pollution event.

create or replace function aurassure_internal.reject_unresolved_reviews_before_publication()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
  if new.publication_state='published' and exists (
    select 1
    from public.aurassure_qa_annotations q
    where q.station_id=new.station_id
      and q.measured_at=new.measured_at
      and q.averaging_period_seconds=new.averaging_period_seconds
      and q.review_status='open'
      and q.severity in ('review_required','block_release')
  ) then
    raise exception 'Aurassure publication denied: unresolved QA review'
      using errcode='23514';
  end if;
  return new;
end
$fn$;
revoke all on function aurassure_internal.reject_unresolved_reviews_before_publication()
from public,anon,authenticated;

drop trigger if exists aurassure_reject_unresolved_reviews
on public.aurassure_public_measurements;
create trigger aurassure_reject_unresolved_reviews
before insert or update on public.aurassure_public_measurements
for each row execute function aurassure_internal.reject_unresolved_reviews_before_publication();

-- Upgrade existing post-publication revocation trigger: review_required is
-- now enough to withhold a reading pending explicit resolution.
create or replace function aurassure_internal.retract_on_new_qa_block()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
  if new.review_status='open'
    and new.severity in ('review_required','block_release')
  then
    perform aurassure_internal.retract_public_measurement(
      new.station_id,new.measured_at,new.averaging_period_seconds,
      'unresolved_qa_review:' || new.flag_code
    );
  end if;
  return null;
end
$fn$;

-- Normalize QA handling of 0, +15, +30 min after a long data gap. Review only:
-- do not mark instrument failure; do not delete, null or change readings.
create or replace function aurassure_internal.flag_post_gap_30m_reviews()
returns integer language sql security invoker set search_path=''
as $fn$
with affected as (
  select distinct on (m.station_id,m.measured_at,m.aggregation_period_seconds)
    m.station_id, m.measured_at, m.aggregation_period_seconds,
    g.interval_hours, g.next_measured_at
  from aurassure_internal.measurement_gaps g
  join public.aurassure_measurements_staging m
    on m.station_id=g.station_id
   and m.aggregation_period_seconds=900
   and m.measured_at between g.next_measured_at and g.next_measured_at+interval '30 minutes'
  where g.interval_hours>=5
  order by m.station_id,m.measured_at,m.aggregation_period_seconds,g.interval_hours desc
), inserted as (
  insert into public.aurassure_qa_annotations(
    station_id,measured_at,averaging_period_seconds,
    flag_code,review_status,severity,rationale,evidence
  )
  select
    station_id, measured_at, aggregation_period_seconds,
    'post_gap_30m_review_window','open','review_required',
    'Measured within the first 30 minutes following an observed data gap of at least 5h. Review gas sensor diagnostics, units and QA before approving this specific reading. This is a conservative review flag, not a confirmed fault.',
    jsonb_build_object(
      'gap_hours',round(interval_hours::numeric,2),
      'first_return_at',next_measured_at,
      'time_since_return_minutes',round((extract(epoch from(measured_at-next_measured_at))/60)::numeric,1),
      'meaning','presence-only QA review; no causal conclusion',
      'qa_source','observed timestamps, no interpolation'
    )
  from affected
  on conflict (station_id,measured_at,averaging_period_seconds,flag_code) do nothing
  returning 1
)
select count(*)::integer from inserted;
$fn$;
revoke all on function aurassure_internal.flag_post_gap_30m_reviews()
from public,anon,authenticated;
grant execute on function aurassure_internal.flag_post_gap_30m_reviews() to service_role;

-- One existing health cron runs both safe private routines, in sequence.
create or replace function aurassure_internal.process_quality_cycle()
returns jsonb language plpgsql security invoker set search_path=''
as $fn$
declare health_rows integer; review_rows integer;
begin
  health_rows := aurassure_internal.record_station_health();
  review_rows := aurassure_internal.flag_post_gap_30m_reviews();
  return jsonb_build_object('station_health_snapshots',health_rows,'new_qa_flags',review_rows);
end
$fn$;
revoke all on function aurassure_internal.process_quality_cycle()
from public,anon,authenticated;
grant execute on function aurassure_internal.process_quality_cycle() to service_role;

select cron.schedule(
  'semear-aurassure-station-health-15min',
  '7,22,37,52 * * * *',
  $job$ select aurassure_internal.process_quality_cycle(); $job$
);

-- Fail closed if any previously published sample has an unresolved QA review.
with eligible as (
  select p.station_id,p.measured_at,p.averaging_period_seconds
  from public.aurassure_public_measurements p
  where p.publication_state='published'
    and exists(
      select 1 from public.aurassure_qa_annotations q
      where q.station_id=p.station_id and q.measured_at=p.measured_at
        and q.averaging_period_seconds=p.averaging_period_seconds
        and q.review_status='open'
        and q.severity in ('review_required','block_release')
    )
)
select aurassure_internal.retract_public_measurement(
  e.station_id,e.measured_at,e.averaging_period_seconds,
  'retroactive_unresolved_qa_review'
)
from eligible e;
