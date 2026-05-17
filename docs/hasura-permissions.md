# Hasura Permissions Plan

Supplier Passport uses Nhost Auth, Nhost PostgreSQL, and Hasura GraphQL. Hasura permissions are the active tenant isolation and access-control model.

This repository does not currently manage Hasura metadata files. Configure the permissions below manually in Hasura Console after tracking the schema tables and relationships.

## Session Variables

Expected authenticated Hasura role:

- `user`

Required Nhost Auth session variable:

- `X-Hasura-User-Id`

The core membership rule is:

```text
organization_members.user_id = X-Hasura-User-Id
```

Never rely only on frontend checks for tenant isolation. UI controls can improve usability, but Hasura permissions must enforce access.

## Roles

Application roles stored in `organization_members.role`:

- `owner`
- `editor`
- `viewer`
- `admin`

Role behavior:

- `viewer`: read-only organization access
- `editor`: read and write operational data
- `owner`: read, write, manage members/share links where enabled
- `admin`: internal/concierge-capable organization admin role

## Required Hasura Relationships

Track all public tables, then add or confirm these relationships.

### `organizations`

- array relationship `organization_members`
- object relationship `company_profile`
- array relationship `question_answers`
- array relationship `documents`
- array relationship `supplier_passports`
- array relationship `share_links`
- array relationship `admin_notes`
- array relationship `audit_events`

### `organization_members`

- object relationship `organization`

### `company_profiles`

- object relationship `organization`

### `question_sections`

- array relationship `question_items`

### `question_items`

- object relationship `section`
- array relationship `question_answers`

### `question_answers`

- object relationship `organization`
- object relationship `question_item`
- array relationship `document_links`

### `documents`

- object relationship `organization`
- array relationship `document_links`

### `document_links`

- object relationship `document`
- object relationship `question_answer`

### `supplier_passports`

- object relationship `organization`
- array relationship `share_links`

### `share_links`

- object relationship `organization`
- object relationship `passport`
- array relationship `accesses`

### `share_link_accesses`

- object relationship `share_link`

## Reusable Permission Conditions

For tables with an `organization` object relationship:

### Organization Member Read

```json
{
  "organization": {
    "organization_members": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  }
}
```

### Owner / Editor / Admin Write

```json
{
  "organization": {
    "organization_members": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      },
      "role": {
        "_in": ["owner", "editor", "admin"]
      }
    }
  }
}
```

### Owner / Admin Management

```json
{
  "organization": {
    "organization_members": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      },
      "role": {
        "_in": ["owner", "admin"]
      }
    }
  }
}
```

For tables without a direct `organization` relationship, use the nearest nested relationship through `document`, `question_answer`, `passport`, or `share_link`.

## Table-by-Table Permissions

### `organizations`

Select:

- Allow `user` to select organizations where they are a member.
- Condition:

```json
{
  "organization_members": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  }
}
```

Insert:

- Preferred MVP approach: onboarding uses a server-side route/action with safe credentials.
- Server creates `organizations`, then creates `organization_members` with role `owner`.
- If direct Hasura insert is enabled later, allow only:
  - `name`
  - `slug`
  - `vat_id`
  - `industry`
  - `employee_count_range`
  - `headquarters_city`
  - `headquarters_country`
  - `countries_served`
- Do not allow client inserts for:
  - `plan_key`
  - `billing_interval`
  - `subscription_status`
  - `is_verified`

Update:

- Owner/admin can update basic organization fields.
- Do not allow normal client updates to `plan_key`, `billing_interval`, `subscription_status`, or `is_verified`.

Delete:

- No normal user delete for MVP.

### `organization_members`

Select:

- Organization members can select member rows for their own organizations.

Insert:

- Owner/admin can add members to their organization.
- Initial onboarding member creation should remain server-side.

Update:

- Owner/admin can update member roles.
- Users must not be able to escalate their own role. If this is not enforceable cleanly in Hasura, keep member role management server-side for MVP.

Delete:

- Owner/admin can remove members.
- Self-removal can be deferred.

### `company_profiles`

Select:

- Organization members can select the company profile for their organization.

Insert:

- Owner/editor/admin can insert a profile for their organization.

Update:

- Owner/editor/admin can update the profile for their organization.

Delete:

- No delete for MVP, or owner/admin only if needed.

### `question_sections`

Select:

- Authenticated `user` role can select all sections.

Insert/update/delete:

- No normal user access.
- Managed by admin/metadata/system process only.

### `question_items`

Select:

- Authenticated `user` role can select all questions.

Insert/update/delete:

- No normal user access.
- Managed by admin/metadata/system process only.

Note:

- Starter/basic questionnaire filtering is app logic for now. Plan limits are not implemented in this phase.

### `question_answers`

Select:

- Organization members can select answers for their organization.

Insert:

- Owner/editor/admin can insert answers for their organization.

Update:

- Owner/editor/admin can update answers for their organization.

Column notes:

- `reviewed_by`, `reviewed_at`, and setting `status = reviewed` should eventually be reviewer/admin controlled.
- For MVP, prefer excluding `reviewed_by` and `reviewed_at` from normal update columns.

Delete:

- No delete for MVP, or owner/admin only if required.

### `documents`

Select:

- Organization members can select document metadata for their organization.

Insert:

- Owner/editor/admin can insert document metadata for their organization.
- Allow only these insert columns for normal users:
  - `organization_id`
  - `uploaded_by`
  - `file_id`
  - `file_name`
  - `file_size_bytes`
  - `mime_type`
  - `document_type`
  - `status`
  - `expires_at`

Update:

- Owner/editor/admin can update document metadata for their organization.
- Allow only these update columns for normal users:
  - `file_name`
  - `document_type`
  - `status`
  - `expires_at`

Column notes:

- Do not allow normal users to update `reviewed_by` or `reviewed_at`.
- Setting `status = reviewed` should eventually be reviewer/admin controlled.
- Nhost Storage file access is controlled separately from row metadata.

Delete:

- Owner/admin only.

### `document_links`

Select:

- Organization members can select links where the linked document or linked answer belongs to their organization.

Document-based condition concept:

```json
{
  "document": {
    "organization": {
      "organization_members": {
        "user_id": {
          "_eq": "X-Hasura-User-Id"
        }
      }
    }
  }
}
```

Insert:

- Owner/editor/admin can create links for documents and answers in their organization.
- Enforce both sides through nested `document.organization.organization_members` and `question_answer.organization.organization_members` conditions where possible.

Update:

- No update needed.

Delete:

- Owner/editor/admin can unlink.

### `supplier_passports`

Select:

- Organization members can select passports for their organization.

Insert:

- Owner/editor/admin can create passports for their organization.

Update:

- Owner/editor/admin can update passports for their organization.

Delete:

- No delete for MVP, or owner/admin only.

### `share_links`

Select:

- Organization members can select share links for their organization.

Insert:

- Owner/editor/admin can create share links for their organization.

Update:

- Owner/editor/admin can update or revoke share links for their organization.

Delete:

- No delete for MVP, or owner/admin only.

Important:

- Public share pages should not rely on broad anonymous select against `share_links`.
- If anonymous GraphQL access is introduced later, expose only a safe restricted view/function/action.

### `share_link_accesses`

Select:

- Organization members can see access logs for share links in their organization.

Nested condition concept:

```json
{
  "share_link": {
    "organization": {
      "organization_members": {
        "user_id": {
          "_eq": "X-Hasura-User-Id"
        }
      }
    }
  }
}
```

Insert:

- Public share access logging should use a safe server-side function/API route.
- Avoid broad anonymous insert.

Update/delete:

- No normal user access.

### `admin_notes`

Select:

- Internal admin/concierge only.
- Do not expose to the public share page.
- Do not expose broadly to normal supplier users unless explicitly intended.

Insert/update/delete:

- Internal admin/concierge only.

MVP note:

- Until concierge authentication is finalized, keep `admin_notes` server/admin-only.

### `audit_events`

Select:

- Organization owner/admin can read audit events for their organization.
- Optionally all organization members can read if transparency is desired.

Insert:

- Server-side/app actions should insert audit events.
- Avoid arbitrary client inserts.

Update/delete:

- No normal user access.

## Public Share Access Strategy

Preferred MVP approach:

1. Public route receives `/:locale/share/:token`.
2. Server-side code looks up `share_links` by token.
3. Server validates:
   - `is_active = true`
   - `expires_at is null or expires_at > now()`
   - password when `password_hash` is present
   - document visibility rules
4. Server returns only buyer-safe data:
   - company summary
   - passport readiness score
   - approved/shared sections
   - approved document metadata
   - safe document access links when implemented

Never return on public share pages:

- internal notes
- admin notes
- raw file paths
- private storage internals
- unapproved documents
- `organization_members`
- audit internals
- billing/subscription fields

Anonymous Hasura permissions:

- Prefer no broad anonymous access to raw tables.
- If anonymous GraphQL is used later, restrict it to a safe view, function, or action specifically designed for public share tokens.

Current MVP implementation notes:

- Real public share tokens are resolved server-side and filtered into a buyer-safe payload.
- `/share/acme-manufacturing` remains a mock fallback route for demos without a live token.
- Password-protected links use a dedicated server route for password verification and a token-scoped HTTP-only verification cookie before buyer content is rendered.
- Public document view/download actions use `/api/share/[token]/documents/[documentId]`, which validates token, expiry, password verification, organization ownership, and document visibility before retrieving files server-side.

## Real Two-User Permission Validation

Run this validation before pilot deployment. The goal is to prove tenant isolation with two real Nhost users and two real organizations.

### Test Setup

1. Create User A in Nhost Auth.
2. Create User B in Nhost Auth.
3. Optional: create User C in Nhost Auth for viewer-role testing.
4. Create Organization A.
5. Create Organization B.
6. Insert organization memberships:
   - User A -> Organization A -> `owner`
   - User B -> Organization B -> `owner`
   - Optional User C -> Organization A -> `viewer`
7. Add at least one questionnaire answer, document, document link, passport, and share link for each organization.

Use the Nhost Auth user UUIDs as `organization_members.user_id`. Do not use emails in membership rows.

### SQL Inspection Snippets

Use these in Hasura SQL, psql, or your database console to confirm fixture setup. Replace the placeholder UUIDs.

```sql
select id, name, slug, plan_key, billing_interval, subscription_status
from public.organizations
order by created_at desc;
```

```sql
select organization_id, user_id, role, created_at
from public.organization_members
where user_id in (
  '00000000-0000-0000-0000-00000000000a',
  '00000000-0000-0000-0000-00000000000b',
  '00000000-0000-0000-0000-00000000000c'
)
order by created_at desc;
```

```sql
select id, organization_id, question_item_id, status, updated_at
from public.question_answers
where organization_id in (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-0000000000bb'
)
order by updated_at desc;
```

```sql
select id, organization_id, file_name, document_type, status, file_id, created_at
from public.documents
where organization_id in (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-0000000000bb'
)
order by created_at desc;
```

```sql
select dl.id, dl.document_id, d.organization_id as document_org_id,
       dl.question_answer_id, qa.organization_id as answer_org_id,
       dl.created_at
from public.document_links dl
join public.documents d on d.id = dl.document_id
join public.question_answers qa on qa.id = dl.question_answer_id
order by dl.created_at desc;
```

```sql
select id, organization_id, status, readiness_score, generated_at
from public.supplier_passports
order by created_at desc;
```

```sql
select id, organization_id, token, buyer_name, is_active, expires_at, document_visibility
from public.share_links
order by created_at desc;
```

### GraphQL Select Tests

Run these in Hasura GraphiQL with the request headers for User A, then repeat as User B.

Header example:

```json
{
  "Authorization": "Bearer <USER_ACCESS_TOKEN>"
}
```

If you are testing directly in Hasura Console without an Authorization bearer, use session variables that match the Nhost JWT claims:

```json
{
  "x-hasura-role": "user",
  "x-hasura-user-id": "00000000-0000-0000-0000-00000000000a"
}
```

Current organizations:

```graphql
query CurrentOrganizations {
  organizations {
    id
    name
    slug
  }
}
```

Expected:

- User A sees only Organization A.
- User B sees only Organization B.
- Viewer User C sees Organization A only.

Question answers:

```graphql
query VisibleAnswers {
  question_answers {
    id
    organization_id
    status
    question_item {
      code
      title
    }
  }
}
```

Expected:

- Each user sees only answers for organizations where they are a member.

Documents:

```graphql
query VisibleDocuments {
  documents {
    id
    organization_id
    file_name
    document_type
    status
  }
}
```

Expected:

- Each user sees only their organization's document metadata.
- No user should see another organization's `file_id` unless they are a member and the selected columns allow it.

Share links:

```graphql
query VisibleShareLinks {
  share_links {
    id
    organization_id
    token
    buyer_name
    is_active
  }
}
```

Expected:

- Each user sees only share links for their organization.

Document links:

```graphql
query VisibleDocumentLinks {
  document_links {
    id
    document_id
    question_answer_id
    document {
      organization_id
      file_name
    }
    question_answer {
      organization_id
      status
      question_item {
        code
      }
    }
  }
}
```

Expected:

- Each user sees only links where the linked document and linked answer belong to their organization.

### GraphQL Mutation Tests

Run these first as User A against Organization A. They should succeed for `owner`, `editor`, and `admin`, and fail for `viewer`.

Insert or update a question answer:

```graphql
mutation UpsertAnswer($object: question_answers_insert_input!) {
  insert_question_answers_one(
    object: $object
    on_conflict: {
      constraint: question_answers_organization_id_question_item_id_key
      update_columns: [value, status, internal_note]
    }
  ) {
    id
    organization_id
    status
  }
}
```

Variables:

```json
{
  "object": {
    "organization_id": "ORGANIZATION_A_ID",
    "question_item_id": "QUESTION_ITEM_ID",
    "value": "125000",
    "status": "completed",
    "internal_note": null
  }
}
```

Insert document metadata:

```graphql
mutation InsertDocument($object: documents_insert_input!) {
  insert_documents_one(object: $object) {
    id
    organization_id
    file_name
    file_id
    status
  }
}
```

Variables:

```json
{
  "object": {
    "organization_id": "ORGANIZATION_A_ID",
    "uploaded_by": "USER_A_ID",
    "file_id": "nhost-file-id-from-storage",
    "file_name": "Permission Test.pdf",
    "file_size_bytes": 12345,
    "mime_type": "application/pdf",
    "document_type": "other",
    "status": "uploaded",
    "expires_at": null
  }
}
```

Create a document link:

```graphql
mutation LinkDocumentToAnswer($object: document_links_insert_input!) {
  insert_document_links_one(
    object: $object
    on_conflict: {
      constraint: document_links_document_id_question_answer_id_key
      update_columns: [created_at]
    }
  ) {
    id
    document_id
    question_answer_id
  }
}
```

Variables:

```json
{
  "object": {
    "document_id": "ORGANIZATION_A_DOCUMENT_ID",
    "question_answer_id": "ORGANIZATION_A_ANSWER_ID"
  }
}
```

Generate a Supplier Passport:

```graphql
mutation InsertPassport($object: supplier_passports_insert_input!) {
  insert_supplier_passports_one(object: $object) {
    id
    organization_id
    status
    readiness_score
    generated_at
  }
}
```

Variables:

```json
{
  "object": {
    "organization_id": "ORGANIZATION_A_ID",
    "title": "Supplier Passport",
    "status": "generated",
    "readiness_score": 50,
    "generated_by": "USER_A_ID",
    "generated_at": "2026-05-18T00:00:00Z"
  }
}
```

Create a share link:

```graphql
mutation InsertShareLink($object: share_links_insert_input!) {
  insert_share_links_one(object: $object) {
    id
    organization_id
    token
    buyer_name
    is_active
  }
}
```

Variables:

```json
{
  "object": {
    "passport_id": "ORGANIZATION_A_PASSPORT_ID",
    "organization_id": "ORGANIZATION_A_ID",
    "token": "permission-test-token-a",
    "buyer_name": "Permission Test Buyer",
    "buyer_email": "buyer@example.com",
    "password_hash": null,
    "expires_at": null,
    "is_active": true,
    "document_visibility": "approved_only",
    "created_by": "USER_A_ID"
  }
}
```

Negative tests:

- Run each mutation as User A using Organization B ids. It should fail or affect zero rows.
- Run each mutation as User B using Organization A ids. It should fail or affect zero rows.
- Run each mutation as viewer User C. It should fail.

### Viewer Role Validation

1. Add User C to Organization A with `role = viewer`.
2. Log in as User C.
3. Confirm dashboard, questionnaire, and document metadata load for Organization A.
4. Confirm User C cannot save questionnaire answers.
5. Confirm User C cannot upload document metadata.
6. Confirm User C cannot link evidence.
7. Confirm User C cannot generate a Supplier Passport.
8. Confirm User C cannot create a share link.
9. Confirm User C cannot update or revoke share links.

Expected:

- Select operations work for organization-scoped allowed data.
- Insert/update/delete operations fail with a permission error or affect zero rows.
- The app should show user-friendly errors and not raw Hasura details.

### Public Share Safety Validation

Open a generated public share link in a signed-out or private browser session.

Confirm the public page does not expose:

- internal notes
- admin notes
- raw `file_id`
- Nhost Storage paths
- direct private file URLs
- `organization_members`
- billing/subscription fields
- unapproved/internal documents
- audit internals

Confirm:

- inactive links show unavailable state
- expired links show unavailable state
- password-protected links show a password screen and do not render buyer content before successful server-side verification
- correct password unlocks only the matching share token for the cookie lifetime
- incorrect passwords show a safe error without exposing protected content
- reviewed documents on approved-only links can be opened only through the controlled document route
- unreviewed, cross-organization, inactive, expired, or password-unverified document URLs are blocked
- `/en/share/acme-manufacturing` remains safe mock data

### Troubleshooting

Relationship missing from permission dropdown:

- Track the foreign key relationship in Hasura.
- Add the object/array relationship name expected by the permission condition.
- Reopen the permission editor after saving relationships.

`X-Hasura-User-Id` does not match `organization_members.user_id`:

- Confirm the Nhost Auth user id is a UUID.
- Confirm the membership row uses the Auth user id, not email.
- Inspect JWT/session variables in Hasura GraphiQL headers.

Table returns empty arrays:

- Empty arrays usually mean the select permission condition filtered every row.
- Confirm the table is tracked.
- Confirm the user has a membership row.
- Confirm the relationship path in the permission condition matches the tracked relationship name.

Mutation returns permission errors:

- Confirm the role has insert/update permission.
- Confirm allowed columns include every column in the mutation.
- Confirm the check condition allows the organization id being written.
- Confirm update permissions include both filter and pre-update check where needed.

Onboarding works but client queries fail:

- Onboarding uses server-side credentials for atomic workspace creation.
- Client reads/writes still require Hasura `user` role permissions.
- Confirm `organization_members` was created for the authenticated user.

Wrong relationship name:

- Hasura relationship names are configurable.
- Align permission docs and GraphQL queries with actual tracked names.
- If the repo query expects `question_item` or `organization`, keep those names stable in Hasura.

Viewer can write:

- Remove viewer role from insert/update/delete permissions.
- Confirm role checks use `_in: ["owner", "editor", "admin"]`.
- Retest with a fresh viewer JWT/session.

Cross-organization document link succeeds:

- Add nested checks for both `document.organization.organization_members` and `question_answer.organization.organization_members`.
- Confirm both sides require the same current user membership.

## Nhost Storage Notes

- `documents.file_id` references the Nhost Storage file id.
- File ids are not authorization.
- Normal users can access files only for organizations where they are members.
- Public buyer share access must be controlled separately.
- Approved documents may need signed URLs or a server-side proxy.
- Unapproved/internal documents must never be exposed publicly.

## Manual Hasura Console Setup Checklist

1. Track all public tables.
2. Track all foreign key relationships.
3. Add the object/array relationships listed above.
4. Create the `user` role permissions.
5. Configure `question_sections` and `question_items` select permissions for authenticated users.
6. Configure organization-scoped select permissions.
7. Configure owner/editor/admin insert/update permissions where needed.
8. Restrict organization billing fields from client insert/update.
9. Keep `admin_notes` internal.
10. Keep public share token access server-side.
11. Avoid broad anonymous permissions on raw tables.
12. Confirm Nhost JWT includes `X-Hasura-User-Id`.

## Permission Test Checklist

- Create two users in two different organizations.
- Confirm user A cannot see user B organization.
- Confirm user A cannot see user B answers, documents, document links, passports, share links, notes, or audit events.
- Confirm viewer can read but cannot update.
- Confirm editor can update questionnaire answers.
- Confirm editor can upload document metadata.
- Confirm editor can link documents to answers.
- Confirm owner/editor/admin can link evidence through `document_links`.
- Confirm owner/editor/admin can generate Supplier Passports.
- Confirm owner/editor/admin can create share links.
- Confirm viewer cannot create `document_links`.
- Confirm viewer cannot generate Supplier Passports.
- Confirm viewer cannot create share links.
- Confirm owner can create share links.
- Confirm normal users cannot update `plan_key`, `billing_interval`, `subscription_status`, or `is_verified`.
- Confirm normal users cannot set review-only fields if those columns are restricted.
- Confirm public share route does not show internal notes, admin notes, raw file paths, private file ids, or audit internals.
- Confirm public share route does not show `organization_members`, billing/subscription fields, or unapproved documents.
- Confirm expired/inactive share links return a safe unavailable state.
- Confirm password-protected share links show a password screen, verify server-side, and do not show buyer content before successful verification.
