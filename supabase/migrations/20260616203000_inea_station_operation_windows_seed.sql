with station_window_seed(pattern, start_date, end_date, source_label) as (
  values
    ('%Belmonte%', date '2013-01-01', null::date, 'availability_matrix_2013_2026 + historical_sources_2013_2015'),
    ('%Retiro%', date '2013-01-01', null::date, 'availability_matrix_2013_2026 + historical_sources_2013_2015'),
    ('%Santa Cecília%', date '2013-01-01', null::date, 'availability_matrix_2013_2026 + historical_sources_2013_2015'),
    ('%Ilha das Águas Cruas%', date '2013-01-01', null::date, 'availability_matrix_2013_2026 + weblakes_normalized_summary')
)
update public.air_stations as s
set
  operation_start_date = coalesce(s.operation_start_date, seed.start_date),
  operation_end_date = coalesce(s.operation_end_date, seed.end_date),
  operation_window_source = coalesce(s.operation_window_source, seed.source_label)
from station_window_seed as seed
where s.source = 'INEA'
  and s.name ilike seed.pattern;

create or replace function public.get_inea_station_expected_windows()
returns table (
  station_id uuid,
  station_name text,
  expected_start_date date,
  expected_end_date date,
  window_is_inferred boolean
)
language sql
stable
set search_path = public
as $$
  with source_bounds as (
    select
      min(m.measured_at)::date as source_min_date,
      max(m.measured_at)::date as source_max_date
    from public.air_measurements m
    where m.source = 'INEA'
  ),
  station_bounds as (
    select
      s.id as station_id,
      s.name as station_name,
      s.active,
      s.operation_start_date,
      s.operation_end_date,
      min(m.measured_at)::date as first_measurement_date,
      max(m.measured_at)::date as last_measurement_date
    from public.air_stations s
    left join public.air_measurements m
      on m.station_id = s.id
     and m.source = 'INEA'
    where s.source = 'INEA'
    group by s.id, s.name, s.active, s.operation_start_date, s.operation_end_date
  )
  select
    sb.station_id,
    sb.station_name,
    coalesce(sb.operation_start_date, sb.first_measurement_date, src.source_min_date) as expected_start_date,
    greatest(
      coalesce(
        case
          when sb.active and sb.operation_start_date is not null then src.source_max_date
          when sb.operation_end_date is not null then sb.operation_end_date
          when sb.active then src.source_max_date
          else sb.last_measurement_date
        end,
        sb.last_measurement_date,
        src.source_max_date
      ),
      coalesce(sb.operation_start_date, sb.first_measurement_date, src.source_min_date)
    ) as expected_end_date,
    case
      when sb.operation_start_date is null then true
      when sb.active then false
      when sb.operation_end_date is null then true
      else false
    end as window_is_inferred
  from station_bounds sb
  cross join source_bounds src
  where coalesce(sb.operation_start_date, sb.first_measurement_date, src.source_min_date) is not null
    and coalesce(
      case
        when sb.active and sb.operation_start_date is not null then src.source_max_date
        when sb.operation_end_date is not null then sb.operation_end_date
        when sb.active then src.source_max_date
        else sb.last_measurement_date
      end,
      sb.last_measurement_date,
      src.source_max_date
    ) is not null;
$$;

comment on function public.get_inea_station_expected_windows() is 'Resolve a janela esperada por estação INEA. Estações ativas com início operacional explícito permanecem abertas até a data máxima da base pública.';
