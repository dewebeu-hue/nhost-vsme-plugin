drop index if exists public.organization_concierge_notes_pilot_target_date_idx;
drop index if exists public.organization_concierge_notes_commercial_status_idx;
drop index if exists public.organization_concierge_notes_commercial_segment_idx;
drop index if exists public.organization_concierge_notes_commercial_plan_idx;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_status_check;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_segment_check;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_plan_check;

alter table public.organization_concierge_notes
  drop column if exists pilot_target_date,
  drop column if exists pilot_start_date,
  drop column if exists commercial_note,
  drop column if exists commercial_status,
  drop column if exists commercial_segment,
  drop column if exists commercial_plan;
