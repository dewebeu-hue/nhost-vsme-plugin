alter table public.organization_concierge_notes
  add column if not exists commercial_plan text,
  add column if not exists commercial_segment text,
  add column if not exists commercial_status text,
  add column if not exists commercial_note text,
  add column if not exists pilot_start_date date,
  add column if not exists pilot_target_date date;

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_plan_check;

alter table public.organization_concierge_notes
  add constraint organization_concierge_notes_commercial_plan_check
  check (
    commercial_plan is null or
    commercial_plan in (
      'starter',
      'supplier_pro',
      'partner',
      'buyer_pilot',
      'buyer_pro_future'
    )
  );

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_segment_check;

alter table public.organization_concierge_notes
  add constraint organization_concierge_notes_commercial_segment_check
  check (
    commercial_segment is null or
    commercial_segment in (
      'supplier',
      'partner',
      'buyer',
      'consultant',
      'internal_demo'
    )
  );

alter table public.organization_concierge_notes
  drop constraint if exists organization_concierge_notes_commercial_status_check;

alter table public.organization_concierge_notes
  add constraint organization_concierge_notes_commercial_status_check
  check (
    commercial_status is null or
    commercial_status in (
      'lead',
      'pilot',
      'active',
      'paused',
      'churn_risk',
      'closed'
    )
  );

create index if not exists organization_concierge_notes_commercial_plan_idx
  on public.organization_concierge_notes(commercial_plan);

create index if not exists organization_concierge_notes_commercial_segment_idx
  on public.organization_concierge_notes(commercial_segment);

create index if not exists organization_concierge_notes_commercial_status_idx
  on public.organization_concierge_notes(commercial_status);

create index if not exists organization_concierge_notes_pilot_target_date_idx
  on public.organization_concierge_notes(pilot_target_date);
