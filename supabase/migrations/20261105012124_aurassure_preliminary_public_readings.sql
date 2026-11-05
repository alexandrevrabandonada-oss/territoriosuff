-- Explicitly authorized preliminary publication of the two particulate channels.
-- This narrowly projected view does not expose raw responses, credentials, gases,
-- or QA metadata and does not mark any observation as individually reviewed.
-- 04 Nov 2026: portal owner reports Aurassure validation and authorizes
-- preliminary publication; the /things/list configuration labels both PM
-- channels in micrograms/m3. Open QA flags always take precedence.
create view public.aurassure_preliminary_readings
with (security_barrier = true) as
select
  m.station_id,
  m.measured_at,
  m.aggregation_period_seconds as averaging_period_seconds,
  m.pm25 as pm25_ug_m3,
  m.pm10 as pm10_ug_m3
from public.aurassure_measurements_staging m
join public.aurassure_api_snapshots s on s.id = m.source_snapshot_id
where m.station_id in (46560, 46561, 46562)
  and m.aggregation_period_seconds = 900
  and m.measured_at <= now()
  -- Allow the scheduled quality cycle to annotate fresh post-gap records.
  and m.first_imported_at <= now() - interval '5 minutes'
  and s.operation = 'readings'
  and s.source_system = 'AURASSURE_UFF'
  and s.response_sha256 ~ '^[a-f0-9]{64}$'
  and (m.pm25 is not null or m.pm10 is not null)
  and (m.pm25 is null or (m.pm25 >= 0 and m.pm25 <> 'NaN'::numeric and m.pm25 <> 'Infinity'::numeric))
  and (m.pm10 is null or (m.pm10 >= 0 and m.pm10 <> 'NaN'::numeric and m.pm10 <> 'Infinity'::numeric))
  and not exists (
    select 1 from public.aurassure_qa_annotations q
    where q.station_id = m.station_id
      and q.measured_at = m.measured_at
      and q.averaging_period_seconds = m.aggregation_period_seconds
      and q.review_status = 'open'
      and q.severity in ('review_required', 'block_release')
  )
  -- A deliberate withholding in the reviewed-publication workflow must win.
  and not exists (
    select 1 from public.aurassure_public_measurements p
    where p.station_id = m.station_id
      and p.measured_at = m.measured_at
      and p.averaging_period_seconds = m.aggregation_period_seconds
      and p.publication_state = 'withheld'
  );

revoke all on public.aurassure_preliminary_readings from public, anon, authenticated;
grant select on public.aurassure_preliminary_readings to anon, authenticated;
comment on view public.aurassure_preliminary_readings is
  'Preliminary UFF/Aurassure particulate readings; open QA alerts excluded. Not a reviewed or regulatory series.';
