-- Migration: Acervo upload editorial typing
-- Description: Adiciona metadados editoriais em media_assets e amplia o tipo do Acervo para categoria agregada de midia.

alter table public.media_assets
  add column if not exists acervo_content_type text,
  add column if not exists content_category text,
  add column if not exists source_date date,
  add column if not exists source_name text,
  add column if not exists source_url text;

comment on column public.media_assets.acervo_content_type is 'Classificacao editorial do asset quando enviado para o Acervo.';
comment on column public.media_assets.content_category is 'Categoria editorial macro do asset (ex.: acervo, blog, reports).';
comment on column public.media_assets.source_date is 'Data de origem do arquivo quando conhecida.';
comment on column public.media_assets.source_name is 'Nome da fonte/origem do arquivo quando conhecida.';
comment on column public.media_assets.source_url is 'URL da fonte/origem do arquivo quando conhecida.';

alter table public.acervo_items drop constraint if exists acervo_items_type_check;
alter table public.acervo_items
  add constraint acervo_items_type_check
  check (type in ('artigo_cientifico', 'noticia', 'materia', 'midia', 'foto', 'video', 'documento', 'relatorio_tecnico', 'memoria', 'outro', 'paper', 'news', 'photo', 'report', 'link'));
