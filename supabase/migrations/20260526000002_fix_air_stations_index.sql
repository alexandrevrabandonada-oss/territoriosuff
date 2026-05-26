-- Migration: Fix Air Stations Unique Index
-- Description: Adiciona um índice único simples em (source, code) para compatibilidade com o ON CONFLICT do PostgREST.

create unique index if not exists ux_air_stations_source_code_simple
  on public.air_stations (source, code);
