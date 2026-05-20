alter table public.organization_concierge_notes
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists onboarding_next_action text,
  add column if not exists onboarding_checklist jsonb not null default '[]'::jsonb,
  add column if not exists onboarding_owner_note text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_onboarding_status_check;

alter table public.organization_concierge_notes
  add constraint organization_concierge_notes_onboarding_status_check
    check (
      onboarding_status in (
        'not_started',
        'invited',
        'setup_in_progress',
        'waiting_on_supplier',
        'ready_for_review',
        'demo_ready',
        'completed',
        'paused'
      )
    );

create index if not exists organization_concierge_notes_onboarding_status_idx
  on public.organization_concierge_notes(onboarding_status);

create index if not exists organization_concierge_notes_onboarding_completed_at_idx
  on public.organization_concierge_notes(onboarding_completed_at);
