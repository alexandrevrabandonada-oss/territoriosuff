-- Private pipeline health: operational freshness is not equivalent to validated air quality.
create or replace view aurassure_internal.pipeline_health
with (security_invoker = true) as
select
  now() as checked_at,
  (select max(fetched_at) from public.aurassure_api_snapshots where operation='readings') as last_successful_capture_at,
  (select max(measured_at) from public.aurassure_measurements_staging) as last_staged_measurement_at,
  (select count(*) from public.aurassure_api_snapshots where operation='readings') as successful_reading_snapshots,
  (select count(*) from public.aurassure_measurements_staging) as unique_measurements,
  (select count(*) from public.aurassure_measurements_staging where provider_aqi is null) as missing_vendor_aqi_records,
  (select count(*) from public.aurassure_qa_annotations where review_status='open' and severity='block_release') as blocked_qa_annotations,
  (select count(*) from public.aurassure_public_measurements where publication_state='published') as publicly_released_records,
  case
    when (select max(fetched_at) from public.aurassure_api_snapshots where operation='readings') is null
      then 'no_data'
    when (select max(fetched_at) from public.aurassure_api_snapshots where operation='readings') < now()-interval '45 minutes'
      then 'capture_stale'
    when (select max(measured_at) from public.aurassure_measurements_staging) is null
      then 'staging_empty'
    when (select max(measured_at) from public.aurassure_measurements_staging) < now()-interval '2 hours'
      then 'measurements_stale'
    else 'operational'
  end as pipeline_status
;
revoke all on aurassure_internal.pipeline_health from public, anon, authenticated;
grant select on aurassure_internal.pipeline_health to service_role;