drop trigger if exists set_buyer_requests_updated_at on public.buyer_requests;

drop index if exists public.buyer_requests_created_at_idx;
drop index if exists public.buyer_requests_due_date_idx;
drop index if exists public.buyer_requests_status_idx;
drop index if exists public.buyer_requests_organization_id_idx;

drop table if exists public.buyer_requests;
