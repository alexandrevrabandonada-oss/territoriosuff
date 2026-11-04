-- SEMEAR SF: explicit, reviewed publication boundary for Aurassure/UFF observations.
-- No raw/private staging rows are made public by this migration.
create table if not exists public.aurassure_public_measurements (
  station_id integer not null check (station_id in (46560,46561,46562)),
  measured_at timestamptz not null,
  averaging_period_seconds integer not null check (averaging_period_seconds in (900,3600,86400)),
  pm25_ug_m3 numeric check (pm25_ug_m3 is null or pm25_ug_m3 >= 0),
  pm10_ug_m3 numeric check (pm10_ug_m3 is null or pm10_ug_m3 >= 0),
  temperature_c numeric,
  relative_humidity_pct numeric check (relative_humidity_pct is null or relative_humidity_pct between 0 and 100),
  source_response_sha256 text not null check (source_response_sha256 ~ '^[a-f0-9]{64}$'),
  reviewer_reference text,
  unit_validation_reference text,
  methodology_reference text,
  publication_state text not null default 'withheld' check (publication_state in ('withheld','published')),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (station_id,measured_at,averaging_period_seconds),
  constraint aurassure_public_release_guard check (
    publication_state='withheld'
    or (
      reviewer_reference is not null and length(trim(reviewer_reference)) >= 5
      and unit_validation_reference is not null and length(trim(unit_validation_reference)) >= 5
      and methodology_reference is not null and length(trim(methodology_reference)) >= 5
      and approved_at is not null and published_at is not null
    )
  )
);
create index if not exists aurassure_public_measurements_recent_idx
on public.aurassure_public_measurements (measured_at desc, station_id);
alter table public.aurassure_public_measurements enable row level security;
revoke all on public.aurassure_public_measurements from public, anon, authenticated;
grant select on public.aurassure_public_measurements to anon, authenticated;
grant select, insert, update, delete on public.aurassure_public_measurements to service_role;
drop policy if exists aurassure_public_read_reviewed_only on public.aurassure_public_measurements;
create policy aurassure_public_read_reviewed_only on public.aurassure_public_measurements
for select to anon, authenticated using (
  publication_state='published'
  and approved_at is not null
  and published_at is not null
  and published_at <= now()
);
