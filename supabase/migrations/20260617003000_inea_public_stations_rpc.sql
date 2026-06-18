create or replace function public.get_inea_public_stations(p_station_id uuid default null)
returns table (
  station_id uuid,
  station_name text,
  station_code text,
  city text,
  neighborhood text,
  lat double precision,
  lng double precision,
  active boolean,
  operation_start_date date,
  operation_end_date date,
  operation_window_source text,
  window_is_inferred boolean
)
language sql
stable
set search_path = public
as $$
  select
    s.id as station_id,
    s.name as station_name,
    s.code as station_code,
    s.city,
    s.neighborhood,
    s.lat,
    s.lng,
    s.active,
    s.operation_start_date,
    s.operation_end_date,
    s.operation_window_source,
    (s.operation_start_date is null or s.operation_end_date is null) as window_is_inferred
  from public.air_stations s
  where s.source = 'INEA'
    and (p_station_id is null or s.id = p_station_id)
  order by s.name asc;
$$;
