create table if not exists public.organization_concierge_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'not_started',
  priority text not null default 'normal',
  internal_note text,
  next_follow_up_date date,
  reviewed_at timestamptz,
  reviewed_by_user_id uuid,
  updated_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_concierge_notes_organization_id_key unique (organization_id),
  constraint organization_concierge_notes_status_check
    check (status in ('not_started', 'onboarding', 'waiting_on_supplier', 'ready_for_review', 'demo_ready', 'paused')),
  constraint organization_concierge_notes_priority_check
    check (priority in ('low', 'normal', 'high'))
);

drop trigger if exists set_organization_concierge_notes_updated_at on public.organization_concierge_notes;
create trigger set_organization_concierge_notes_updated_at
before update on public.organization_concierge_notes
for each row execute function public.set_updated_at();

create index if not exists organization_concierge_notes_organization_id_idx
  on public.organization_concierge_notes(organization_id);
create index if not exists organization_concierge_notes_status_idx
  on public.organization_concierge_notes(status);
create index if not exists organization_concierge_notes_priority_idx
  on public.organization_concierge_notes(priority);
create index if not exists organization_concierge_notes_next_follow_up_date_idx
  on public.organization_concierge_notes(next_follow_up_date);
