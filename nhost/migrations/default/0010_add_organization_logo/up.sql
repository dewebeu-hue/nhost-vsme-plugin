alter table public.organizations
  add column if not exists logo_file_id text,
  add column if not exists logo_content_type text,
  add column if not exists logo_uploaded_at timestamptz,
  add column if not exists logo_alt_text text;

create index if not exists organizations_logo_uploaded_at_idx
  on public.organizations(logo_uploaded_at desc)
  where logo_file_id is not null;
