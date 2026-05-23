drop index if exists public.organizations_logo_uploaded_at_idx;

alter table public.organizations
  drop column if exists logo_alt_text,
  drop column if exists logo_uploaded_at,
  drop column if exists logo_content_type,
  drop column if exists logo_file_id;
