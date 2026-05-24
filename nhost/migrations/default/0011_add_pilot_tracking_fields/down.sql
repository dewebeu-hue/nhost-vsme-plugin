drop index if exists public.organization_concierge_notes_buyer_demo_ready_at_idx;
drop index if exists public.organization_concierge_notes_pdf_tested_at_idx;
drop index if exists public.organization_concierge_notes_public_link_tested_at_idx;
drop index if exists public.organization_concierge_notes_pilot_status_idx;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_pilot_status_check;

alter table public.organization_concierge_notes
  drop column if exists buyer_demo_ready_at,
  drop column if exists pdf_tested_at,
  drop column if exists public_link_tested_at,
  drop column if exists customer_success_note,
  drop column if exists next_action,
  drop column if exists main_blocker,
  drop column if exists last_contact_summary,
  drop column if exists pilot_status;
