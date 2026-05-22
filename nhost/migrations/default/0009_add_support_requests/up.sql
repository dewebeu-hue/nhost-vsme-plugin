create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  requester_user_id uuid,
  requester_email text,
  requester_name text,
  subject text,
  message text not null,
  category text,
  status text not null default 'open',
  priority text not null default 'normal',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint support_requests_status_check
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  constraint support_requests_priority_check
    check (priority in ('low', 'normal', 'high')),
  constraint support_requests_category_check
    check (
      category is null
      or category in (
        'general',
        'questionnaire',
        'documents',
        'evidence_links',
        'sharing',
        'passport_pdf',
        'account',
        'other'
      )
    )
);

drop trigger if exists set_support_requests_updated_at on public.support_requests;
create trigger set_support_requests_updated_at
before update on public.support_requests
for each row execute function public.set_updated_at();

create index if not exists support_requests_organization_id_idx on public.support_requests(organization_id);
create index if not exists support_requests_status_idx on public.support_requests(status);
create index if not exists support_requests_created_at_idx on public.support_requests(created_at desc);
create index if not exists support_requests_priority_idx on public.support_requests(priority);
