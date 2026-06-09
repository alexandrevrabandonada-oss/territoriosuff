-- Migration: vinculo editorial do fechamento mensal com PDF de origem
-- Description: registra qual asset PDF originou o fechamento mensal de transparencia viva.

alter table public.transparency_live_reports
  add column if not exists source_asset_id uuid references public.media_assets(id) on delete set null;

create index if not exists idx_transparency_live_reports_source_asset_id
  on public.transparency_live_reports (source_asset_id);

comment on column public.transparency_live_reports.source_asset_id is 'Vinculo opcional com o PDF em media_assets usado como base editorial do fechamento mensal.';
