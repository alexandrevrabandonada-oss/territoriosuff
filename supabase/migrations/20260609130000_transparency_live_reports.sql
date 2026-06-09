-- Migration: transparencia viva mensal
-- Description: estrutura editoral para leituras mensais de escutas e atividades.

create table if not exists public.transparency_live_reports (
  id uuid primary key default gen_random_uuid(),
  month_key text not null unique,
  month_label text not null,
  source_url text,
  source_label text,
  exported_at date,
  actions_count integer not null default 0,
  hearings_count integer not null default 0,
  territorial_coverage_pct numeric(5,1) not null default 0,
  territorial_status text not null default 'atencao',
  executive_summary text not null,
  methodological_alert text not null,
  operational_recommendation text not null,
  dominant_themes text[] not null default '{}'::text[],
  action_territories text[] not null default '{}'::text[],
  hearing_territories text[] not null default '{}'::text[],
  grouped_priorities jsonb not null default '[]'::jsonb,
  qualitative_signals jsonb not null default '[]'::jsonb,
  recommended_next_steps text[] not null default '{}'::text[],
  actions_performed text[] not null default '{}'::text[],
  review_pending text not null default 'Nenhuma pendencia registrada.',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transparency_live_reports_month_key_check check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  constraint transparency_live_reports_status_check check (status in ('draft', 'published', 'archived')),
  constraint transparency_live_reports_territorial_status_check check (territorial_status in ('critica', 'atencao', 'adequada'))
);

create index if not exists idx_transparency_live_reports_month_key
  on public.transparency_live_reports (month_key desc);

create index if not exists idx_transparency_live_reports_status
  on public.transparency_live_reports (status);

create index if not exists idx_transparency_live_reports_dominant_themes
  on public.transparency_live_reports using gin (dominant_themes);

alter table public.transparency_live_reports enable row level security;

drop policy if exists transparency_live_reports_select_public on public.transparency_live_reports;
create policy transparency_live_reports_select_public
  on public.transparency_live_reports
  for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists transparency_live_reports_admin_insert on public.transparency_live_reports;
create policy transparency_live_reports_admin_insert
  on public.transparency_live_reports
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists transparency_live_reports_admin_update on public.transparency_live_reports;
create policy transparency_live_reports_admin_update
  on public.transparency_live_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists transparency_live_reports_admin_delete on public.transparency_live_reports;
create policy transparency_live_reports_admin_delete
  on public.transparency_live_reports
  for delete
  to authenticated
  using (public.is_admin());

grant select on table public.transparency_live_reports to anon, authenticated;
grant insert, update, delete on table public.transparency_live_reports to authenticated;

drop trigger if exists tr_transparency_live_reports_updated_at on public.transparency_live_reports;
create trigger tr_transparency_live_reports_updated_at
  before update on public.transparency_live_reports
  for each row
  execute function public.set_updated_at();

comment on table public.transparency_live_reports is 'Fechamentos mensais publicos de escutas, atividades e encaminhamentos do SEMEAR.';

insert into public.transparency_live_reports (
  month_key,
  month_label,
  source_url,
  source_label,
  exported_at,
  actions_count,
  hearings_count,
  territorial_coverage_pct,
  territorial_status,
  executive_summary,
  methodological_alert,
  operational_recommendation,
  dominant_themes,
  action_territories,
  hearing_territories,
  grouped_priorities,
  qualitative_signals,
  recommended_next_steps,
  actions_performed,
  review_pending,
  status
) values
(
  '2026-05',
  'maio de 2026',
  'https://www.semearterritorios.online/relatorios/2026-05',
  'Relatorio mensal interpretativo',
  '2026-06-09',
  5,
  123,
  70.7,
  'atencao',
  'O mes reuniu 5 acoes e 123 escutas. Os temas dominantes foram ar/poluicao, po/sujeira, empresas, saude e qualidade de vida.',
  'Parte das escutas nao possui territorio de referencia preenchido. As leituras por bairro devem ser interpretadas como parciais.',
  'Priorizar revisao das escutas sem territorio antes de consolidar sinteses territoriais e reforcar a pergunta territorial na proxima banca.',
  array['ar/poluicao', 'po/sujeira', 'empresas', 'saude', 'qualidade de vida', 'lixo/residuos'],
  array['Vila Santa Cecilia', 'Conforto', 'Santo Agostinho', 'Sessenta'],
  array['Santo Agostinho', 'Vila Santa Cecilia', 'Sessenta', 'Conforto', 'Eucaliptal', 'Santa Cruz'],
  '[{"label":"Outros","count":34},{"label":"Ar, poluicao e po","count":29},{"label":"Limpeza urbana e coleta","count":29},{"label":"Empresas e CSN","count":20}]'::jsonb,
  '[{"label":"Cuidado coletivo","count":14},{"label":"Saude e desconforto","count":1}]'::jsonb,
  array[
    'Revisar as escutas sem territorio de referencia antes da proxima acao.',
    'Preparar devolutiva publica sobre ar/poluicao com linguagem agregada.',
    'Aprofundar o macroeixo outros no planejamento operacional.',
    'Registrar decisao de publicacao ou arquivamento da versao publica.'
  ],
  array[
    '07/05/2026 | Banca Escuta UFF Vila | Vila Santa Cecilia',
    '08/05/2026 | Feira Conforto | Conforto',
    '14/05/2026 | Feira Santo Agostinho | Santo Agostinho',
    '27/05/2026 | Feira da Sessenta | Sessenta',
    '30/05/2026 | Escuta no Zoologico VR | Vila Santa Cecilia'
  ],
  'Nenhuma pendencia de revisao no mes.',
  'published'
),
(
  '2026-04',
  'abril de 2026',
  'https://www.semearterritorios.online/relatorios/2026-04',
  'Relatorio mensal interpretativo',
  '2026-06-09',
  2,
  99,
  34.3,
  'critica',
  'O mes reuniu 2 acoes e 99 escutas. Os temas dominantes foram ar/poluicao, poder publico, po/sujeira, saude e lixo/residuos.',
  'A maioria das escutas nao possui territorio de referencia preenchido. Evite conclusoes fortes por bairro neste recorte.',
  'Priorizar revisao territorial das escutas pendentes antes de qualquer sintese por bairro e orientar a equipe para melhorar cobertura imediatamente.',
  array['ar/poluicao', 'poder publico', 'po/sujeira', 'saude', 'lixo/residuos', 'arvores/sombra'],
  array['Aterrado', 'Vila Santa Cecilia'],
  array['Retiro', 'Aterrado', 'Vila Rica', 'Agua Limpa', 'Dom Bosco', 'Minerlandia'],
  '[{"label":"Fiscalizacao e poder publico","count":28},{"label":"Outros","count":18},{"label":"Empresas e CSN","count":16},{"label":"Limpeza urbana e coleta","count":15}]'::jsonb,
  '[{"label":"Percepcao sobre poluicao","count":3},{"label":"Cuidado coletivo","count":2},{"label":"Fiscalizacao","count":1}]'::jsonb,
  array[
    'Revisar as escutas sem territorio de referencia e orientar a equipe antes da proxima acao.',
    'Preparar devolutiva sobre ar/poluicao com linguagem agregada.',
    'Aprofundar o macroeixo fiscalizacao e poder publico no planejamento operacional.',
    'Registrar decisao de publicacao ou arquivamento da versao publica.'
  ],
  array[
    '18/04/2026 | Banquinha Feira Aterrado | Aterrado',
    '26/04/2026 | Feira da Vila | Vila Santa Cecilia'
  ],
  'Nenhuma pendencia de revisao no mes.',
  'published'
)
on conflict (month_key) do update
set
  month_label = excluded.month_label,
  source_url = excluded.source_url,
  source_label = excluded.source_label,
  exported_at = excluded.exported_at,
  actions_count = excluded.actions_count,
  hearings_count = excluded.hearings_count,
  territorial_coverage_pct = excluded.territorial_coverage_pct,
  territorial_status = excluded.territorial_status,
  executive_summary = excluded.executive_summary,
  methodological_alert = excluded.methodological_alert,
  operational_recommendation = excluded.operational_recommendation,
  dominant_themes = excluded.dominant_themes,
  action_territories = excluded.action_territories,
  hearing_territories = excluded.hearing_territories,
  grouped_priorities = excluded.grouped_priorities,
  qualitative_signals = excluded.qualitative_signals,
  recommended_next_steps = excluded.recommended_next_steps,
  actions_performed = excluded.actions_performed,
  review_pending = excluded.review_pending,
  status = excluded.status;
