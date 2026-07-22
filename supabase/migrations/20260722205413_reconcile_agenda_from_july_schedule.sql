-- Reconcile the public agenda with the schedule received on 2026-07-22.
-- Adds the two Pre-Vestibular meetings and corrects Santa Rita de Cassia
-- from 18/09/2026 to 11/09/2026 while preserving the existing event id.

update public.events
set
  start_at = '2026-09-11 09:00:00-03'::timestamptz,
  slug = 'agenda-acoes-semear-2026-09-11',
  description = 'Acao territorial do Projeto UFF SEMEAR. Dia da semana informado: Sexta-feira. Confirmacao operacional pela equipe.'
where slug = 'agenda-acoes-semear-2026-09-18'
  and title = 'Agenda de Ações SEMEAR - CRAS Santa Rita de Cássia';

with agenda(title, start_at, weekday, address, location_name, bairro, encounter) as (
  values
    (
      'Agenda de Ações SEMEAR - Pré-Vestibular',
      '2026-08-15 11:30:00-03'::timestamptz,
      'Sábado',
      'Rua Francisco Torres, 1473 - Candelária',
      'Pré-Vestibular',
      'Candelária',
      'Primeiro encontro'
    ),
    (
      'Agenda de Ações SEMEAR - Pré-Vestibular',
      '2026-10-03 11:30:00-03'::timestamptz,
      'Sábado',
      'Rua Francisco Torres, 1473 - Candelária',
      'Pré-Vestibular',
      'Candelária',
      'Segundo encontro'
    )
)
insert into public.events (
  title,
  description,
  start_at,
  location,
  location_name,
  bairro,
  slug,
  type,
  status,
  registration_enabled
)
select
  title,
  'Acao territorial do Projeto UFF SEMEAR. ' || encounter || '. Dia da semana informado: ' || weekday || '. Confirmacao operacional pela equipe.',
  start_at,
  address,
  location_name,
  bairro,
  'agenda-acoes-semear-' || to_char(start_at at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
  'acao_territorial',
  'published',
  false
from agenda a
where not exists (
  select 1
  from public.events e
  where e.slug = 'agenda-acoes-semear-' || to_char(a.start_at at time zone 'America/Sao_Paulo', 'YYYY-MM-DD')
    or (e.title = a.title and e.start_at = a.start_at)
);
