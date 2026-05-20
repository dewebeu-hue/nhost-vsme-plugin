drop index if exists public.organization_concierge_notes_onboarding_completed_at_idx;
drop index if exists public.organization_concierge_notes_onboarding_status_idx;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_onboarding_status_check;

alter table public.organization_concierge_notes
  drop column if exists onboarding_completed_at,
  drop column if exists onboarding_owner_note,
  drop column if exists onboarding_checklist,
  drop column if exists onboarding_next_action,
  drop column if exists onboarding_status;
