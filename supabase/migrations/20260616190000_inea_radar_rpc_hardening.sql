alter table public.air_stations
  add column if not exists operation_start_date date,
  add column if not exists operation_end_date date,
  add column if not exists operation_window_source text;

comment on column public.air_stations.operation_start_date is 'Data esperada de início operacional da estação para cálculo de cobertura do Radar INEA.';
comment on column public.air_stations.operation_end_date is 'Data esperada de encerramento operacional da estação para cálculo de cobertura do Radar INEA.';
comment on column public.air_stations.operation_window_source is 'Origem editorial/técnica da janela operacional esperada da estação.';

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
        sb.operation_end_date,
        case
          when sb.active then src.source_max_date
          else sb.last_measurement_date
        end,
        sb.last_measurement_date,
        src.source_max_date
      ),
      coalesce(sb.operation_start_date, sb.first_measurement_date, src.source_min_date)
    ) as expected_end_date,
    (sb.operation_start_date is null or sb.operation_end_date is null) as window_is_inferred
  from station_bounds sb
  cross join source_bounds src
  where coalesce(sb.operation_start_date, sb.first_measurement_date, src.source_min_date) is not null
    and coalesce(
      sb.operation_end_date,
      case when sb.active then src.source_max_date else sb.last_measurement_date end,
      sb.last_measurement_date,
      src.source_max_date
    ) is not null;
$$;

create or replace function public.get_inea_daily_aqi()
returns table (
  station_id uuid,
  measured_date date,
  worst_classification text
)
language sql
stable
set search_path = public
as $$
  with prepared as (
    select
      m.station_id,
      m.measured_at::date as measured_date,
      case
        when m.quality_flag is distinct from 'OK' then 'DADO_INSUFICIENTE'
        when coalesce(m.air_quality_index, 0) = 0
          and not (
            coalesce(m.raw_json ->> 'IQA MP10', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA MP2,5', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA SO2', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA NO2', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA O3', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA CO', '0') not in ('0', '0.0', '')
          ) then 'DADO_INSUFICIENTE'
        when upper(trim(coalesce(m.air_quality_classification, ''))) not in ('BOA', 'MODERADA', 'RUIM', 'MUITO RUIM', 'PÉSSIMA')
          then 'DADO_INSUFICIENTE'
        else upper(trim(m.air_quality_classification))
      end as validated_classification,
      case
        when m.quality_flag is distinct from 'OK' then 0
        when coalesce(m.air_quality_index, 0) = 0
          and not (
            coalesce(m.raw_json ->> 'IQA MP10', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA MP2,5', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA SO2', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA NO2', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA O3', '0') not in ('0', '0.0', '')
            or coalesce(m.raw_json ->> 'IQA CO', '0') not in ('0', '0.0', '')
          ) then 0
        when upper(trim(coalesce(m.air_quality_classification, ''))) = 'BOA' then 1
        when upper(trim(coalesce(m.air_quality_classification, ''))) = 'MODERADA' then 2
        when upper(trim(coalesce(m.air_quality_classification, ''))) = 'RUIM' then 3
        when upper(trim(coalesce(m.air_quality_classification, ''))) = 'MUITO RUIM' then 4
        when upper(trim(coalesce(m.air_quality_classification, ''))) = 'PÉSSIMA' then 5
        else 0
      end as classification_rank
    from public.air_measurements m
    where m.source = 'INEA'
      and m.metric_type = 'GENERAL_AQI'
  ),
  ranked as (
    select
      p.station_id,
      p.measured_date,
      p.validated_classification,
      row_number() over (
        partition by p.station_id, p.measured_date
        order by p.classification_rank desc, p.validated_classification desc
      ) as rn
    from prepared p
  )
  select
    r.station_id,
    r.measured_date,
    r.validated_classification as worst_classification
  from ranked r
  where r.rn = 1;
$$;

create or replace function public.get_inea_summary()
returns table (
  total_stations integer,
  total_measurements bigint,
  min_date timestamptz,
  max_date timestamptz,
  moderate_or_worse_days_count integer,
  most_frequent_controlling_pollutant text,
  source_system text,
  data_freshness_label text,
  latest_measured_at timestamptz,
  latest_ingested_at timestamptz,
  is_realtime boolean
)
language sql
stable
set search_path = public
as $$
  with station_count as (
    select count(*)::integer as total_stations
    from public.air_stations
    where source = 'INEA'
  ),
  measurement_stats as (
    select
      count(*)::bigint as total_measurements,
      min(measured_at) as min_date,
      max(measured_at) as max_date,
      max(ingested_at) as latest_ingested_at
    from public.air_measurements
    where source = 'INEA'
  ),
  daily_flags as (
    select measured_date
    from public.get_inea_daily_aqi()
    where worst_classification in ('MODERADA', 'RUIM', 'MUITO RUIM', 'PÉSSIMA')
    group by measured_date
  ),
  controller_counts as (
    select
      upper(trim(controlling_pollutant)) as pollutant,
      count(*) as total
    from public.air_measurements
    where source = 'INEA'
      and metric_type = 'GENERAL_AQI'
      and controlling_pollutant is not null
    group by upper(trim(controlling_pollutant))
  ),
  latest_run as (
    select max(finished_at) as latest_finished_at
    from public.air_ingest_runs
    where source = 'INEA'
      and status = 'success'
  )
  select
    sc.total_stations,
    ms.total_measurements,
    ms.min_date,
    ms.max_date,
    (select count(*)::integer from daily_flags),
    coalesce((select pollutant from controller_counts order by total desc, pollutant asc limit 1), '-') as most_frequent_controlling_pollutant,
    'CKAN_XLSX'::text as source_system,
    'Última base pública disponível'::text as data_freshness_label,
    ms.max_date as latest_measured_at,
    greatest(ms.latest_ingested_at, lr.latest_finished_at) as latest_ingested_at,
    false as is_realtime
  from station_count sc
  cross join measurement_stats ms
  cross join latest_run lr;
$$;

create or replace function public.get_inea_monthly_profile()
returns table (
  month integer,
  month_name text,
  measured_days integer,
  expected_days integer,
  coverage_percent numeric,
  insufficient_data_days integer,
  degraded_days integer,
  degraded_percent_of_measured_days numeric,
  degraded_percent_of_expected_days numeric,
  caveat text
)
language sql
stable
set search_path = public
as $$
  with windows as (
    select * from public.get_inea_station_expected_windows()
  ),
  expected_days as (
    select
      w.station_id,
      gs::date as measured_date
    from windows w
    cross join lateral generate_series(w.expected_start_date, w.expected_end_date, interval '1 day') gs
  ),
  daily as (
    select * from public.get_inea_daily_aqi()
  ),
  monthly as (
    select
      extract(month from ed.measured_date)::integer as month_number,
      count(*)::integer as expected_days,
      count(d.worst_classification)::integer as measured_days,
      count(*) filter (where d.worst_classification = 'DADO_INSUFICIENTE')::integer as insufficient_data_days,
      count(*) filter (
        where d.worst_classification is not null
          and d.worst_classification not in ('BOA', 'DADO_INSUFICIENTE')
      )::integer as degraded_days
    from expected_days ed
    left join daily d
      on d.station_id = ed.station_id
     and d.measured_date = ed.measured_date
    group by extract(month from ed.measured_date)
  )
  select
    m.month_number as month,
    to_char(make_date(2024, m.month_number, 1), 'TMMonth') as month_name,
    m.measured_days,
    m.expected_days,
    round(case when m.expected_days > 0 then (m.measured_days::numeric / m.expected_days::numeric) * 100 else 0 end, 1) as coverage_percent,
    m.insufficient_data_days,
    m.degraded_days,
    round(case when m.measured_days > 0 then (m.degraded_days::numeric / m.measured_days::numeric) * 100 else 0 end, 1) as degraded_percent_of_measured_days,
    round(case when m.expected_days > 0 then (m.degraded_days::numeric / m.expected_days::numeric) * 100 else 0 end, 1) as degraded_percent_of_expected_days,
    'Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa.'::text as caveat
  from monthly m
  order by m.month_number;
$$;

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
  window_is_inferred boolean,
  caveat text
)
language sql
stable
set search_path = public
as $$
  with windows as (
    select * from public.get_inea_station_expected_windows()
  ),
  expected_days as (
    select
      w.station_id,
      w.station_name,
      w.window_is_inferred,
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
              and extract(epoch from (m.measured_at - m.prev_measured_at)) > 86400
            then extract(epoch from (m.measured_at - m.prev_measured_at)) / 3600
          end
        )::integer,
        0
      ) as max_gap_hours
    from (
      select
        am.station_id,
        am.measured_at,
        lag(am.measured_at) over (partition by am.station_id order by am.measured_at) as prev_measured_at
      from public.air_measurements am
      where am.source = 'INEA'
        and am.metric_type = 'GENERAL_AQI'
    ) m
    group by m.station_id
  )
  select
    ed.station_id,
    max(ed.station_name) as station_name,
    count(d.worst_classification)::integer as measured_days,
    count(*)::integer as expected_days,
    round(case when count(*) > 0 then (count(d.worst_classification)::numeric / count(*)::numeric) * 100 else 0 end, 1) as coverage_percent,
    count(*) filter (where d.worst_classification = 'DADO_INSUFICIENTE')::integer as insufficient_data_days,
    count(*) filter (
      where d.worst_classification is not null
        and d.worst_classification not in ('BOA', 'DADO_INSUFICIENTE')
    )::integer as degraded_days,
    round(
      case
        when count(d.worst_classification) > 0
          then (
            count(*) filter (
              where d.worst_classification is not null
                and d.worst_classification not in ('BOA', 'DADO_INSUFICIENTE')
            )::numeric / count(d.worst_classification)::numeric
          ) * 100
        else 0
      end,
      1
    ) as degraded_percent_of_measured_days,
    round(
      case
        when count(*) > 0
          then (
            count(*) filter (
              where d.worst_classification is not null
                and d.worst_classification not in ('BOA', 'DADO_INSUFICIENTE')
            )::numeric / count(*)::numeric
          ) * 100
        else 0
      end,
      1
    ) as degraded_percent_of_expected_days,
    coalesce(max(mg.gap_count), 0) as gap_count,
    coalesce(max(mg.max_gap_hours), 0) as max_gap_hours,
    bool_or(ed.window_is_inferred) as window_is_inferred,
    'Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa.'::text as caveat
  from expected_days ed
  left join daily d
    on d.station_id = ed.station_id
   and d.measured_date = ed.measured_date
  left join measurement_gaps mg
    on mg.station_id = ed.station_id
  group by ed.station_id
  order by max(ed.station_name);
$$;

create or replace function public.get_inea_station_ranking()
returns table (
  station_id uuid,
  station_name text,
  max_aqi numeric,
  max_aqi_classification text,
  measured_days integer,
  expected_days integer,
  coverage_percent numeric,
  insufficient_data_days integer,
  degraded_days integer,
  degraded_percent_of_measured_days numeric,
  degraded_percent_of_expected_days numeric,
  window_is_inferred boolean,
  caveat text
)
language sql
stable
set search_path = public
as $$
  with data_gaps as (
    select * from public.get_inea_data_gaps()
  ),
  station_max as (
    select
      m.station_id,
      max(m.air_quality_index)::numeric as max_aqi
    from public.air_measurements m
    where m.source = 'INEA'
      and m.metric_type = 'GENERAL_AQI'
      and m.quality_flag = 'OK'
      and coalesce(m.air_quality_classification, '') <> ''
    group by m.station_id
  ),
  station_max_class as (
    select distinct on (m.station_id)
      m.station_id,
      upper(trim(m.air_quality_classification)) as max_aqi_classification
    from public.air_measurements m
    join station_max sm
      on sm.station_id = m.station_id
     and sm.max_aqi = m.air_quality_index::numeric
    where m.source = 'INEA'
      and m.metric_type = 'GENERAL_AQI'
      and m.quality_flag = 'OK'
    order by m.station_id, m.measured_at asc
  )
  select
    dg.station_id,
    dg.station_name,
    coalesce(sm.max_aqi, 0) as max_aqi,
    coalesce(smc.max_aqi_classification, 'BOA') as max_aqi_classification,
    dg.measured_days,
    dg.expected_days,
    dg.coverage_percent,
    dg.insufficient_data_days,
    dg.degraded_days,
    dg.degraded_percent_of_measured_days,
    dg.degraded_percent_of_expected_days,
    dg.window_is_inferred,
    dg.caveat
  from data_gaps dg
  left join station_max sm on sm.station_id = dg.station_id
  left join station_max_class smc on smc.station_id = dg.station_id
  order by dg.degraded_percent_of_measured_days desc, coalesce(sm.max_aqi, 0) desc, dg.station_name asc;
$$;

create or replace function public.get_inea_degraded_days()
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
  window_is_inferred boolean,
  caveat text
)
language sql
stable
set search_path = public
as $$
  select
    station_id,
    station_name,
    measured_days,
    expected_days,
    coverage_percent,
    insufficient_data_days,
    degraded_days,
    degraded_percent_of_measured_days,
    degraded_percent_of_expected_days,
    window_is_inferred,
    caveat
  from public.get_inea_data_gaps()
  order by degraded_percent_of_measured_days desc, station_name asc;
$$;

grant execute on function public.get_inea_station_expected_windows() to anon, authenticated, service_role;
grant execute on function public.get_inea_daily_aqi() to anon, authenticated, service_role;
grant execute on function public.get_inea_summary() to anon, authenticated, service_role;
grant execute on function public.get_inea_monthly_profile() to anon, authenticated, service_role;
grant execute on function public.get_inea_data_gaps() to anon, authenticated, service_role;
grant execute on function public.get_inea_station_ranking() to anon, authenticated, service_role;
grant execute on function public.get_inea_degraded_days() to anon, authenticated, service_role;

comment on function public.get_inea_station_expected_windows() is 'Returns expected operational windows for INEA stations, using explicit metadata when available and bounded inference otherwise.';
comment on function public.get_inea_daily_aqi() is 'Returns one validated worst AQI classification per station-day for INEA.';
comment on function public.get_inea_summary() is 'Returns pre-aggregated Radar INEA summary metrics directly from SQL.';
comment on function public.get_inea_monthly_profile() is 'Returns monthly Radar INEA coverage and degraded-day profile using expected station windows.';
comment on function public.get_inea_data_gaps() is 'Returns station-level Radar INEA coverage, data gaps and inferred-window flags.';
comment on function public.get_inea_station_ranking() is 'Returns Radar INEA station ranking with max AQI and coverage metrics using the SQL aggregation layer.';
comment on function public.get_inea_degraded_days() is 'Returns Radar INEA degraded-day metrics ordered for public ranking without recomputation in the API layer.';
