-- Add operational update timestamp to public events.

alter table public.events
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists tr_events_updated_at on public.events;
create trigger tr_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

comment on column public.events.updated_at is 'Last operational update timestamp for agenda transparency.';
