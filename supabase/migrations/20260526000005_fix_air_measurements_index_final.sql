-- Migration: Fix Air Measurements Unique Index Final
-- Description: Cria um índice único simples sem expressões coalescentes para compatibilidade total com o ON CONFLICT do PostgREST.

drop index if exists public.ux_air_measurements_methodology;

create unique index if not exists ux_air_measurements_methodology_final
  on public.air_measurements (station_id, pollutant, measured_at, averaging_period, metric_type);
