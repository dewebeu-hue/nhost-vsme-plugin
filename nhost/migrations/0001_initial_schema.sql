create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  vat_id text,
  industry text,
  employee_count_range text,
  headquarters_city text,
  headquarters_country text,
  countries_served text[] not null default '{}',
  is_verified boolean not null default false,
  plan_key text not null default 'starter',
  billing_interval text not null default 'monthly',
  subscription_status text not null default 'trialing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_plan_key_check
    check (plan_key in ('starter', 'supplier_pro', 'partner', 'buyer_pilot', 'buyer_pro')),
  constraint organizations_billing_interval_check
    check (billing_interval in ('monthly', 'yearly')),
  constraint organizations_subscription_status_check
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid'))
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  created_at timestamptz not null default now(),
  constraint organization_members_role_check
    check (role in ('owner', 'editor', 'viewer', 'admin')),
  constraint organization_members_organization_id_user_id_key
    unique (organization_id, user_id)
);

create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  legal_name text,
  trade_name text,
  vat_id text,
  website text,
  description text,
  primary_contact_name text,
  primary_contact_email text,
  industries text[] not null default '{}',
  certifications text[] not null default '{}',
  employee_count_range text,
  countries_served text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.question_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.question_sections(id) on delete cascade,
  code text not null unique,
  title text not null,
  help_text text,
  answer_type text not null,
  unit text,
  options jsonb not null default '{}'::jsonb,
  evidence_required boolean not null default false,
  questionnaire_level text not null default 'basic',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint question_items_answer_type_check
    check (answer_type in ('text', 'number', 'boolean', 'select', 'date', 'multi_select', 'textarea')),
  constraint question_items_questionnaire_level_check
    check (questionnaire_level in ('basic', 'full'))
);

create table if not exists public.question_answers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  question_item_id uuid not null references public.question_items(id) on delete cascade,
  value jsonb,
  status text not null default 'not_started',
  internal_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_answers_organization_id_question_item_id_key
    unique (organization_id, question_item_id),
  constraint question_answers_status_check
    check (status in ('not_started', 'in_progress', 'completed', 'needs_evidence', 'reviewed'))
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid,
  file_id text,
  file_name text not null,
  file_size_bytes bigint,
  mime_type text,
  document_type text not null default 'other',
  status text not null default 'uploaded',
  expires_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_document_type_check
    check (document_type in ('certificate', 'utility_bill', 'policy', 'waste_report', 'safety', 'customer_questionnaire', 'other', 'report', 'training')),
  constraint documents_status_check
    check (status in ('uploaded', 'linked', 'reviewed', 'expiring_soon', 'needs_review'))
);

create table if not exists public.document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  question_answer_id uuid not null references public.question_answers(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint document_links_document_id_question_answer_id_key
    unique (document_id, question_answer_id)
);

create table if not exists public.supplier_passports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null default 'Supplier Passport',
  status text not null default 'draft',
  readiness_score integer not null default 0,
  generated_by uuid,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_passports_status_check
    check (status in ('draft', 'generated', 'shared', 'archived')),
  constraint supplier_passports_readiness_score_check
    check (readiness_score >= 0 and readiness_score <= 100)
);

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.supplier_passports(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token text not null unique,
  buyer_name text,
  buyer_email text,
  password_hash text,
  expires_at timestamptz,
  is_active boolean not null default true,
  document_visibility text not null default 'approved_only',
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint share_links_document_visibility_check
    check (document_visibility in ('approved_only', 'all_linked_documents'))
);

create table if not exists public.share_link_accesses (
  id uuid primary key default gen_random_uuid(),
  share_link_id uuid not null references public.share_links(id) on delete cascade,
  accessed_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid,
  note text not null,
  is_internal boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_company_profiles_updated_at on public.company_profiles;
create trigger set_company_profiles_updated_at
before update on public.company_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_question_answers_updated_at on public.question_answers;
create trigger set_question_answers_updated_at
before update on public.question_answers
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_supplier_passports_updated_at on public.supplier_passports;
create trigger set_supplier_passports_updated_at
before update on public.supplier_passports
for each row execute function public.set_updated_at();

create index if not exists organization_members_user_id_idx on public.organization_members(user_id);
create index if not exists organization_members_organization_id_idx on public.organization_members(organization_id);
create index if not exists company_profiles_organization_id_idx on public.company_profiles(organization_id);
create index if not exists question_items_section_id_idx on public.question_items(section_id);
create index if not exists question_answers_organization_id_idx on public.question_answers(organization_id);
create index if not exists question_answers_question_item_id_idx on public.question_answers(question_item_id);
create index if not exists documents_organization_id_idx on public.documents(organization_id);
create index if not exists documents_status_idx on public.documents(status);
create index if not exists documents_document_type_idx on public.documents(document_type);
create index if not exists document_links_document_id_idx on public.document_links(document_id);
create index if not exists document_links_question_answer_id_idx on public.document_links(question_answer_id);
create index if not exists supplier_passports_organization_id_idx on public.supplier_passports(organization_id);
create index if not exists share_links_token_idx on public.share_links(token);
create index if not exists share_links_organization_id_idx on public.share_links(organization_id);
create index if not exists share_links_passport_id_idx on public.share_links(passport_id);
create index if not exists share_links_is_active_idx on public.share_links(is_active);
create index if not exists share_link_accesses_share_link_id_idx on public.share_link_accesses(share_link_id);
create index if not exists admin_notes_organization_id_idx on public.admin_notes(organization_id);
create index if not exists audit_events_organization_id_idx on public.audit_events(organization_id);
create index if not exists audit_events_event_type_idx on public.audit_events(event_type);
