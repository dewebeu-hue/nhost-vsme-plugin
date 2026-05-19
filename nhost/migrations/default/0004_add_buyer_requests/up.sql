create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  buyer_name text not null,
  buyer_contact_name text,
  buyer_contact_email text,
  request_title text not null,
  request_description text,
  due_date date,
  status text not null default 'draft',
  requested_sections jsonb not null default '[]'::jsonb,
  notes text,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_requests_status_check
    check (status in ('draft', 'in_progress', 'ready_to_share', 'shared', 'closed')),
  constraint buyer_requests_requested_sections_array_check
    check (jsonb_typeof(requested_sections) = 'array')
);

drop trigger if exists set_buyer_requests_updated_at on public.buyer_requests;
create trigger set_buyer_requests_updated_at
before update on public.buyer_requests
for each row execute function public.set_updated_at();

create index if not exists buyer_requests_organization_id_idx on public.buyer_requests(organization_id);
create index if not exists buyer_requests_status_idx on public.buyer_requests(status);
create index if not exists buyer_requests_due_date_idx on public.buyer_requests(due_date);
create index if not exists buyer_requests_created_at_idx on public.buyer_requests(created_at);
