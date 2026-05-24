alter table public.organization_concierge_notes
  add column if not exists pilot_status text not null default 'not_started',
  add column if not exists last_contact_summary text,
  add column if not exists main_blocker text,
  add column if not exists next_action text,
  add column if not exists customer_success_note text,
  add column if not exists public_link_tested_at timestamptz,
  add column if not exists pdf_tested_at timestamptz,
  add column if not exists buyer_demo_ready_at timestamptz;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_pilot_status_check;

alter table public.organization_concierge_notes
  add constraint organization_concierge_notes_pilot_status_check
  check (
    pilot_status in (
      'not_started',
      'invited',
      'onboarding',
      'waiting_on_supplier',
      'ready_for_review',
      'buyer_demo_ready',
      'completed',
      'paused'
    )
  );

create index if not exists organization_concierge_notes_pilot_status_idx
  on public.organization_concierge_notes(pilot_status);

create index if not exists organization_concierge_notes_public_link_tested_at_idx
  on public.organization_concierge_notes(public_link_tested_at);

create index if not exists organization_concierge_notes_pdf_tested_at_idx
  on public.organization_concierge_notes(pdf_tested_at);

create index if not exists organization_concierge_notes_buyer_demo_ready_at_idx
  on public.organization_concierge_notes(buyer_demo_ready_at);
