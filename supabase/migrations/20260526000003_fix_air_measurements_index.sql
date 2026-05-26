-- Migration: Fix Air Measurements Unique Index
-- Description: Adiciona um índice único simples para air_measurements para compatibilidade com o ON CONFLICT do PostgREST.

create unique index if not exists ux_air_measurements_prevent_duplicates_simple
  on public.air_measurements (station_id, pollutant, measured_at, averaging_period);
