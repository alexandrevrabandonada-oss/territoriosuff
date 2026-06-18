-- Seed public CRAS action agenda for Projeto UFF SEMEAR.
-- The source image shows Padre Josimo as 21/07/2023, but the weekday and
-- chronological sequence match 21/07/2026.

with agenda(cras, start_at, weekday, address, bairro) as (
  values
    ('CRAS São Carlos', '2026-06-15 14:30:00-03'::timestamptz, 'Segunda-feira', 'Rua Faria de Brito, s/nº - Bairro São Carlos', 'São Carlos'),
    ('CRAS Açude', '2026-06-25 08:30:00-03'::timestamptz, 'Quinta-feira', 'Av. Francisco Antonio Francisco, s/nº - Bairro Açude', 'Açude'),
    ('CRAS Monte Castelo', '2026-07-03 14:00:00-03'::timestamptz, 'Sexta-feira', 'Rua São Sebastião, nº 112 - Bairro Monte Castelo', 'Monte Castelo'),
    ('CRAS Rústico', '2026-07-09 14:00:00-03'::timestamptz, 'Quinta-feira', 'Praça José Gonçalves Dias, nº 142 - Bairro Rústico', 'Rústico'),
    ('CRAS Vila Rica (Igreja Viva Bem)', '2026-07-14 09:00:00-03'::timestamptz, 'Terça-feira', 'Rua 19, nº 135 - Bairro Vila Rica', 'Vila Rica'),
    ('CRAS Padre Josimo', '2026-07-21 14:30:00-03'::timestamptz, 'Terça-feira', 'Rua 7, nº 101 - Bairro Padre Josimo', 'Padre Josimo'),
    ('CRAS Açude', '2026-07-30 08:30:00-03'::timestamptz, 'Quinta-feira', 'Av. Francisco Antonio Francisco, s/nº - Bairro Açude', 'Açude'),
    ('CRAS Monte Castelo', '2026-08-07 14:00:00-03'::timestamptz, 'Sexta-feira', 'Rua São Sebastião, nº 112 - Bairro Monte Castelo', 'Monte Castelo'),
    ('CRAS Rústico', '2026-08-13 14:00:00-03'::timestamptz, 'Quinta-feira', 'Praça José Gonçalves Dias, nº 142 - Bairro Rústico', 'Rústico'),
    ('CRAS da Siderlândia', '2026-08-20 09:00:00-03'::timestamptz, 'Quinta-feira', 'Rua 10, nº 20 - Bairro Siderlândia', 'Siderlândia'),
    ('CRAS São Carlos', '2026-08-24 14:30:00-03'::timestamptz, 'Segunda-feira', 'Rua Faria de Brito, s/nº - Bairro São Carlos', 'São Carlos'),
    ('CRAS São Cristóvão', '2026-08-28 14:00:00-03'::timestamptz, 'Sexta-feira', 'Rua Leopoldina, nº 460 - Bairro São Cristóvão', 'São Cristóvão'),
    ('CRAS Padre Josimo', '2026-09-01 14:30:00-03'::timestamptz, 'Terça-feira', 'Rua 7, nº 101 - Bairro Padre Josimo', 'Padre Josimo'),
    ('CRAS da Siderlândia', '2026-09-17 09:00:00-03'::timestamptz, 'Quinta-feira', 'Rua 10, nº 20 - Bairro Siderlândia', 'Siderlândia'),
    ('CRAS Santa Rita de Cássia', '2026-09-18 09:00:00-03'::timestamptz, 'Sexta-feira', 'Rua da Granja, nº 40 - Bairro Santa Rita de Cássia', 'Santa Rita de Cássia'),
    ('CRAS São Cristóvão', '2026-09-25 14:00:00-03'::timestamptz, 'Sexta-feira', 'Rua Leopoldina, nº 460 - Bairro São Cristóvão', 'São Cristóvão'),
    ('CRAS Vila Rica (Igreja Viva Bem)', '2026-09-29 09:00:00-03'::timestamptz, 'Terça-feira', 'Rua 19, nº 135 - Bairro Vila Rica', 'Vila Rica'),
    ('CRAS Eucaliptal (Jovens)', '2026-10-07 09:00:00-03'::timestamptz, 'Quarta-feira', 'Rua Baltazar de Souza, nº 500 - Bairro Eucaliptal', 'Eucaliptal'),
    ('CRAS Santa Rita de Cássia', '2026-10-16 09:00:00-03'::timestamptz, 'Sexta-feira', 'Rua da Granja, nº 40 - Bairro Santa Rita de Cássia', 'Santa Rita de Cássia'),
    ('CRAS Eucaliptal (Jovens)', '2026-11-11 09:00:00-03'::timestamptz, 'Quarta-feira', 'Rua Baltazar de Souza, nº 500 - Bairro Eucaliptal', 'Eucaliptal')
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
  'Agenda de Ações SEMEAR - ' || cras,
  'Acao territorial do Projeto UFF SEMEAR. Dia da semana informado: ' || weekday || '. Confirmacao operacional pela equipe.',
  start_at,
  address,
  cras,
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
    or (e.title = 'Agenda de Ações SEMEAR - ' || a.cras and e.start_at = a.start_at)
);
