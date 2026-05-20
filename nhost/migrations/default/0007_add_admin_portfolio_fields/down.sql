drop index if exists public.organization_concierge_notes_partner_label_idx;
drop index if exists public.organization_concierge_notes_portfolio_label_idx;

alter table public.organization_concierge_notes
  drop column if exists assigned_consultant_note,
  drop column if exists partner_label,
  drop column if exists portfolio_label;
