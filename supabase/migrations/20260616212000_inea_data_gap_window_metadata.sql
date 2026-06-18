create or replace function public.get_inea_data_gaps()
returns table (
  station_id uuid,
  station_name text,
  measured_days integer,
  expected_days integer,
  coverage_percent numeric,
  insufficient_data_days integer,
  degraded_days integer,
  degraded_percent_of_measured_days numeric,
  degraded_percent_of_expected_days numeric,
  gap_count integer,
  max_gap_hours integer,
  expected_start_date date,
  expected_end_date date,
  window_is_inferred boolean,
  operation_window_source text,
  caveat text
)
language sql
stable
set search_path = public
as $$
  with windows as (
    select
      w.station_id,
      w.station_name,
      w.expected_start_date,
      w.expected_end_date,
      w.window_is_inferred,
      s.operation_window_source
    from public.get_inea_station_expected_windows() w
    join public.air_stations s
      on s.id = w.station_id
  ),
  expected_days as (
    select
      w.station_id,
      w.station_name,
      w.expected_start_date,
      w.expected_end_date,
      w.window_is_inferred,
      w.operation_window_source,
      gs::date as measured_date
    from windows w
    cross join lateral generate_series(w.expected_start_date, w.expected_end_date, interval '1 day') gs
  ),
  daily as (
    select * from public.get_inea_daily_aqi()
  ),
  measurement_gaps as (
    select
      m.station_id,
      count(*) filter (
        where m.prev_measured_at is not null
          and extract(epoch from (m.measured_at - m.prev_measured_at)) > 86400
      )::integer as gap_count,
      coalesce(
        max(
          case
            when m.prev_measured_at is not null
              then floor(extract(epoch from (m.measured_at - m.prev_measured_at)) / 3600)::integer
            else null
          end
        ),
        0
      )::integer as max_gap_hours
    from (
      select
        station_id,
        measured_at,
        lag(measured_at) over (partition by station_id order by measured_at) as prev_measured_at
      from public.air_measurements
      where source = 'INEA'
        and metric_type = 'GENERAL_AQI'
    ) m
    group by m.station_id
  ),
  aggregated as (
    select
      ed.station_id,
      ed.station_name,
      ed.expected_start_date,
      ed.expected_end_date,
      ed.window_is_inferred,
      ed.operation_window_source,
      count(d.worst_classification)::integer as measured_days,
      count(*)::integer as expected_days,
      count(*) filter (where d.worst_classification = 'DADO_INSUFICIENTE')::integer as insufficient_data_days,
      count(*) filter (
        where d.worst_classification is not null
          and d.worst_classification not in ('BOA', 'DADO_INSUFICIENTE')
      )::integer as degraded_days
    from expected_days ed
    left join daily d
      on d.station_id = ed.station_id
     and d.measured_date = ed.measured_date
    group by
      ed.station_id,
      ed.station_name,
      ed.expected_start_date,
      ed.expected_end_date,
      ed.window_is_inferred,
      ed.operation_window_source
  )
  select
    a.station_id,
    a.station_name,
    a.measured_days,
    a.expected_days,
    round(case when a.expected_days > 0 then (a.measured_days::numeric / a.expected_days::numeric) * 100 else 0 end, 1) as coverage_percent,
    a.insufficient_data_days,
    a.degraded_days,
    round(case when a.measured_days > 0 then (a.degraded_days::numeric / a.measured_days::numeric) * 100 else 0 end, 1) as degraded_percent_of_measured_days,
    round(case when a.expected_days > 0 then (a.degraded_days::numeric / a.expected_days::numeric) * 100 else 0 end, 1) as degraded_percent_of_expected_days,
    coalesce(g.gap_count, 0) as gap_count,
    coalesce(g.max_gap_hours, 0) as max_gap_hours,
    a.expected_start_date,
    a.expected_end_date,
    a.window_is_inferred,
    a.operation_window_source,
    'Cobertura calculada sobre a janela esperada da estação. Ausência de dado não representa ar bom.'::text as caveat
  from aggregated a
  left join measurement_gaps g
    on g.station_id = a.station_id
  order by coverage_percent asc, gap_count desc, station_name asc;
$$;

comment on function public.get_inea_data_gaps() is 'Retorna cobertura e lacunas por estação INEA com janela esperada explícita, datas da janela e origem editorial/técnica da metadata.';
