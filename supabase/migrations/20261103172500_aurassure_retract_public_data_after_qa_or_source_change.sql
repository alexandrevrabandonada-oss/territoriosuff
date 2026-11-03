-- SEMEAR SF / Aurassure: a previously approved reading must be retracted automatically
-- when its private QA status or measured source values later become invalid.
-- All sensitive evidence and revocation events remain in aurassure_internal.

create table if not exists aurassure_internal.publication_revocations (
  id uuid primary key default gen_random_uuid(),
  station_id integer not null,
  measured_at timestamptz not null,
  averaging_period_seconds integer not null,
  reason text not null,
  revoked_at timestamptz not null default now()
);
create index if not exists aurassure_revocations_recent_idx
  on aurassure_internal.publication_revocations(revoked_at desc, station_id);
revoke all on aurassure_internal.publication_revocations from public,anon,authenticated;
grant select,insert on aurassure_internal.publication_revocations to service_role;

create or replace function aurassure_internal.retract_public_measurement(
  p_station_id integer,
  p_measured_at timestamptz,
  p_period_seconds integer,
  p_reason text
)
returns integer language plpgsql security definer set search_path=''
as $fn$
declare rows_retracted integer;
begin
  with retracted as (
    update public.aurassure_public_measurements p
    set publication_state='withheld', approved_at=null, published_at=null
    where p.station_id=p_station_id
      and p.measured_at=p_measured_at
      and p.averaging_period_seconds=p_period_seconds
      and p.publication_state='published'
    returning p.station_id,p.measured_at,p.averaging_period_seconds
  ), logged as (
    insert into aurassure_internal.publication_revocations(
      station_id,measured_at,averaging_period_seconds,reason
    )
    select station_id,measured_at,averaging_period_seconds,p_reason
    from retracted
    returning 1
  )
  select count(*)::integer into rows_retracted from logged;
  return rows_retracted;
end
$fn$;
revoke all on function aurassure_internal.retract_public_measurement(integer,timestamptz,integer,text)
  from public,anon,authenticated;
grant execute on function aurassure_internal.retract_public_measurement(integer,timestamptz,integer,text)
  to service_role;

create or replace function aurassure_internal.retract_on_new_qa_block()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
  if new.review_status='open' and new.severity='block_release' then
    perform aurassure_internal.retract_public_measurement(
      new.station_id,new.measured_at,new.averaging_period_seconds,
      'open_qa_block:' || new.flag_code
    );
  end if;
  return null;
end
$fn$;
revoke all on function aurassure_internal.retract_on_new_qa_block()
  from public,anon,authenticated;

drop trigger if exists aurassure_retract_on_new_qa_block
  on public.aurassure_qa_annotations;
create trigger aurassure_retract_on_new_qa_block
  after insert or update of severity,review_status
  on public.aurassure_qa_annotations
  for each row execute function aurassure_internal.retract_on_new_qa_block();

create or replace function aurassure_internal.retract_on_source_change()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
  if tg_op='DELETE' then
    perform aurassure_internal.retract_public_measurement(
      old.station_id,old.measured_at,old.aggregation_period_seconds,
      'private_source_deleted'
    );
    return null;
  end if;

  if (new.qa_status is distinct from old.qa_status and
      new.qa_status <> 'approved_for_publication')
    or new.pm25 is distinct from old.pm25
    or new.pm10 is distinct from old.pm10
    or new.station_id is distinct from old.station_id
    or new.measured_at is distinct from old.measured_at
    or new.aggregation_period_seconds is distinct from old.aggregation_period_seconds
  then
    perform aurassure_internal.retract_public_measurement(
      old.station_id,old.measured_at,old.aggregation_period_seconds,
      'private_source_changed_or_approval_revoked'
    );
  end if;
  return null;
end
$fn$;
revoke all on function aurassure_internal.retract_on_source_change()
  from public,anon,authenticated;

drop trigger if exists aurassure_retract_on_source_change
  on public.aurassure_measurements_staging;
create trigger aurassure_retract_on_source_change
  after update of qa_status,pm25,pm10,station_id,measured_at,aggregation_period_seconds
  or delete on public.aurassure_measurements_staging
  for each row execute function aurassure_internal.retract_on_source_change();
