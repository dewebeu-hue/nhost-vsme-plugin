create table if not exists public.readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  snapshot_date date not null,
  readiness_percent integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint readiness_snapshots_percent_check
    check (readiness_percent >= 0 and readiness_percent <= 100),
  constraint readiness_snapshots_organization_id_snapshot_date_key
    unique (organization_id, snapshot_date)
);

create index if not exists readiness_snapshots_organization_date_idx
  on public.readiness_snapshots(organization_id, snapshot_date);
