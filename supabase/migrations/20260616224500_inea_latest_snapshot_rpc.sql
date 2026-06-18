create or replace function public.get_inea_latest_snapshot()
returns table (
  station_id uuid,
  station_name text,
  station_code text,
  city text,
  neighborhood text,
  lat double precision,
  lng double precision,
  active boolean,
  measured_at timestamptz,
  measurements jsonb
)
language sql
stable
set search_path = public
as $$
  with inea_stations as (
    select
      s.id,
      s.name,
      s.code,
      s.city,
      s.neighborhood,
      s.lat,
      s.lng,
      s.active
    from public.air_stations s
    where s.source = 'INEA'
  ),
  latest_timestamps as (
    select
      m.station_id,
      max(m.measured_at) as measured_at
    from public.air_measurements m
    where m.source = 'INEA'
    group by m.station_id
  ),
  latest_measurements as (
    select
      s.id as station_id,
      lt.measured_at,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'pollutant', m.pollutant,
            'value', m.value,
            'unit', m.unit,
            'measured_at', m.measured_at,
            'averaging_period', m.averaging_period,
            'quality_flag', m.quality_flag,
            'metric_type', m.metric_type,
            'air_quality_index', m.air_quality_index,
            'air_quality_classification', m.air_quality_classification,
            'controlling_pollutant', m.controlling_pollutant,
            'raw_column', m.raw_column
          )
          order by
            case
              when m.metric_type = 'GENERAL_AQI' then 0
              when m.metric_type = 'POLLUTANT_SUBINDEX' then 1
              else 2
            end,
            coalesce(m.pollutant, ''),
            coalesce(m.raw_column, '')
        ) filter (where m.id is not null),
        '[]'::jsonb
      ) as measurements
    from inea_stations s
    left join latest_timestamps lt
      on lt.station_id = s.id
    left join public.air_measurements m
      on m.station_id = s.id
     and m.measured_at = lt.measured_at
    group by s.id, lt.measured_at
  )
  select
    s.id as station_id,
    s.name as station_name,
    s.code as station_code,
    s.city,
    s.neighborhood,
    s.lat,
    s.lng,
    s.active,
    lm.measured_at,
    lm.measurements
  from inea_stations s
  left join latest_measurements lm
    on lm.station_id = s.id
  order by s.name asc;
$$;

grant execute on function public.get_inea_latest_snapshot() to anon, authenticated, service_role;

comment on function public.get_inea_latest_snapshot() is 'Retorna um snapshot agregado da leitura pública mais recente por estação INEA, evitando consultas N+1 no endpoint do Radar.';
