-- Migration: INEA Air Quality Methodology Adjust
-- Description: Adiciona colunas para classificar tipo de métrica, índice geral e subíndices de poluente, e corrige o índice único para permitir diferenciação metodológica.

-- 1. Adicionar novas colunas na tabela public.air_measurements
alter table public.air_measurements
  add column if not exists metric_type text,
  add column if not exists air_quality_index double precision,
  add column if not exists air_quality_classification text,
  add column if not exists controlling_pollutant text,
  add column if not exists raw_column text;

-- 2. Remover índices antigos redundantes ou incorretos
drop index if exists public.ux_air_measurements_prevent_duplicates;
drop index if exists public.ux_air_measurements_prevent_duplicates_simple;

-- 3. Criar novo índice único composto que suporta diferentes tipos de métricas por período
create unique index if not exists ux_air_measurements_methodology
  on public.air_measurements (station_id, coalesce(pollutant, ''), measured_at, coalesce(averaging_period, ''), metric_type);

-- 4. Comentários descritivos sobre as novas colunas
comment on column public.air_measurements.metric_type is 'Tipo de métrica: POLLUTANT_CONCENTRATION (concentração bruta), POLLUTANT_SUBINDEX (subíndice do IQA) ou GENERAL_AQI (índice consolidado geral).';
comment on column public.air_measurements.air_quality_index is 'Valor do índice geral de qualidade do ar (IQAr), preenchido apenas para registros GENERAL_AQI.';
comment on column public.air_measurements.air_quality_classification is 'Classificação textual oficial da qualidade do ar (ex. BOA, MODERADA, RUIM).';
comment on column public.air_measurements.controlling_pollutant is 'Sigla do poluente controlador que determinou a classificação geral (ex. PM10, O3), preenchido em GENERAL_AQI.';
comment on column public.air_measurements.raw_column is 'Nome original da coluna no arquivo Excel do INEA (ex. IQA MP10, Índice IQAr).';
