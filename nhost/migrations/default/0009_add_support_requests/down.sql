drop trigger if exists set_support_requests_updated_at on public.support_requests;

drop index if exists public.support_requests_priority_idx;
drop index if exists public.support_requests_created_at_idx;
drop index if exists public.support_requests_status_idx;
drop index if exists public.support_requests_organization_id_idx;

drop table if exists public.support_requests;
