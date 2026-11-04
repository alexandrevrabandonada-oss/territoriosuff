-- Maintain a separate non-public issue ledger; do not rewrite original Aurassure measurements.
create table if not exists public.aurassure_qa_annotations (
  station_id integer not null,
  measured_at timestamptz not null,
  averaging_period_seconds integer not null,
  flag_code text not null,
  review_status text not null default 'open' check (review_status in ('open','resolved','dismissed')),
  severity text not null default 'review_required' check (severity in ('watch','review_required','block_release')),
  rationale text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_note text,
  primary key (station_id, measured_at, averaging_period_seconds, flag_code),
  foreign key (station_id, measured_at, averaging_period_seconds)
    references public.aurassure_measurements_staging(station_id, measured_at, aggregation_period_seconds)
    on delete restrict
);
alter table public.aurassure_qa_annotations enable row level security;
revoke all on public.aurassure_qa_annotations from public, anon, authenticated;
grant select, insert, update on public.aurassure_qa_annotations to service_role;

insert into public.aurassure_qa_annotations (
  station_id, measured_at, averaging_period_seconds, flag_code, review_status,
  severity, rationale, evidence
)
select
  m.station_id,
  m.measured_at,
  m.aggregation_period_seconds,
  'coincident_gas_decay_after_available_data_gap',
  'open',
  'block_release',
  'Em 29/10/2026, CRIAAD: NO2, SO2 e CO mostram queda muito forte e simultânea nas três primeiras médias de 15 min disponíveis na janela, sem variação comparável de PM2.5 e sem padrão semelhante nas outras duas estações. Verificar retomada, calibração, unidade, ruído e evento ambiental real com a equipe técnica antes de qualquer publicação ou interpretação causal.',
  jsonb_build_object(
    'investigation_window_local', '2026-10-29 16:30:00 to 17:00:00 America/Sao_Paulo',
    'from', 'raw Aurassure API response and normalized private staging',
    'observed_gases', jsonb_build_object('no2', m.no2, 'so2',m.so2,'co',m.co),
    'pm25',m.pm25,
    'unit_status','gas unit unresolved: station display unit ppb, default_unit differs',
    'cause', 'unconfirmed'
  )
from public.aurassure_measurements_staging m
where m.station_id=46562
  and m.aggregation_period_seconds=900
  and m.measured_at >= '2026-10-29 16:30:00-03'::timestamptz
  and m.measured_at <= '2026-10-29 17:00:00-03'::timestamptz
on conflict do nothing;
