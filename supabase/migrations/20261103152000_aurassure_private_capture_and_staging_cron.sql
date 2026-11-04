-- Supabase/SEMEAR: private 15-min Aurassure capture and normalization.
-- The operator token is resolved INSIDE Postgres via Vault, never embedded in cron.job or Git.
-- Sampling window overlaps 2 hours to absorb late arrival; staging UPSERT deduplicates observations.
create extension if not exists pg_cron;

select cron.schedule(
  'semear-aurassure-capture-15min',
  '*/15 * * * *',
  $job$
    with t as (select floor(extract(epoch from now()))::bigint as upto)
    select net.http_post(
      url := 'https://ojedgswernwbzrcfomqq.supabase.co/functions/v1/aurassure-bridge',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' ||
          (select decrypted_secret from vault.decrypted_secrets where name = 'aurassure_bridge_token')
      ),
      body := jsonb_build_object(
        'operation', 'readings',
        'data_type', 'aggregate',
        'aggregation_period', 900,
        'things', jsonb_build_array(46560, 46561, 46562),
        'from_time', t.upto - 7200,
        'upto_time', t.upto
      ),
      timeout_milliseconds := 25000
    )
    from t;
  $job$
);

select cron.schedule(
  'semear-aurassure-normalize-15min',
  '5,20,35,50 * * * *',
  $job$
    select aurassure_internal.refresh_measurements_staging();
  $job$
);
