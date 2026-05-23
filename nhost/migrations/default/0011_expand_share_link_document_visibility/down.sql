update public.share_links
set document_visibility = 'approved_only'
where document_visibility in ('summary_only', 'all_metadata');

alter table public.share_links
  drop constraint if exists share_links_document_visibility_check;

alter table public.share_links
  add constraint share_links_document_visibility_check
    check (document_visibility in ('approved_only', 'all_linked_documents'));
