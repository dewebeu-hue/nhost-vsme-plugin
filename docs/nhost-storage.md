# Nhost Storage Checklist

Evidence files for Supplier Passport are stored in Nhost Storage. The `documents` table stores metadata and the Nhost file id in `documents.file_id`.

## Storage Rules

- Evidence files are not public by default.
- Store the Nhost file id in `documents.file_id`.
- `documents.file_id` references a Nhost Storage file id, but the file id is not authorization.
- Do not expose internal file paths in client UI or public share pages.
- Keep file ownership connected to `organization_id` and `uploaded_by`.
- Metadata is stored through Hasura GraphQL after upload.
- File access should respect Hasura/Nhost permissions and current organization membership.
- Normal users should access files only for organizations where they are members.

## Buyer Share Access

- Public share pages should show approved-only document metadata.
- View/download actions use the controlled server-side route `/api/share/[token]/documents/[documentId]`.
- The controlled route validates the share token before returning file access.
- Expired or inactive share links should not expose file ids or download URLs.
- Internal notes, admin notes, raw paths, and unapproved documents must stay hidden.

## Pilot Readiness Checks

- Verify Nhost Storage is enabled for the project.
- Upload a test file from `/en/dashboard/documents`.
- Confirm the file appears in Nhost Storage files.
- Upload writes the file to Nhost Storage.
- Upload inserts document metadata through Hasura.
- `documents.file_id` is present for uploaded files.
- Confirm the authenticated user can access organization files according to Nhost Storage permissions.
- Document preview/download uses the controlled public share document route for buyer access.
- Public buyer pages do not display raw storage internals.
- Public share pages do not expose raw file ids or permanent storage URLs.
- Unapproved/internal documents are not publicly accessible.
- Deleting a document removes or disables metadata and handles the storage file according to retention policy.

## Current MVP Upload Flow

1. A signed-in owner/editor/admin opens `/[locale]/dashboard/documents`.
2. The browser sends the active Nhost access token to the server route.
3. The server verifies the user, confirms their organization membership, uploads the selected file to Nhost Storage, and receives the Nhost file id.
4. The server inserts metadata into `public.documents` through Hasura GraphQL with the server-side admin secret after verifying the user and organization membership.
5. `documents.file_id` stores the Nhost Storage file id. It is not displayed in the normal UI and must not be treated as public authorization.

## Controlled Public Document Access

Public buyer document access is implemented through `/api/share/[token]/documents/[documentId]`.

The route:

1. Looks up the share token server-side.
2. Blocks inactive or expired links.
3. Requires a valid token-scoped verification cookie when the share link has `password_hash`.
4. Confirms the requested document belongs to the share link organization.
5. Applies document visibility:
   - `approved_only`: document status must be `reviewed`.
   - `all_linked_documents`: document status must be `linked` or `reviewed`, and the document must have a `document_links` relationship to an answer in the share organization.
6. Uses `documents.file_id` only server-side to retrieve the file from Nhost Storage.
7. Returns the file inline by default, or as an attachment with `?download=1`.

Limitations and setup notes:

- The route uses a server-side Nhost/Hasura admin secret for controlled file retrieval. Confirm the production Nhost Storage project accepts this server-side header for file reads.
- The route does not expose raw `file_id`, bucket paths, or permanent public URLs.
- Very large file streaming should be reviewed under production hosting limits before broad buyer rollout.
- Advanced per-document audit events can be added later if pilot requirements demand them.
