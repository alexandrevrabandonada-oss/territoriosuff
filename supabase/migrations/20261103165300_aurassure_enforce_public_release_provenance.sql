-- Gate reviewed Aurassure/UFF measurements against the private original.
-- No existing readings are released, and the vendor/API original remains private.
create or replace function aurassure_internal.enforce_public_release_provenance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $body$
declare
  private_row public.aurassure_measurements_staging%rowtype;
  original_sha text;
begin
  if new.publication_state <> 'published' then
    return new;
  end if;

  select m.* into private_row
  from public.aurassure_measurements_staging m
  where m.station_id = new.station_id
    and m.measured_at = new.measured_at
    and m.aggregation_period_seconds = new.averaging_period_seconds;

  if not found then
    raise exception 'Aurassure publication denied: source sample not found'
      using errcode='23514';
  end if;

  if private_row.qa_status <> 'approved_for_publication' then
    raise exception 'Aurassure publication denied: metrology/quality approval pending'
      using errcode='23514';
  end if;

  if exists (
    select 1
    from public.aurassure_qa_annotations qa
    where qa.station_id = new.station_id
      and qa.measured_at = new.measured_at
      and qa.averaging_period_seconds = new.averaging_period_seconds
      and qa.review_status = 'open'
      and qa.severity = 'block_release'
  ) then
    raise exception 'Aurassure publication denied: open quality block'
      using errcode='23514';
  end if;

  select s.response_sha256 into original_sha
  from public.aurassure_api_snapshots s
  where s.id = private_row.source_snapshot_id
    and s.operation='readings'
    and s.source_system = 'AURASSURE_UFF';

  if original_sha is null or new.source_response_sha256 is distinct from original_sha then
    raise exception 'Aurassure publication denied: source checksum mismatch'
      using errcode='23514';
  end if;

  if (new.pm25_ug_m3 is null and new.pm10_ug_m3 is null)
    or new.pm25_ug_m3 is distinct from private_row.pm25
    or new.pm10_ug_m3 is distinct from private_row.pm10 then
    raise exception 'Aurassure publication denied: values differ from source or are empty'
      using errcode='23514';
  end if;

  if new.approved_at is null or new.approved_at > now()
    or new.published_at is null
    or length(trim(coalesce(new.reviewer_reference,''))) < 5
    or length(trim(coalesce(new.unit_validation_reference,''))) < 5
    or length(trim(coalesce(new.methodology_reference,''))) < 5 then
    raise exception 'Aurassure publication denied: complete approval documentation required'
      using errcode='23514';
  end if;

  return new;
end;
$body$;

revoke all on function aurassure_internal.enforce_public_release_provenance()
from public, anon, authenticated;

drop trigger if exists aurassure_enforce_public_release_provenance
on public.aurassure_public_measurements;

create trigger aurassure_enforce_public_release_provenance
before insert or update on public.aurassure_public_measurements
for each row
execute function aurassure_internal.enforce_public_release_provenance();
