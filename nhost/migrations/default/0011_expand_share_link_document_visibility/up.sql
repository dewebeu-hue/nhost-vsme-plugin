alter table public.share_links
  drop constraint if exists share_links_document_visibility_check;

alter table public.share_links
  add constraint share_links_document_visibility_check
    check (document_visibility in (
      'summary_only',
      'approved_only',
      'all_linked_documents',
      'all_metadata'
    ));
