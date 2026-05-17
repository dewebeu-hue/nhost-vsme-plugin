drop table if exists public.audit_events cascade;
drop table if exists public.admin_notes cascade;
drop table if exists public.share_link_accesses cascade;
drop table if exists public.share_links cascade;
drop table if exists public.supplier_passports cascade;
drop table if exists public.document_links cascade;
drop table if exists public.documents cascade;
drop table if exists public.question_answers cascade;
drop table if exists public.question_items cascade;
drop table if exists public.question_sections cascade;
drop table if exists public.company_profiles cascade;
drop table if exists public.organization_members cascade;
drop table if exists public.organizations cascade;

drop function if exists public.can_manage_org(uuid);
drop function if exists public.is_org_member(uuid);
drop function if exists public.org_role(uuid);
drop function if exists public.current_hasura_user_id();
drop function if exists public.set_updated_at();
