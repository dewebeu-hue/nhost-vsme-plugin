alter table public.organization_concierge_notes
  add column if not exists portfolio_label text,
  add column if not exists partner_label text,
  add column if not exists assigned_consultant_note text;

create index if not exists organization_concierge_notes_portfolio_label_idx
  on public.organization_concierge_notes(portfolio_label);

create index if not exists organization_concierge_notes_partner_label_idx
  on public.organization_concierge_notes(partner_label);
