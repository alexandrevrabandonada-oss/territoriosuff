create or replace function public.get_inea_controller_frequency()
returns table (
  pollutant text,
  count bigint,
  percentage numeric
)
language sql
stable
set search_path = public
as $$
  with controller_counts as (
    select
      upper(trim(controlling_pollutant)) as pollutant,
      count(*)::bigint as total
    from public.air_measurements
    where source = 'INEA'
      and metric_type = 'GENERAL_AQI'
      and controlling_pollutant is not null
      and trim(controlling_pollutant) <> ''
    group by upper(trim(controlling_pollutant))
  ),
  totals as (
    select coalesce(sum(total), 0)::numeric as total_with_controller
    from controller_counts
  )
  select
    cc.pollutant,
    cc.total as count,
    round(
      case
        when t.total_with_controller > 0 then (cc.total::numeric / t.total_with_controller) * 100
        else 0
      end,
      1
    ) as percentage
  from controller_counts cc
  cross join totals t
  order by cc.total desc, cc.pollutant asc;
$$;

grant execute on function public.get_inea_controller_frequency() to anon, authenticated, service_role;

comment on function public.get_inea_controller_frequency() is 'Distribuição percentual do poluente controlador nas leituras GENERAL_AQI do INEA.';

create or replace function public.get_inea_classification_days(
  p_station_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  station_id uuid,
  boa integer,
  moderada integer,
  ruim integer,
  muito_ruim integer,
  pessima integer,
  moderate_or_worse_days integer,
  total_days integer
)
language sql
stable
set search_path = public
as $$
  with filtered_daily as (
    select
      d.station_id,
      d.measured_date,
      d.worst_classification
    from public.get_inea_daily_aqi() d
    where (p_station_id is null or d.station_id = p_station_id)
      and (p_from is null or d.measured_date >= p_from::date)
      and (p_to is null or d.measured_date <= p_to::date)
  )
  select
    fd.station_id,
    count(*) filter (where fd.worst_classification = 'BOA')::integer as boa,
    count(*) filter (where fd.worst_classification = 'MODERADA')::integer as moderada,
    count(*) filter (where fd.worst_classification = 'RUIM')::integer as ruim,
    count(*) filter (where fd.worst_classification = 'MUITO RUIM')::integer as muito_ruim,
    count(*) filter (where fd.worst_classification = 'PÉSSIMA')::integer as pessima,
    count(*) filter (where fd.worst_classification in ('MODERADA', 'RUIM', 'MUITO RUIM', 'PÉSSIMA'))::integer as moderate_or_worse_days,
    count(*)::integer as total_days
  from filtered_daily fd
  group by fd.station_id
  order by fd.station_id;
$$;

grant execute on function public.get_inea_classification_days(uuid, timestamptz, timestamptz) to anon, authenticated, service_role;

comment on function public.get_inea_classification_days(uuid, timestamptz, timestamptz) is 'Quebra diária por classificação oficial pior do dia, por estação, com filtros opcionais de estação e período.';
