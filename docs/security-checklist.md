# Supplier Passport Security Checklist

This checklist covers demo and pilot readiness for the Nhost + Hasura MVP.

## Secrets And Configuration

- No Hasura admin secret is imported into client components.
- No Nhost admin secret is imported into client components.
- No admin secret uses a `NEXT_PUBLIC_` prefix.
- `.env.example` contains only empty placeholders.
- Production hosting stores server-only secrets as server environment variables.
- Browser clients use only client-safe Nhost configuration.
- `SHARE_LINK_COOKIE_SECRET` is configured as a server-only production secret.
- No `NEXT_PUBLIC_*ADMIN*` or `NEXT_PUBLIC_*SECRET*` variables are configured.
- Vercel build logs do not print secrets.
- Nhost allowed origins include the deployed Vercel/custom domain.
- Nhost auth redirect URLs include the deployed callback and locale dashboard routes used by the app.
- `/api/diagnostics/env` returns only boolean configuration status and never secret values, user data, password hashes, file ids, or storage paths.

## Tenant Isolation

- Hasura permissions use `X-Hasura-User-Id`.
- Users can select organizations only where they have an `organization_members` row.
- Users cannot read another organization's company profile.
- Users cannot read another organization's answers.
- Users cannot read another organization's documents.
- Users cannot read another organization's document links.
- Users cannot read another organization's passports.
- Users cannot read another organization's share links.
- Viewer role can read permitted organization data only.
- Viewer role cannot insert/update/delete operational data.
- Owner/editor/admin can write expected operational data.
- Owner/admin-only operations remain restricted or server-side.

## Public Share Page

- Public share token lookup runs server-side.
- Public share page validates `is_active`.
- Public share page validates `expires_at`.
- Password-protected share links do not expose buyer content before verification.
- Password verification runs server-side only.
- `password_hash` is never sent to the browser.
- Protected share content is not rendered into HTML before verification.
- Verification uses an HTTP-only cookie.
- Verification is scoped to the specific share token.
- Expired/inactive links remain blocked even after password submission.
- Incorrect password attempts show a safe, localized error and do not expose protected content.
- Public share page never returns internal notes.
- Public share page never returns admin notes.
- Public share page never returns `organization_members`.
- Public share page never returns billing/subscription fields.
- Public share page never returns audit internals.
- Public share page never returns raw `file_id`.
- Public share page never returns raw storage paths.
- Public share page never returns unapproved/internal documents.
- Public sample share page uses safe mock data only.

## Documents And Storage

- `documents.file_id` stores Nhost Storage file id.
- File ids are not treated as authorization.
- Evidence files are not public by default.
- Buyer document view/download uses the controlled server-side route `/api/share/[token]/documents/[documentId]`.
- Controlled document route validates the share token.
- Controlled document route validates `is_active` and `expires_at`.
- Controlled document route validates password verification for protected links.
- Controlled document route validates the document belongs to the share link organization.
- Approved-only mode returns only reviewed buyer-safe documents.
- All-linked-documents mode requires a linked/reviewed document with a `document_links` relationship for the share organization.
- Cross-organization document ids are blocked.
- Unapproved/internal documents are not accessible by guessing `documentId`.
- Expired/inactive share links do not expose file access.
- Public share document actions never expose raw `file_id` or storage paths.
- Upload flow inserts metadata through Hasura with user permissions.
- Normal users cannot update `reviewed_by` or `reviewed_at`.

## Questionnaire And Evidence Linking

- `question_answers` select is organization-member scoped.
- `question_answers` insert/update is owner/editor/admin scoped.
- `document_links` select is organization-member scoped through document or answer relationships.
- `document_links` insert/delete is owner/editor/admin scoped.
- Linking requires both linked document and answer to belong to the user's organization.
- Reviewed status remains reviewer/admin controlled when permissions are tightened.

## Supplier Passport And Share Links

- `supplier_passports` select is organization-member scoped.
- `supplier_passports` insert/update is owner/editor/admin scoped.
- `share_links` select is organization-member scoped.
- `share_links` insert/update/revoke is owner/editor/admin scoped.
- Share link password is stored as a hash, never plain text.
- Share link token is generated with secure random bytes.
- Public share payload is filtered to buyer-safe fields.

## Mock Mode

- Mock mode is activated only when Nhost is missing or live data cannot be loaded safely.
- Mock mode does not write fake data to production.
- Mock mode sample share data contains no sensitive real information.
- Mock mode notices are user-friendly and do not expose raw errors.

## Error Handling

- Raw GraphQL errors are not shown to users.
- Raw Hasura errors are not shown to users.
- Raw Nhost errors are not shown to users.
- Permission failures show user-friendly messages.
- Upload failures show user-friendly messages.
- Share-token failures show expired/inactive/not-found states.

## Follow-Up Security Work

- Add basic rate limiting or abuse protection to password attempts.
- Confirm Nhost Storage accepts server-side admin-secret file reads in the target production project.
- Add audit events for passport generation, share link creation, share access, and document linking if required for pilot.
