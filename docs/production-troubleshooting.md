# Production Troubleshooting

Use this guide when the Vercel deployment loads but auth, real data, or share flows do not behave as expected.

## Diagnostics Endpoint Returns 404

Likely causes:

- Code was not pushed to GitHub.
- Vercel deployed an old commit.
- Route file is missing from `app/api/diagnostics/env/route.ts`.

Fix:

- Commit and push the latest code.
- Confirm the Vercel deployment commit matches the expected GitHub commit.
- Redeploy the latest commit.
- Confirm `/api/diagnostics/env` exists in the Vercel route list/build output.

## Diagnostics Env Value Is False

Likely causes:

- Environment variable is missing in Vercel Project Settings.
- Variable was added to Preview but not Production, or the reverse.
- Deployment was not redeployed after env changes.

Fix:

- Add the missing env variable in Vercel Project Settings.
- Confirm variables are configured for the correct environment.
- Redeploy after adding or changing env vars.

Required public variables:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN
NEXT_PUBLIC_NHOST_REGION
NEXT_PUBLIC_NHOST_GRAPHQL_URL
NEXT_PUBLIC_NHOST_AUTH_URL
NEXT_PUBLIC_NHOST_STORAGE_URL
```

Required server-only variables:

```bash
HASURA_GRAPHQL_ADMIN_SECRET
NHOST_ADMIN_SECRET
SHARE_LINK_COOKIE_SECRET
```

`NEXT_PUBLIC_` is correct only for public Nhost URLs/config. Admin secrets and cookie secrets must never use `NEXT_PUBLIC_`.

## Login Fails

Likely causes:

- Nhost allowed origins do not include the Vercel domain.
- Nhost auth redirect URLs are missing.
- `NEXT_PUBLIC_NHOST_AUTH_URL` is wrong.
- Env vars were added only to the wrong Vercel environment.
- Nhost email/password auth is disabled.

Fix:

- Add the Vercel domain to Nhost allowed origins.
- Add redirect URLs for locale/auth/dashboard routes and `/auth/callback`.
- Confirm the Auth URL matches the Nhost dashboard.
- Confirm env vars exist in the active Vercel environment.
- Redeploy after env changes.

## Login Works But Dashboard Has No Organization

Likely causes:

- `organization_members` row is missing.
- Onboarding failed.
- `organization_members.user_id` does not match the Nhost Auth user UUID.
- Hasura `organizations` or `organization_members` select permissions are missing.

Fix:

- Check the Nhost Auth user UUID.
- Check `organization_members.user_id`.
- Complete onboarding again if no workspace exists.
- Confirm Hasura permissions allow selecting organizations through membership.
- Check `/api/organizations/current` response category:
  - `no_organization`
  - `unauthenticated`
  - `permission_denied`
  - `env_missing`
  - `graphql_error`

## `/api/organizations/current` Returns 401

Likely causes:

- The Nhost access token expired.
- The client reused a stale session object.
- The current browser session is not loaded yet.
- The `Authorization` header is missing.
- The Nhost refresh token/session is unavailable.

Fix:

- Sign out and sign in again if the session cannot refresh.
- Confirm protected dashboard requests use a freshly refreshed Nhost session before sending `Authorization`.
- Confirm the app retries once after a 401 with a forced session refresh.
- If the retry also returns 401, redirect the user to the localized login page.
- In DevTools, confirm the retry request is sent without logging or copying token values.

## `hasAdminSecret=true` But `hasUserId=false`

Likely causes:

- The route could not resolve the current user from the bearer token.
- The bearer token is expired or invalid.
- The Nhost Auth URL is wrong, so the server-side `/user` lookup fails.
- The token is present but malformed.

Fix:

- Confirm `/api/diagnostics/env` reports the Auth URL as configured and shaped like an Auth endpoint.
- Confirm `POST /api/organizations/current` includes an `Authorization: Bearer ...` header.
- The route should validate the bearer token through `GET <Nhost Auth URL>/user` and use only the returned `user.id`.
- The route must not query Hasura until `user.id` is resolved.
- If user resolution fails, expect a 401 category such as `auth_user_lookup_failed`, `token_expired`, or `user_id_missing`.

## `admin_lookup_graphql_error` With `hasUserId=true`

Likely causes:

- `organization_members` table is not tracked in Hasura.
- `organizations` table is not tracked in Hasura.
- A relationship-based query was used while the relationship was missing or named differently.
- The GraphQL field name differs from the expected table field.

Fix:

- Use the two-step admin lookup: first `GetMembership`, then `GetOrganization`.
- Confirm `organization_members` and `organizations` are tracked in Hasura.
- Confirm `organization_members` exposes `organization_id`.
- Confirm `organizations_by_pk(id: ...)` exists in Hasura GraphiQL.
- If the response category is `membership_lookup_graphql_error`, inspect the `organization_members` table tracking/field names.
- If the response category is `organization_lookup_graphql_error`, inspect the `organizations` table tracking/field names.

## Dashboard Shows Acme/Demo Organization After Onboarding

Likely causes:

- `/api/organizations/current` failed.
- The dashboard could not send the Nhost access token to `/api/organizations/current`.
- `organization_members.user_id` does not match the Nhost Auth user UUID.
- Hasura `organizations` select permission is missing or the `organizations.organization_members` relationship is not tracked.
- The dashboard fell back to mock data because Nhost configuration is missing.

Fix:

- Open DevTools Network and inspect `POST /api/organizations/current`.
- Confirm the request includes an `Authorization: Bearer ...` header.
- Confirm the response category is not `permission_denied`, `env_missing`, `graphql_error`, or `no_organization`.
- Confirm the Nhost Auth user UUID exactly matches `organization_members.user_id`.
- Confirm Hasura permissions allow the `user` role to select `organizations` through the `organization_members` relationship.
- If Nhost is configured and the user is authenticated, treat Acme/demo data as a signal that current organization lookup failed.

MVP note:

- `/api/organizations/current` validates the Nhost bearer token first, then uses the server-side Hasura admin secret to look up the current user's organization membership.
- This avoids fragile client-side relationship permission issues for the dashboard bootstrap call.
- The route returns only safe organization fields and never returns the admin secret, JWT, membership list, or other organizations.
- If this route returns `permission_denied`, confirm the deployed server code is not accidentally sending the user's `Authorization` header to Hasura and that the admin lookup request includes only `content-type` and `x-hasura-admin-secret`.
- Current safe response categories include `missing_authorization_header`, `malformed_authorization_header`, `auth_user_lookup_failed`, `token_expired`, `user_id_missing`, `hasura_admin_secret_missing`, `admin_lookup_graphql_error`, `membership_not_found`, and `organization_not_found`.

Useful SQL checks:

```sql
select id, email from auth.users order by created_at desc;
select * from organizations order by created_at desc;
select * from organization_members order by created_at desc;
select * from company_profiles order by created_at desc;
```

## GraphQL Permission Denied

Likely causes:

- Hasura `user` role permissions are missing.
- Required relationships are not tracked.
- `X-Hasura-User-Id` condition is wrong.
- JWT/session variables are not reaching Hasura.

Fix:

- Confirm Hasura `user` role exists.
- Confirm Nhost JWT includes `X-Hasura-User-Id`.
- Track relationships listed in `docs/hasura-permissions.md`.
- Test with Hasura GraphiQL using the user's JWT/session headers.
- Confirm User A cannot see User B organization before pilot use.

## Questionnaire Does Not Save

Likely causes:

- The browser request to `POST /api/questionnaire` is missing `Authorization`.
- The Nhost access token expired and could not be refreshed.
- User has no organization membership.
- The server-side Hasura admin lookup cannot query `question_answers`.
- The unique constraint `question_answers_organization_id_question_item_id_key` is missing or named differently.

Fix:

- Confirm the request goes to `POST /api/questionnaire`.
- Confirm the request includes `Authorization: Bearer ...`.
- Confirm the user has an organization membership.
- Confirm `HASURA_GRAPHQL_ADMIN_SECRET` is configured in Vercel.
- Confirm `question_answers` is tracked in Hasura.
- Confirm the upsert constraint exists.

## Questionnaire Falls Back To Mock After F5

Likely causes:

- Live questionnaire loading still uses client-side Hasura user-role permissions.
- The access token is not sent after refresh.
- The current organization is not resolved before loading questionnaire data.
- `question_sections` or `question_items` are not tracked in Hasura.
- `question_answers` query is blocked or missing fields.
- The server-side questionnaire API route is missing or not deployed.

Fix:

- Use `GET /api/questionnaire?sectionCode=energy` for live questionnaire loading.
- Validate the Nhost bearer token server-side through Nhost Auth.
- Resolve the organization through `organization_members` using the server-side Hasura admin secret.
- Query `question_sections`, `question_items`, and current-organization `question_answers` with `x-hasura-admin-secret`.
- Do not silently fall back to mock data for authenticated production users.
- In DevTools, confirm refresh sends `GET /api/questionnaire` and Save & Continue sends `POST /api/questionnaire`.
- In Hasura, verify saved answers with:

```sql
select * from question_answers order by updated_at desc;
```

## Questionnaire Sections Show 0/0

Likely causes:

- The production database still has only the initial Energy seed.
- `nhost/migrations/default/0003_expand_questionnaire_taxonomy/up.sql` has not been applied to the live Nhost project.
- `nhost/seeds/0002_expand_questionnaire_taxonomy.sql` or `nhost/seeds/default/0002_expand_questionnaire_taxonomy.sql` has not been run against production.
- `question_items` is tracked, but only Energy rows exist.
- The deployed app is correct, but Hasura is reading old seed data.

Why Vercel deploy does not fix this by itself:

- Vercel builds and deploys the Next.js app only.
- The expanded questionnaire taxonomy is database seed/migration data.
- Unless a separate Nhost migration step is configured, production Nhost/Hasura will keep its existing `question_sections` and `question_items` rows.

Safe production apply path:

1. In Nhost, open the production project.
2. Take a backup/export before changing live data. At minimum export these tables:
   - `question_sections`
   - `question_items`
   - `question_answers`
3. Open the production Hasura Console for the Nhost project.
4. Go to Data / SQL.
5. Open this repo file locally:
   - `nhost/migrations/default/0003_expand_questionnaire_taxonomy/up.sql`
6. Paste the full contents into Hasura SQL and run it once.
7. If your workflow uses seeds rather than data migrations, run either equivalent seed file instead:
   - `nhost/seeds/0002_expand_questionnaire_taxonomy.sql`
   - `nhost/seeds/default/0002_expand_questionnaire_taxonomy.sql`
8. Do not run the `down.sql` file in production. It is intentionally a no-op for this data-only migration.

Rerun safety:

- The expanded taxonomy SQL is safe to rerun.
- `question_sections` uses `on conflict (code) do update`.
- `question_items` uses `on conflict (code) do update`.
- Existing `question_answers` are not deleted.
- Existing Energy answers remain attached because stable question `code` values are updated in place rather than recreated.

Verification before applying:

```sql
select
  qs.code,
  qs.title,
  count(qi.id) as question_count
from question_sections qs
left join question_items qi on qi.section_id = qs.id
group by qs.code, qs.title, qs.sort_order
order by qs.sort_order;
```

Verification after applying:

```sql
select
  qs.code,
  qs.title,
  count(qi.id) as question_count
from question_sections qs
left join question_items qi on qi.section_id = qs.id
group by qs.code, qs.title, qs.sort_order
order by qs.sort_order;
```

Confirm there are 100 active questionnaire items:

```sql
select count(*) as total_question_items
from question_items;
```

Confirm the section ids used by the app are present:

```sql
select id, code, title, sort_order
from question_sections
where code in (
  'company_basics',
  'employees',
  'energy',
  'fuel',
  'waste',
  'environmental_policies',
  'health_safety',
  'certifications',
  'governance',
  'supplier_information'
)
order by sort_order;
```

Confirm saved answers were preserved:

```sql
select
  qa.organization_id,
  qi.code as question_code,
  qs.code as section_code,
  qa.status,
  qa.updated_at
from question_answers qa
join question_items qi on qi.id = qa.question_item_id
join question_sections qs on qs.id = qi.section_id
order by qa.updated_at desc
limit 50;
```

Expected production counts after the expanded seed:

| Section code | Expected questions |
| --- | ---: |
| `company_basics` | 12 |
| `employees` | 10 |
| `energy` | 15 |
| `fuel` | 8 |
| `waste` | 9 |
| `environmental_policies` | 10 |
| `health_safety` | 9 |
| `certifications` | 9 |
| `governance` | 9 |
| `supplier_information` | 9 |

If these counts are present but the UI still shows `0/0`, confirm `GET /api/questionnaire` returns `items` and that the latest Vercel deployment is active.

Manual UI check after applying:

1. Open `/hr/dashboard/questionnaire` as a real logged-in production user.
2. Confirm each active section shows a non-zero total.
3. Open Company Basics, Employees, Fuel, Waste, Environmental Policies, Health & Safety, Certifications, Governance, and Supplier Information.
4. Answer one question.
5. Click Save & Continue.
6. Press F5.
7. Confirm the answer remains and completion changes.

## Documents Upload Fails

Likely causes:

- Nhost Storage is not enabled.
- Storage rejects the upload request.
- `HASURA_GRAPHQL_ADMIN_SECRET` is missing in Vercel.
- `NHOST_ADMIN_SECRET` or `HASURA_GRAPHQL_ADMIN_SECRET` is missing for server-side Storage upload.
- Server-side metadata insert into `documents` fails after file upload.
- `NEXT_PUBLIC_NHOST_STORAGE_URL` is wrong.
- The logged-in user has no `organization_members` row.
- The user role is `viewer`, which cannot upload in the MVP flow.

Fix:

- Confirm Nhost Storage is enabled.
- Confirm Storage URL matches the Nhost dashboard.
- Confirm `HASURA_GRAPHQL_ADMIN_SECRET` is configured as a server-only Vercel env var.
- Confirm `NHOST_ADMIN_SECRET` is configured if Nhost Storage requires it; otherwise the app falls back to `HASURA_GRAPHQL_ADMIN_SECRET` server-side.
- Confirm `GET /api/documents` returns the real organization documents after login.
- Confirm `POST /api/documents/upload` returns a `document` object after upload.
- If `POST /api/documents/upload` fails, inspect the JSON `category`, `stage`, and `storageStatus` fields. These are safe diagnostics and do not include secrets.
- Confirm the uploaded file appears in Nhost Storage.
- Confirm the inserted row in `documents` includes `organization_id`, `uploaded_by`, `file_id`, `file_name`, `file_size_bytes`, `mime_type`, `document_type`, `status`, and `expires_at`.
- Press F5 on `/en/dashboard/documents` and confirm the document remains visible.

Useful SQL after a successful upload:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'documents'
order by ordinal_position;

select
  id,
  organization_id,
  file_name,
  document_type,
  status,
  created_at
from documents
order by created_at desc
limit 20;
```

## Documents Page Shows Mock Data After Refresh

Likely causes:

- The documents page is still using client-side Hasura user-role permissions.
- The access token is missing or expired after refresh.
- The current organization cannot be resolved from `organization_members`.
- `documents` table is not tracked in Hasura.
- The server-side `/api/documents` route is missing or deployed from an old commit.

Fix:

- Use `GET /api/documents` for live document loading.
- Validate the Nhost bearer token server-side through Nhost Auth.
- Resolve organization membership with server-side `x-hasura-admin-secret`.
- Return an empty real state when the organization has no documents.
- Do not silently show mock documents for authenticated production users when live loading fails.

## Passport Page Says Generate Passport First

Likely causes:

- Passport has not been generated yet.
- Answers are not completed or reviewed.
- `supplier_passports` query permission is missing.
- Wrong organization context is loaded.

Fix:

- Click Generate Passport.
- Confirm a `supplier_passports` row exists.
- Confirm `readiness_score` and `generated_at` are set.
- Confirm the row belongs to the current organization.
- Confirm Hasura permissions for `supplier_passports`.

## Public Share Link Empty Or Blocked

Likely causes:

- Share link is expired or inactive.
- Password protection has not been verified.
- `share_links` server lookup failed.
- Passport row is missing.
- Share token is wrong.

Fix:

- Check the `share_links` row.
- Confirm `token`, `is_active`, and `expires_at`.
- Confirm the related `supplier_passports` row exists.
- For protected links, verify the password flow and confirm `SHARE_LINK_COOKIE_SECRET` is configured.
- Confirm public share routes do not expose internal fields.

## Public File Access Blocked

Likely causes:

- Document is not `reviewed` for `approved_only` links.
- Document is not linked for `all_linked_documents`.
- Document belongs to another organization.
- Nhost Storage does not allow the controlled server-side file read.

Fix:

- Confirm document status.
- Confirm `document_links` row exists when using all-linked visibility.
- Confirm document organization matches share link organization.
- Confirm Nhost Storage access strategy from `docs/nhost-storage.md`.

## Public Passport Route Server Error

Symptoms:

- `/[locale]/passport/[token]` shows the Next/Vercel "This page couldn't load" server error.
- The same token may exist in `share_links`, but the public buyer-facing page crashes before rendering.

Likely causes:

- Public token lookup failed or threw a GraphQL error.
- The public route reused an authenticated/dashboard-only loader.
- A live share link points to missing organization/passport data and the summary mapper was not null-safe.
- A public GraphQL query requested a Hasura relationship that is not tracked or has a different name.

Fix:

- Resolve the organization through `share_links.token`, not through a signed-in user.
- Catch public loader failures and render the safe unavailable state instead of bubbling a server error.
- Avoid fragile relationship selections in public Passport queries. Query scalar root fields and compose the buyer-safe summary server-side.
- Never expose private file URLs, storage file IDs, user/member data, raw sensitive answers, or admin/debug details on `/passport/[token]`.

Safe share-link verification:

```sql
select
  id,
  organization_id,
  token,
  is_active,
  expires_at,
  created_at
from share_links
order by created_at desc
limit 20;
```

Treat `token` as sensitive operational data: use it only for debugging in the Nhost/Hasura console and never paste it into public logs or screenshots.

Manual checks:

1. Open a valid `/en/passport/[token]` link in incognito.
2. Confirm the page loads without login.
3. Confirm the page shows a buyer-safe Supplier Passport summary.
4. Confirm no private document file URL, Nhost Storage file ID, member/user data, raw sensitive answer, or admin/debug field is visible.
5. Open `/en/passport/invalid-token-test` and confirm a safe unavailable/not-found state.
6. Repeat a quick check for `/hr/passport/[token]` and `/de/passport/[token]`.

## Share Link Lifecycle Management

Use this when validating `/dashboard/share` after deploying share-link lifecycle controls.

Expected behavior:

- `GET /api/passport/share-link` loads the current active, non-expired link for the authenticated user's current organization.
- `POST /api/passport/share-link` with no action, or with `{ "action": "create" }`, preserves the existing compatible behavior: return the active link if one exists, otherwise create one.
- `POST /api/passport/share-link` with `{ "action": "deactivate" }` sets active links for the current organization to `is_active = false`.
- `POST /api/passport/share-link` with `{ "action": "regenerate" }` deactivates active links for the current organization, creates a new token, and returns the new public URL.
- The public `/passport/[token]` route must show the safe unavailable state for invalid, inactive, or expired tokens.
- Public Passport pages must not expose private document URLs, Nhost Storage file IDs, user/member data, raw sensitive answers, secrets, or debug payloads.

Safe verification SQL:

```sql
select
  id,
  organization_id,
  is_active,
  expires_at,
  created_at,
  updated_at
from share_links
order by created_at desc
limit 20;
```

If `updated_at` is not available in the live schema, rerun the same query without that column.

Manual checks:

1. Open `/hr/dashboard/share` as a real supplier organization member.
2. Confirm the active link, created date, and expiry state are visible.
3. Copy the link and open it in incognito; the public Passport should load.
4. Deactivate the link and confirm the old public URL shows the unavailable state.
5. Regenerate the link and confirm the new URL loads in incognito.
6. Reopen the old URL and confirm it remains unavailable.
7. Confirm no private document URL, storage file ID, or private file download is visible.

## Faza 2.8 Final Supplier Passport QA

Run this after deploying the final Faza 2.8 changes to Vercel.

Known production actions already completed:

- The expanded questionnaire taxonomy has been applied to live Nhost/Hasura.
- Document upload metadata uses the existing `documents.document_type` field for evidence category/readiness.
- Certificate expiry tracking uses the existing `documents.expires_at` field.
- Evidence links use `document_links(document_id, question_answer_id)` and avoid fragile Hasura relationship names in `/api/document-links`.

Questionnaire taxonomy verification:

```sql
select
  qs.code,
  count(qi.id) as question_count
from question_sections qs
left join question_items qi on qi.section_id = qs.id
where qs.code in (
  'company_basics',
  'employees',
  'energy',
  'fuel',
  'waste',
  'environmental_policies',
  'health_safety',
  'certifications',
  'governance',
  'supplier_information'
)
group by qs.code, qs.sort_order
order by qs.sort_order;
```

Expected counts:

| Section code | Expected questions |
| --- | ---: |
| `company_basics` | 12 |
| `employees` | 10 |
| `energy` | 15 |
| `fuel` | 8 |
| `waste` | 9 |
| `environmental_policies` | 10 |
| `health_safety` | 9 |
| `certifications` | 9 |
| `governance` | 9 |
| `supplier_information` | 9 |

Document evidence verification:

```sql
select column_name, data_type
from information_schema.columns
where table_name = 'documents'
  and column_name in ('organization_id', 'file_id', 'file_name', 'document_type', 'status')
order by ordinal_position;

select document_type, status, count(*) as document_count
from documents
group by document_type, status
order by document_type, status;
```

Document link verification:

```sql
select
  dl.id,
  d.file_name as document_name,
  qi.code as question_code,
  qs.code as section_code,
  qa.status,
  dl.created_at
from document_links dl
join documents d on d.id = dl.document_id
join question_answers qa on qa.id = dl.question_answer_id
join question_items qi on qi.id = qa.question_item_id
join question_sections qs on qs.id = qi.section_id
order by dl.created_at desc
limit 50;
```

Document expiry verification:

```sql
select
  id,
  organization_id,
  file_name,
  document_type,
  status,
  expires_at,
  created_at
from documents
order by created_at desc
limit 50;
```

Production test checklist:

1. Sign in as a real production supplier user.
2. Open `/hr/dashboard` and confirm the real organization name appears.
3. Open `/hr/dashboard/questionnaire` and confirm no active section shows `0/0`.
4. Answer questions in Company Basics, Energy, Certifications, and Governance.
5. Save, press F5, and confirm answers and completion persist.
6. Open `/hr/dashboard/documents`.
7. Upload a small evidence file and choose an evidence category such as Energy or Certifications.
8. Press F5 and confirm the document and category remain visible.
9. Open `/hr/dashboard/passport` and confirm the Passport uses real organization/questionnaire/document data or neutral fallbacks.
10. Confirm missing evidence entries are based on real answered sections without matching documents.
11. Open `/hr/dashboard/share`, create or copy the share link, and press F5 to confirm it persists.
12. Open the public `/hr/passport/[token]` link in an incognito window.
13. Confirm the public Passport shows a buyer-safe summary only.
14. Confirm no private document file URLs, storage file IDs, user/member data, raw sensitive answers, or admin/debug values are visible.
15. Confirm invalid/inactive public tokens show a safe unavailable/not-found state, not mock Passport data.
16. Repeat quick route checks for `/en` and `/de`.

No extra production database action is required for document evidence categories if the `documents.document_type` column already exists. The app uses that existing field for evidence readiness.

Document-to-answer evidence links:

```sql
select
  d.file_name,
  d.document_type,
  d.status,
  qs.code as section_code,
  qi.code as question_code,
  dl.created_at as linked_at
from document_links dl
join documents d on d.id = dl.document_id
join question_answers qa on qa.id = dl.question_answer_id
join question_items qi on qi.id = qa.question_item_id
join question_sections qs on qs.id = qi.section_id
order by dl.created_at desc
limit 20;
```

The document-link API validates the Nhost user, resolves their organization membership server-side, and then uses `HASURA_GRAPHQL_ADMIN_SECRET` only on the server to verify that the document and selected questionnaire items belong to the current organization flow. The UI sends selected `question_items.id` values; the API finds or creates a minimal `question_answers` row for the current organization with `status = 'not_started'` when the answer does not exist yet, then inserts `document_links(document_id, question_answer_id)` idempotently. Public Passport pages use these links only for high-level evidence readiness; they do not expose private file URLs or storage IDs.

If `/api/document-links` returns `organization_scope_mismatch`, verify the production rows with:

```sql
select
  d.id,
  d.file_name as document_name,
  d.organization_id,
  d.created_at
from documents d
order by d.created_at desc
limit 20;

select
  om.user_id,
  om.organization_id,
  o.name
from organization_members om
join organizations o on o.id = om.organization_id
order by om.created_at desc
limit 20;

select
  d.file_name as document_name,
  d.organization_id as document_org_id,
  qa.organization_id as answer_org_id,
  qi.code as question_code,
  dl.created_at
from document_links dl
join documents d on d.id = dl.document_id
join question_answers qa on qa.id = dl.question_answer_id
join question_items qi on qi.id = qa.question_item_id
order by dl.created_at desc
limit 50;

select
  d.id as document_id,
  d.file_name as document_name,
  d.organization_id as document_org_id,
  qa.id as answer_id,
  qa.organization_id as answer_org_id,
  qi.code as question_code,
  dl.created_at
from document_links dl
join documents d on d.id = dl.document_id
join question_answers qa on qa.id = dl.question_answer_id
join question_items qi on qi.id = qa.question_item_id
where d.organization_id <> qa.organization_id
order by dl.created_at desc;
```

Expected result: documents selected in the data room should have `organization_id` equal to the signed-in user's `organization_members.organization_id`, and the mismatch detector should return zero rows. If an old document row belongs to a different organization, do not relink it automatically; upload it again under the correct organization or reassign it manually only after confirming ownership.

If `/api/document-links` returns `invalid_link_payload`, inspect the browser Network Payload. The expected request body is:

```json
{
  "documentId": "<document uuid>",
  "questionItemIds": ["<question_items.id uuid>"]
}
```

`selectedQuestionItemCount: 0` means the browser did not send selected questionnaire item IDs, or it sent them under an unexpected field. The modal should store `question_items.id` values in selection state and send them as `questionItemIds`; question codes such as `cert_iso_50001` are display labels only.

`hasDocumentId: false` means the browser did not send the selected `documents.id` UUID, sent it under the wrong field name, or sent a storage/file identifier instead of the document metadata row ID. The evidence-link modal must receive the selected document row's `documents.id` value and the POST body must use the `documentId` field exactly. Do not send `file_id`, storage IDs, question codes, or UI labels as `documentId`.

If the Network payload contains a visible UUID-like `documentId` but the API still reports `hasDocumentId: false`, verify the client/API UUID guard accepts the live database UUID format. The application should require UUID-shaped IDs (`8-4-4-4-12` hex groups), but it must not reject valid document row IDs just because the UUID version is not in an older v1-v5 range.

Use the canonical document metadata row ID from `documents.id`:

```sql
select
  id,
  organization_id,
  file_name,
  document_type,
  file_id,
  created_at
from documents
order by created_at desc
limit 20;
```

`id` is the value expected as `/api/document-links` `documentId`. `file_id` is the Nhost Storage file identifier and must not be used as `documentId`.

### document_links GraphQL relationship error

Symptom:

```json
{
  "category": "document_link_graphql_error",
  "stage": "link_mutation",
  "safeGraphqlMessage": "field 'document' not found in type: 'document_links'"
}
```

Cause: the GraphQL mutation requested a nested Hasura relationship such as `document { ... }` from `document_links`, but the live Hasura schema does not track that relationship or uses a different relationship name.

Fix: keep `/api/document-links` independent of Hasura relationship names. The link mutation should return only scalar `document_links` columns (`id`, `document_id`, `question_answer_id`, `created_at`). If the UI needs labels after saving, refresh link state with root-field queries for `documents`, `question_answers`, `question_items`, and `question_sections`, then compose the response server-side.

Verification SQL:

```sql
select
  dl.id,
  dl.document_id,
  d.file_name as document_name,
  dl.question_answer_id,
  qi.code as question_code,
  qs.code as section_code,
  dl.created_at
from document_links dl
join documents d on d.id = dl.document_id
join question_answers qa on qa.id = dl.question_answer_id
join question_items qi on qi.id = qa.question_item_id
join question_sections qs on qs.id = qi.section_id
order by dl.created_at desc
limit 50;
```

Expected Data Room link flow:

1. Open `/[locale]/dashboard/documents`.
2. Select an existing evidence document.
3. Click **Link to answer**.
4. The link dialog opens with the selected `documents.id`.
5. Select one or more questionnaire items.
6. The browser sends `documentId` plus `questionItemIds` to `/api/document-links`.

Expected Questionnaire evidence flow:

1. Open `/[locale]/dashboard/questionnaire`.
2. Click **Attach evidence** on a question.
3. Select an existing real organization document from the dialog.
4. The browser sends the selected document's `documents.id` and the current question's `question_items.id`.
5. If no real documents exist yet, the UI should ask the user to select or upload a document first and must not call `/api/document-links` with a missing `documentId`.

Network checklist:

- Dead click with no request: confirm the selected document row has a valid `documents.id` UUID and the Data Room detail action receives it.
- `hasDocumentId: false`: the client is not sending the selected `documents.id`, or it is sending a storage/file ID instead.
- `selectedQuestionItemCount: 0`: the dialog selection state did not send `question_items.id` values.
- Valid link request should receive `200` and return refreshed `links`.

Successful response shape:

```json
{
  "links": [
    {
      "id": "<document_links.id uuid>",
      "document_id": "<documents.id uuid>",
      "question_answer_id": "<question_answers.id uuid>"
    }
  ]
}
```

Certificate expiry verification:

```sql
select
  id,
  file_name,
  document_type,
  status,
  expires_at
from documents
where document_type = 'certificate'
order by created_at desc
limit 20;
```

The app uses the existing `documents.expires_at` field as the certificate expiry date. No separate `expiry_date` column is required. Dashboard warnings are calculated from real dates: expired certificates are flagged when `expires_at` is before today, critical warnings appear within 30 days, and upcoming warnings appear within 90 days.

## Faza 2.9 Final Public Passport and Share-Link QA

Use this checklist after deploying public Passport/share-link changes to production.

Share link lifecycle:

- Open `/hr/dashboard/share` as an authenticated organization member.
- Confirm the public Supplier Passport URL is visible.
- Copy the link and open it in an incognito browser.
- Confirm the warning explains that anyone with the link can view the public summary.
- Confirm the warning explains that private evidence files are not publicly downloadable from the public page.
- If deactivate/regenerate controls are enabled, deactivate the current link and confirm the old URL shows the safe unavailable state.
- Regenerate a link and confirm the new URL works while the old URL remains unavailable.

Public Passport valid-token QA:

- Open a valid `/en/passport/[token]`, `/hr/passport/[token]`, and `/de/passport/[token]` in incognito.
- Confirm the page loads without login.
- Confirm the organization name is the real supplier organization.
- Confirm readiness score, readiness label, section statuses, evidence summary, certificate status, and disclaimer are visible.
- Confirm wording uses `VSME-aligned` or equivalent wording and does not claim audit, certification, approval, or legal compliance.
- Confirm certificate status is neutral or based on real `documents.expires_at` data.

Invalid, inactive, and expired token QA:

- Open `/en/passport/invalid-token-test`, `/hr/passport/invalid-token-test`, and `/de/passport/invalid-token-test`.
- Confirm each route shows the safe unavailable state.
- Confirm invalid, inactive, and expired tokens do not fall back to mock Passport data.
- Confirm no server error page is shown.

Public data safety checklist:

- No private Nhost Storage URL is visible.
- No raw storage file ID is visible.
- No private document download link is visible unless an explicit public document-sharing flow is enabled.
- No `organization_members`, user/member names, user IDs, or auth data are visible.
- No raw sensitive questionnaire answers are rendered publicly; public pages should show summary/status data.
- No admin/debug payload is visible.
- No full share token, JWT, cookie, password, password hash, or secret is logged.

Share-link verification SQL:

```sql
select
  id,
  organization_id,
  is_active,
  expires_at,
  created_at,
  updated_at
from share_links
order by created_at desc
limit 20;
```

Public document safety spot check:

```sql
select
  id,
  organization_id,
  file_name,
  document_type,
  status,
  expires_at,
  created_at
from documents
order by created_at desc
limit 20;
```

Expected result: the public Passport page may summarize evidence availability and certificate expiry status, but it must not render `file_id`, storage paths, private URLs, internal notes, user/member data, or raw document content.

## Faza 3.0 Supplier Passport PDF Export

Authenticated suppliers can download a server-generated Supplier Passport draft from `/[locale]/dashboard/passport`.

Export route:

- `GET /api/passport/export/pdf?locale=en`
- Requires a valid Nhost bearer token.
- Resolves the current organization from `organization_members` server-side.
- Uses the Hasura admin secret only on the server.
- Returns `application/pdf` with a safe filename such as `supplier-passport-nokia-2026-05-19.pdf`.

The PDF includes:

- Supplier Passport draft cover/header with organization name, generated date, reporting year if available, and VSME-aligned label.
- A compact readiness header with overall percentage, readiness label, answered questions, uploaded documents, linked evidence, and certificate warning count.
- Disclaimer and limitations stating the PDF is not an audit opinion, legal certification, or assurance report.
- Company summary from safe organization fields and selected Company Basics questionnaire fields only.
- All 10 questionnaire sections with answered/total counts, completion percentage, readiness status, evidence status, and VSME/Supplier Passport mapping. Long labels are wrapped rather than truncated.
- Evidence category counts and a statement that private evidence files are not embedded or downloadable from the PDF.
- Certificate expiry summary based on real `documents.expires_at` values.
- Top missing/recommended data and evidence gaps based on unanswered questionnaire items and answered sections without matching evidence.
- Page footers with localized Supplier Passport draft label and page count.
- Final footer with generated date and short disclaimer.

Layout notes:

- The PDF renderer is server-side and dependency-light.
- It uses fixed margins, wrapped text, simple hierarchy, section rules, muted note text, and per-page footers.
- It is designed to tolerate long organization names, long Croatian/German labels, zero documents, zero answers, and missing supplier passport timestamps.
- It intentionally prioritizes stable generation and buyer-safe content over charts or remote assets.

PDF section mapping:

| Section code | PDF mapping label |
| --- | --- |
| `company_basics` | VSME B1 / Supplier identity |
| `employees` | VSME B8-B10 |
| `energy` | VSME B3 |
| `fuel` | VSME B3 / transport energy detail |
| `waste` | VSME B7 |
| `environmental_policies` | VSME B2, B4-B6 |
| `health_safety` | VSME B9 |
| `certifications` | Supplier Passport evidence |
| `governance` | VSME B11 / governance readiness |
| `supplier_information` | Supplier Passport value-chain readiness |

The PDF intentionally excludes:

- Private document URLs.
- Nhost Storage file IDs.
- Raw sensitive questionnaire answer values.
- Full raw questionnaire answer dumps.
- User/member data.
- Internal IDs and share tokens.
- Share tokens, cookies, JWTs, passwords, and secrets.
- Audit/certification/legal compliance claims.

Troubleshooting:

- `401`: user is not signed in or the bearer token is invalid/expired.
- `404`: signed-in user has no organization membership.
- `503`: Nhost/Hasura export backend is not configured.
- `500` with `pdf_export_error`: check server logs for safe GraphQL/PDF generation category only; do not log tokens or document contents.

Verification SQL:

```sql
select
  qs.code,
  count(qi.id) as total_questions
from question_sections qs
left join question_items qi on qi.section_id = qs.id
group by qs.code, qs.sort_order
order by qs.sort_order;

select
  document_type,
  status,
  count(*) as document_count
from documents
group by document_type, status
order by document_type, status;

select
  document_type,
  expires_at,
  count(*) as certificate_count
from documents
where document_type = 'certificate'
group by document_type, expires_at
order by expires_at;
```

## Faza 3.0 Public Supplier Passport PDF Export

The public Passport page includes a buyer-safe public PDF download for valid live share tokens.

Public export route:

- `GET /api/passport/public/pdf?token=<share-token>&locale=en`
- Does not require login.
- Requires a valid, active, non-expired share token.
- Password-protected links require the existing share verification cookie.
- Returns `application/pdf` with a safe filename such as `supplier-passport-public-nokia.pdf`.
- Invalid, inactive, expired, mock, or unavailable tokens return a safe JSON error and do not generate a PDF.

The public PDF includes only:

- Organization name.
- Generated date and last-updated date.
- VSME-aligned public summary label.
- Readiness percentage and readiness status.
- Section-level completion/status summaries.
- High-level evidence availability.
- Certificate status summary.
- Disclaimer that this is not an audit opinion, legal certification, or assurance report.
- Copy stating evidence documents are available on request and private files are not downloadable from the public PDF.

The public PDF intentionally excludes:

- Private document URLs.
- Nhost Storage file IDs.
- Downloadable evidence files.
- User/member data.
- Raw sensitive questionnaire answers.
- Internal IDs.
- Share token text inside the PDF.
- Admin/debug fields.
- Mock Passport fallback.

Manual checks:

1. Open a valid `/hr/passport/[token]` link in incognito.
2. Click **Preuzmi javni PDF**.
3. Confirm the PDF downloads without login.
4. Confirm it contains only a buyer-safe summary.
5. Confirm no private file URL, storage ID, raw answer dump, user/member data, or share token appears in the PDF.
6. Open `/api/passport/public/pdf?token=invalid-token-test&locale=hr` and confirm it returns a safe error, not a server crash or mock PDF.
7. Repeat a quick check for `/en` and `/de`.

## Faza 3.0 Final PDF Export QA

Use this checklist to close the Supplier Passport PDF phase in production.

Authenticated PDF checklist:

1. Sign in as a real supplier organization member.
2. Open `/hr/dashboard/passport`, `/en/dashboard/passport`, and `/de/dashboard/passport`.
3. Confirm the PDF button is visible and localized.
4. Download the authenticated PDF draft from each locale.
5. Confirm the PDF opens and the filename is safe, for example `supplier-passport-nokia-2026-05-19.pdf`.
6. Confirm the PDF includes the real organization name, generated date, disclaimer, readiness summary, all questionnaire sections, VSME/Supplier Passport mapping labels, evidence summary, certificate expiry summary, and missing/recommended data or a neutral fallback.
7. Confirm the PDF does not include private document URLs, storage file IDs, user/member data, share tokens, admin/debug fields, raw sensitive answer dumps, or mock company data.

Public PDF checklist:

1. Open a valid `/hr/passport/[token]` link in incognito.
2. Download the public PDF.
3. Confirm no login is required.
4. Confirm the PDF contains only the buyer-safe public summary: organization name, readiness, section status, high-level evidence availability, certificate status, and disclaimer.
5. Confirm private evidence files are described as available on request and are not downloadable from the PDF.
6. Open `/api/passport/public/pdf?token=invalid-token-test&locale=hr`.
7. Confirm invalid, inactive, expired, mock, or unavailable tokens do not generate a PDF and do not fall back to mock Passport content.

Included data:

- Organization display name.
- Generated and last-updated dates where available.
- Readiness percentage and status label.
- Section-level answered/total counts and completion status.
- VSME/Supplier Passport section mapping labels.
- High-level evidence category/count summaries.
- Linked evidence count.
- Certificate expiry warning counts based on real `documents.expires_at` values.
- Missing/recommended sections or neutral empty states.
- Disclaimer and limitations.

Excluded data:

- Private Nhost Storage URLs.
- Storage file IDs.
- Private document download links.
- Raw sensitive questionnaire answer dumps.
- User/member records.
- Internal IDs.
- Full share token text.
- JWTs, cookies, passwords, and secrets.
- Audit, certification, approval, legal compliance, or assurance claims.

Common PDF errors:

- `401`: the authenticated PDF request is missing a valid session.
- `404`: the authenticated user has no organization membership, or the public share token is invalid/unavailable.
- `503`: the Nhost/Hasura backend configuration is missing on the server.
- `500` / `pdf_export_error`: server-side PDF generation failed; inspect only safe stage/category logs.
- Public PDF safe error: invalid, inactive, expired, password-protected without verification, mock, or unavailable token.

No-private-URL checklist:

```sql
select
  id,
  organization_id,
  document_type,
  status,
  expires_at,
  created_at
from documents
order by created_at desc
limit 50;
```

Use this SQL only to verify metadata in Nhost/Hasura. Do not copy private file URLs, storage paths, storage IDs, or document contents into logs, screenshots, or public PDFs.

## Faza 3.1 Guided Dashboard Checklist

The authenticated dashboard home includes a Supplier Passport setup checklist for demo readiness and new supplier onboarding.

Workflow shown:

1. Complete questionnaire.
2. Upload evidence documents.
3. Link evidence to answers.
4. Review Supplier Passport.
5. Share public link.
6. Download PDF draft.

Live metrics used:

- `question_items` and current-organization `question_answers` for answered/total questionnaire progress.
- Current-organization `documents` for uploaded evidence count and recent upload metadata.
- Current-organization `document_links` filtered through the organization's documents and answers for linked evidence count.
- Current-organization `share_links` for active public link state.
- Current-organization `supplier_passports` timestamp where available for last-updated context.

Safety notes:

- The checklist is available only inside the authenticated dashboard.
- It resolves the organization server-side from the signed-in user membership.
- It does not trust a client-provided organization ID.
- It does not render private document URLs, storage file IDs, share tokens, JWTs, cookies, or admin secrets.
- Readiness is described as an indicator based on questionnaire completion and evidence metadata, not an audit or certification.
- If live metrics cannot be loaded, the dashboard shows neutral fallback text instead of mock values.

Manual QA:

1. Deploy the latest dashboard changes.
2. Sign in as a real supplier.
3. Open `/hr/dashboard`.
4. Confirm the Supplier Passport setup checklist appears.
5. Confirm the next recommended step matches the real state of questionnaire answers, documents, evidence links, and share links.
6. Confirm CTAs route to `/hr/dashboard/questionnaire`, `/hr/dashboard/documents`, `/hr/dashboard/passport`, and `/hr/dashboard/share`.
7. Confirm no Acme/Anna/Munich or other mock dashboard data appears.
8. Confirm no private file URL, storage file ID, share token, or user/member data appears.
9. Repeat a quick check on `/en/dashboard` and `/de/dashboard`.

## Faza 3.1 Empty States And Production Copy QA

Use this checklist during demo-readiness QA for authenticated supplier flows.

Dashboard:

- New or low-data organizations should see the Supplier Passport setup checklist with a clear next recommended step.
- Empty dashboard cards should show neutral guidance, not mock buyer names, mock companies, or blank panels.
- Readiness must be described as an indicator based on questionnaire completion and evidence metadata, not an audit or certification.

Questionnaire:

- With no saved answers, show a message such as `No answers saved yet` / `Još nema spremljenih odgovora` / `Noch keine Antworten gespeichert`.
- Loading or live-data failures should use localized non-technical copy.
- Do not show fake answers when live taxonomy is available but answers are empty.

Documents and evidence linking:

- With no documents, show guidance to upload invoices, certificates, policies, or other supporting evidence.
- Upload failures should show a safe localized error.
- Evidence-link failures should say the document could not be linked to an answer, without exposing internal IDs or GraphQL details.
- If no questionnaire item is selected, show a localized selection prompt.

Passport, share, and PDF:

- Low-readiness Passport states should guide the user back to questionnaire and evidence linking.
- Missing evidence summaries should use neutral copy.
- Share pages should explain that no active public link exists yet and guide the user to create one.
- Clipboard and PDF failures should use localized, non-technical messages.
- PDF success may show `PDF is ready` / `PDF je spreman` / `PDF ist bereit`.

Public Passport:

- Invalid, inactive, or expired public tokens should show the safe unavailable state.
- Public pages must not expose private file URLs, storage IDs, user/member data, raw answer dumps, stack traces, admin/debug fields, or mock fallback content.

Localization QA:

- Croatian: no `Saćetak`; prefer `Sažetak`, `dokazna dokumentacija`, `javni link`, `kupci`, `dobavljač`, `PDF nacrt`, and `Odjava`.
- German: no Croatian fallback; use consistent `Nachweise`, `Lieferant`, `Käufer`, and `Bereitschaft`.
- English: avoid audit, certification, legal compliance, or approval claims unless the sentence is explicitly a disclaimer.

## Faza 3.1 Landing And Entry Flow QA

Use this checklist for unauthenticated demo-readiness QA.

Routes:

- `/en`
- `/hr`
- `/de`
- `/en/login`, `/hr/login`, `/de/login`
- `/en/signup`, `/hr/signup`, `/de/signup`
- `/en/onboarding`, `/hr/onboarding`, `/de/onboarding`

Landing page expectations:

- Hero explains Supplier Passport in under 30 seconds: questionnaire answers, evidence documents, readiness status, and a VSME-aligned supplier profile.
- Primary CTA routes to localized signup, not pricing checkout or a payment flow.
- No unsafe sample public Passport link is shown unless a buyer-safe demo token exists.
- How-it-works section shows the live product workflow: questionnaire, evidence upload, evidence linking, public sharing, and PDF draft.
- Supplier/buyer value is stated as readiness workflow support, not audit replacement or legal compliance.
- Disclaimer is visible: Supplier Passport is VSME-aligned and is not an audit opinion, legal certification, or assurance report.

Auth and onboarding expectations:

- Login copy says the user is continuing their Supplier Passport.
- Signup copy says the user is creating a Supplier Passport workspace.
- Placeholders are neutral examples, not Acme/Anna/Munich demo data.
- Onboarding does not preselect a fake employee count.

No-overclaim checklist:

- Do not use `VSME certified`, `Certified`, `Audit-ready`, `Approved`, `Verified supplier`, or `guaranteed compliance` in public landing/auth UI unless it is clearly part of a disclaimer saying the product is not that.
- Use `VSME-aligned`, `supplier readiness`, `buyer-ready Supplier Passport`, `evidence summary`, and `public Supplier Passport`.

Privacy checklist:

- Landing and auth routes must not load private documents, storage URLs, storage IDs, share tokens, organization/member records, JWTs, cookies, or admin/debug values.
- Public product previews may use neutral example labels only.

## Faza 3.1 Final Demo Readiness QA

Use this checklist before a live product demo.

Demo flow:

1. Visitor opens `/en`, `/hr`, or `/de`.
2. Visitor understands that Supplier Passport collects questionnaire answers, evidence documents, readiness status, public sharing, and PDF draft export in a VSME-aligned supplier profile.
3. Visitor starts signup or login.
4. User completes onboarding or lands in the authenticated dashboard.
5. Dashboard shows the Supplier Passport setup checklist.
6. User completes questionnaire answers.
7. User uploads an evidence document.
8. User links evidence to a questionnaire answer.
9. User reviews the dashboard Supplier Passport.
10. User creates or opens a public share link.
11. Buyer opens the public Passport in an incognito/no-login session.
12. User downloads the authenticated PDF draft.
13. User logs out.

Landing/auth QA:

- `/en`, `/hr`, and `/de` load without authentication.
- Hero, workflow, supplier/buyer value, and disclaimer are understandable without sales narration.
- CTAs route to localized signup/login flows.
- Login, signup, and onboarding copy is production-ready.
- No Acme/Anna/Munich sample identity appears in public landing/auth/onboarding UI.
- No certified, audited, approved, verified-supplier, or guaranteed-compliance claim appears unless it is part of a disclaimer saying Supplier Passport is not that.

Authenticated dashboard QA:

- Checklist uses real questionnaire, document, evidence-link, share-link, and Passport/PDF state.
- Questionnaire active sections show real non-zero taxonomy totals.
- Answers save, update completion, and survive refresh.
- Document upload persists metadata, category/type, and expiry date where applicable.
- Link-to-answer opens the modal, sends `documentId` plus `questionItemIds`, returns 200 for valid current-organization data, and persists after refresh.
- Passport uses real or neutral data and shows evidence/expiry state from real metadata.
- Authenticated PDF downloads and excludes private URLs, storage IDs, user/member data, share tokens, raw sensitive answer dumps, and misleading claims.

Public sharing QA:

- Share page copies and opens the public link.
- Valid public token loads without login.
- Invalid, inactive, or expired token shows the safe unavailable state.
- Public Passport and public PDF, if enabled, are buyer-safe summaries only.
- Public surfaces do not expose private document URLs, storage IDs, member/user data, raw sensitive answers, admin/debug data, or mock fallback content.

Localization QA:

- English copy is clear and avoids overclaiming.
- Croatian uses `Sažetak`, `dokazna dokumentacija`, `javni Supplier Passport`, `PDF nacrt`, `Odjava`, `dobavljač`, and `kupci`; no `Saćetak`.
- German has no Croatian fallback and uses consistent `Nachweise`, `Lieferant`, `Käufer`, and `Bereitschaft`.

Known manual production QA:

- Run the full flow with a real production user and organization after deployment.
- Confirm public links in a private/incognito browser window.
- Confirm PDF downloads in each locale.
- Confirm logout returns the user to the localized login/entry flow.

## Faza 3.1.1 Company Profile And Settings Mock Cleanup QA

Company Profile:

- `/en/dashboard/company`, `/hr/dashboard/company`, and `/de/dashboard/company` must use the authenticated user's current organization, not `lib/mock-data`.
- `/en/dashboard/company-profile`, `/hr/dashboard/company-profile`, and `/de/dashboard/company-profile` should render the same production-safe profile overview.
- Show real organization fields where available: organization name, legal company name, location, industry, employee count range, and website.
- Missing fields should show neutral copy: `Not provided yet` / `Još nije uneseno` / `Noch nicht angegeben`.
- Do not show Acme, Munich, fake industry, fake employee count, Starter renewal dates, static Verified/Active/Starter badges, or fake plan details.

Edit Profile behavior:

- Full inline profile editing is deferred.
- The primary action now routes to the questionnaire where company details are maintained.
- The page shows clear copy that profile editing is not available yet and company details should be updated in the questionnaire.
- The button must not be dead.

Settings:

- `/en/dashboard/settings`, `/hr/dashboard/settings`, and `/de/dashboard/settings` must not show fake owners such as Elena Markovic or mock workspace-owner text.
- Settings should show a neutral overview for workspace settings, account/team access, and notifications.
- No `Ready for future workflow`, `Planned`, fake `Starter`, or fake owner status should appear.
- If a real account email is available, it may be shown only inside the authenticated dashboard.

Security:

- These pages are authenticated dashboard pages.
- They must not render private document URLs, storage IDs, share tokens, JWTs, cookies, admin secrets, or public user/member lists.
- Organization data must come from the current user membership resolver.

## Faza 3.1.2 Dead Controls And Mock Action Cleanup QA

- Questionnaire: Share progress routes to the real sharing page, unsupported more-menu actions are removed, evidence recommendations route to the Evidence Data Room, and sample related-document files are replaced with neutral guidance.
- Topbar: notifications are explicitly disabled until notification support exists.
- Evidence Data Room: search, type filter, and status filter are real client-side filters. Folder organization is clearly unavailable, row actions use an explicit Link to answer button, secure preview remains disabled with non-technical copy, and fake review metadata/status controls are removed.
- Share Links: `/dashboard/share-links` redirects to the real `/dashboard/share` management page instead of rendering mock link cards.
- Activity: the activity page is a neutral coming-later state without mock events or dead buttons.
- Settings and Company Profile: no mock owner/company placeholders should be visible; unavailable settings/profile editing controls must be clearly routed, disabled, or absent.

Manual QA checklist:

1. Open `/en/dashboard/questionnaire`; verify Share progress opens sharing, Upload evidence opens documents, no dead ellipsis menu appears, and related documents show neutral guidance.
2. Open `/en/dashboard/documents`; verify upload still works, search/type/status filters change the visible table, Create folder is disabled/unavailable, Link to answer opens the dialog, secure preview is clearly disabled, and no fake reviewer is shown.
3. Open `/en/dashboard/share-links`; verify it redirects to `/en/dashboard/share`.
4. Open `/en/dashboard/activity`; verify there are no mock events and no View activity log button.
5. Open `/en/dashboard/settings` and `/en/dashboard/company-profile`; verify no Elena/Acme/Munich/future-workflow placeholders.
6. Repeat quick checks for `/hr` and `/de` localized routes.

## Faza 3.2 Buyer Request Workspace Foundation

Routes:

- `/en/dashboard/buyer-requests`, `/hr/dashboard/buyer-requests`, `/de/dashboard/buyer-requests`
- `/en/dashboard/buyer-requests/[id]`, `/hr/dashboard/buyer-requests/[id]`, `/de/dashboard/buyer-requests/[id]`
- `/api/buyer-requests`
- `/api/buyer-requests/[id]`

Data model:

- Migration: `nhost/migrations/default/0004_add_buyer_requests/up.sql`
- Table: `buyer_requests`
- Organization-scoped by `organization_id`.
- Status values: `draft`, `in_progress`, `ready_to_share`, `shared`, `closed`.
- Requested sections are stored as a JSON array of questionnaire section codes.
- No private document URLs, storage file IDs, buyer login, buyer portal, or outbound email are included in this foundation step.

Useful QA SQL:

```sql
select
  id,
  organization_id,
  buyer_name,
  request_title,
  status,
  requested_sections,
  due_date,
  created_at,
  updated_at
from buyer_requests
order by created_at desc
limit 50;
```

Manual QA checklist:

1. Apply migration `nhost/migrations/default/0004_add_buyer_requests/up.sql` in the production Nhost/Hasura environment and ensure the table is tracked by Hasura.
2. Log in as a supplier organization member.
3. Open `/hr/dashboard/buyer-requests`.
4. Create a request with buyer name, title, due date, requested sections, and notes.
5. Open the request detail page.
6. Update status, notes, and requested sections.
7. Refresh the browser and confirm persistence.
8. Confirm a different organization cannot see or update the request.
9. Confirm no private document URLs or storage IDs are shown.
10. Repeat quick route checks on `/en` and `/de`.

### Buyer request readiness mapping and response workspace

The buyer request detail page is an authenticated supplier-side response workspace. It does not create buyer accounts, buyer login, email sending, or buyer-specific public links.

Readiness logic:

- Requested sections are read from `buyer_requests.requested_sections`.
- If no sections are selected, the workspace summarizes all active questionnaire sections.
- Section readiness uses `question_sections`, `question_items`, and `question_answers` for the current organization.
- Evidence availability uses `documents` and `document_links` counts only.
- Certificate expiry warnings use real certificate document expiry dates.
- The response package panel shows whether an active public Supplier Passport link exists, PDF availability through the Passport page, current request status, and high-level evidence availability.

Privacy rules:

- Do not show private document URLs.
- Do not show storage file IDs.
- Do not show user/member data.
- Do not log share tokens, JWTs, cookies, secrets, private URLs, or document contents.
- Do not label a request as approved, certified, audited, or legally compliant.

Manual QA checklist:

1. Log in as a supplier organization member.
2. Open `/hr/dashboard/buyer-requests`.
3. Create a request with Energy and Certifications selected.
4. Open the request detail page.
5. Confirm request readiness, section completion, evidence status, and missing actions reflect real data.
6. Confirm certificate expiry warning appears only from real certificate expiry data.
7. Update status to `ready_to_share`, refresh, and confirm persistence.
8. Click Review questionnaire, Upload/link evidence, Review Passport, Open share page, and Download PDF draft; confirm all navigate to real existing routes.
9. Confirm no private document URLs, storage IDs, buyer portal, or email sending appears.
10. Repeat quick route checks on `/en` and `/de`.

### Buyer request response package preparation

The buyer request detail page can prepare a manual response package without sending anything externally.

Response package includes:

- Active public Supplier Passport link status.
- PDF draft availability through the authenticated Passport page.
- Requested section count and readiness percentage.
- Requested-section linked evidence count.
- Evidence-on-request copy.
- Missing action count.
- Current buyer request status.

Prepare response checklist:

- Complete requested questionnaire sections: done when every requested section has all questions answered.
- Link evidence documents: done when at least one evidence link exists for the requested sections.
- Review Supplier Passport: shown as part of the manual preparation flow and considered done when the request has been marked ready/shared/closed.
- Confirm public link is active: done only when an active, unexpired share link exists.
- Download PDF draft: available through the Passport page.
- Mark request as ready to share: done when status is `ready_to_share`, `shared`, or `closed`.

Copy response note:

- The copy action only writes text to the supplier's clipboard.
- It does not send email and does not create buyer access.
- The note includes the buyer name and current organization name when available.
- If an active public Passport link exists, the note includes that public link.
- If no active public link exists, the note omits the link and the UI directs the supplier to create the public link first.
- The note never includes private document URLs, storage file IDs, raw answers, or admin/debug fields.

Manual QA checklist:

1. Open `/hr/dashboard/buyer-requests/[id]`.
2. Confirm the response package panel shows public link status, PDF draft state, requested-section readiness, evidence count, missing action count, and current status.
3. Confirm the prepare response checklist reflects real data.
4. Copy the response note with an active public link and confirm it includes only the public Passport link.
5. Deactivate/remove the active link or use an organization without one; confirm the note omits a fake link and shows create-link guidance.
6. Confirm Mark as ready to share persists the status after refresh.
7. Confirm no email is sent and no buyer portal/login appears.
8. Repeat quick checks on `/en` and `/de`.

### Buyer request internal notes and activity summary

Internal notes:

- Stored in `buyer_requests.notes`.
- Editable on the authenticated buyer request detail page.
- Saved through `PATCH /api/buyer-requests/[id]`.
- Organization membership is checked before notes can be read or written.
- Notes are not included in public Passport pages, public PDFs, share links, or buyer-facing output.

Activity summary:

- No separate audit table is required for this step.
- The request detail page derives a lightweight activity summary from `created_at`, `updated_at`, current status, linked evidence count, missing action count, and due date.
- The global Activity page remains a neutral placeholder and explains that buyer request activity is summarized inside each request.

Due-date logic:

- Closed requests do not show overdue/due-soon urgency.
- A request due today shows a due-today label.
- A request due within seven days shows a due-in-days label.
- A request with a past due date shows an overdue-by-days label.
- Requests without a due date show a neutral no-due-date label.

Manual QA checklist:

1. Open `/hr/dashboard/buyer-requests/[id]`.
2. Edit internal notes and save them.
3. Refresh and confirm the notes persist.
4. Change status and confirm the status explanation updates.
5. Check created, last updated, current status, linked evidence, missing actions, and due date in the activity summary.
6. Set due dates for today, within seven days, and past dates to confirm labels.
7. Confirm notes are not visible on public Passport, public PDF, share pages, or copied response text.
8. Open `/hr/dashboard/activity` and confirm it remains neutral with no fake events.
9. Repeat quick checks on `/en` and `/de`.

### Faza 3.2 Buyer Request Workspace Final QA

Production migration readiness:

- Migration file: `nhost/migrations/default/0004_add_buyer_requests/up.sql`.
- Production action: apply the migration in Nhost/Hasura and ensure `buyer_requests` is tracked before demoing this workspace.
- The table is organization-scoped through `organization_id`.
- The API verifies `organization_members` before list, create, detail, and update operations.
- Client-supplied `organizationId` is ignored.

Useful verification SQL:

```sql
select
  id,
  organization_id,
  buyer_name,
  request_title,
  status,
  requested_sections,
  due_date,
  notes,
  created_at,
  updated_at
from buyer_requests
order by created_at desc
limit 20;
```

API checklist:

- `GET /api/buyer-requests` returns only current organization requests.
- `POST /api/buyer-requests` creates rows for the current organization only.
- `GET /api/buyer-requests/[id]` returns the request only when it belongs to the current organization.
- `PATCH /api/buyer-requests/[id]` updates only safe request fields and never `organization_id`.
- All errors are JSON responses with safe diagnostic categories.
- Do not log JWTs, cookies, share tokens, private URLs, document contents, or secrets.

Workspace QA checklist:

1. Open `/hr/dashboard/buyer-requests`.
2. Confirm empty state is neutral if there are no requests.
3. Create a request with buyer name, title, due date, requested sections, and notes.
4. Confirm buyer contact email validation works when an invalid email is entered.
5. Refresh and confirm the request persists.
6. Open the detail page.
7. Update status, notes, and requested sections.
8. Confirm requested-section readiness, evidence counts, missing actions, certificate expiry warnings, response package, copy response note, and due labels use real data.
9. Confirm quick actions route to questionnaire, documents, Passport, share page, and the Passport PDF area.
10. Confirm no email is sent and no buyer portal, buyer login, or buyer-specific public workspace appears.
11. Confirm copied response text includes only the active public Passport link when one exists.
12. Confirm internal notes are not visible on public Passport, public PDF, share links, or copied response text.
13. Confirm `/hr/dashboard/activity` remains neutral and has no fake activity events.
14. Repeat route and localization checks on `/en` and `/de`.

Deferred items:

- Buyer accounts, buyer login, buyer portal, email sending, request-specific public links, and full audit/event history are intentionally not included in Faza 3.2.

## Faza 3.3 Admin / Concierge Workspace Foundation

Routes:

- `/en/admin`, `/hr/admin`, `/de/admin` redirect to the localized admin organizations workspace.
- `/en/admin/organizations`, `/hr/admin/organizations`, `/de/admin/organizations` list supplier organizations with privacy-safe readiness summaries.
- `/en/admin/organizations/[id]`, `/hr/admin/organizations/[id]`, `/de/admin/organizations/[id]` show a read-only organization overview.
- APIs: `GET /api/admin/organizations` and `GET /api/admin/organizations/[id]`.

Admin access model:

- Configure `ADMIN_EMAIL_ALLOWLIST` in Vercel as a server-only environment variable.
- Use a comma-separated list of admin emails, for example `admin@example.com,ops@example.com`.
- Do not prefix the variable with `NEXT_PUBLIC_`.
- Redeploy after changing the allowlist.
- Admin APIs resolve the authenticated Nhost user and compare the server-side email against the allowlist.
- Unauthenticated requests return `401`; authenticated non-admin requests return `403`.

Admin summary includes:

- Organization id, name, created/updated dates.
- Readiness percentage and answered/total questionnaire count.
- Uploaded document count.
- Linked evidence count.
- Buyer request count.
- Active public share link boolean.
- Certificate expiry warning counts.
- Section readiness, missing action summary, and buyer request summary on detail.

Admin summary intentionally excludes:

- Private document URLs and Nhost Storage URLs.
- Storage file IDs.
- Raw questionnaire answer values.
- User/member lists or personal data.
- Share tokens, JWTs, cookies, secrets, and admin debug fields.
- Impersonation, buyer portal, email sending, AI, Stripe, XBRL, plan limits, or Supabase.

Useful admin QA checklist:

1. Configure `ADMIN_EMAIL_ALLOWLIST` with the admin test account and redeploy.
2. Log in as the allowlisted admin and open `/hr/admin/organizations`.
3. Confirm live organizations appear with readiness, documents, linked evidence, buyer requests, certificate warnings, active public link status, and created date.
4. Open an organization detail page and confirm section readiness, evidence summary, certificate warnings, buyer request summary, and missing actions are shown.
5. Confirm no private document URLs, storage IDs, raw answers, user/member data, share tokens, or secrets are rendered.
6. Log in as a normal supplier and confirm `/hr/admin/organizations` and `/api/admin/organizations` are forbidden.
7. Repeat quick route checks on `/en/admin/organizations` and `/de/admin/organizations`.

Useful SQL:

```sql
select
  id,
  name,
  created_at,
  updated_at
from organizations
order by created_at desc
limit 20;
```

## Faza 3.3 Concierge Triage And Support Status

Migration:

- File: `nhost/migrations/default/0005_add_organization_concierge_notes/up.sql`
- Production action: apply the migration in Nhost/Hasura and track `organization_concierge_notes` before using concierge status editing.

Table purpose:

- `organization_concierge_notes` stores admin-only support state for an organization.
- Fields include concierge `status`, `priority`, `internal_note`, `next_follow_up_date`, and internal review timestamps.
- This data is not shown on supplier dashboards, public Passport pages, share links, or PDF exports.

Status values:

- `not_started`
- `onboarding`
- `waiting_on_supplier`
- `ready_for_review`
- `demo_ready`
- `paused`

Priority values:

- `low`
- `normal`
- `high`

Triage logic:

- `At risk`: expired certificate, overdue buyer request, or many missing actions.
- `Needs attention`: low readiness, no documents, or no linked evidence.
- `In progress`: supplier has partial progress but is not demo-ready yet.
- `Demo-ready`: high readiness with linked evidence and an active public link.

Missing actions are derived from real summary data:

- Unanswered or low-completion sections.
- Sections with answers but no linked evidence.
- No uploaded evidence documents.
- Expired or expiring certificate evidence.
- Missing active public Supplier Passport link.
- Overdue buyer requests.

Useful concierge SQL:

```sql
select
  organization_id,
  status,
  priority,
  internal_note,
  next_follow_up_date,
  reviewed_at,
  created_at,
  updated_at
from organization_concierge_notes
order by updated_at desc
limit 20;
```

Manual QA:

1. Apply migration `0005_add_organization_concierge_notes`.
2. Log in as an allowlisted admin and open `/hr/admin/organizations`.
3. Confirm triage status, missing action count, concierge status, priority, and next follow-up data appear.
4. Open an organization detail page.
5. Update concierge status, priority, internal note, and follow-up date.
6. Refresh and confirm the values persist.
7. Confirm a normal supplier cannot access the admin API or concierge data.
8. Confirm concierge notes do not appear in public Passport, public PDF, share links, or supplier dashboard surfaces.

## Faza 3.3 Admin Risk Dashboard

Routes:

- `/en/admin/risks`, `/hr/admin/risks`, `/de/admin/risks`
- API: `GET /api/admin/risks`

Risk dashboard returns privacy-safe aggregate metrics:

- Total organizations.
- Low-readiness organizations.
- Organizations with no documents.
- Organizations with no linked evidence.
- Expired certificates.
- Certificates expiring within 30 days.
- Certificates expiring within 90 days.
- Overdue buyer requests.
- Organizations without active public share links.

Risk lists include only safe fields:

- Organization id and name.
- Risk type and severity.
- Count metrics.
- Readiness percentage where relevant.

Risk lists intentionally exclude:

- Private document URLs.
- Storage file IDs.
- Raw questionnaire answer values.
- User/member data.
- Share tokens, JWTs, cookies, secrets, and admin debug details.

Severity logic:

- `critical`: expired certificate, overdue buyer request, or very low readiness.
- `warning`: certificate expiry warning, missing evidence, missing active share link, no documents, or no linked evidence.
- `info`: incomplete but non-urgent follow-up.

Manual QA:

1. Log in as an allowlisted admin.
2. Open `/hr/admin`.
3. Confirm Organizations and Risks entry cards are visible.
4. Open `/hr/admin/risks`.
5. Confirm risk cards and risk list load with live data.
6. Click a risk row and confirm it opens the organization detail page.
7. Confirm no private document URLs, storage IDs, raw answers, user/member data, share tokens, or secrets are rendered.
8. Confirm a normal supplier receives forbidden access for `/api/admin/risks`.

## Faza 3.3 Admin Support Actions

Internal support actions are admin-only:

- Update concierge status, priority, internal note, and next follow-up date.
- Mark organization as reviewed internally.
- Review a derived support checklist for questionnaire, evidence, share link, buyer request, certificate, and PDF readiness.

Internal review meaning:

- `Reviewed internally` means the concierge/admin team looked at the organization overview.
- It is not a certification, approval, verification, legal compliance finding, audit opinion, or assurance report.
- It must not appear on supplier dashboards, public Passport pages, share links, or PDF exports as a public trust badge.

Support checklist:

- Questionnaire started: derived from answered question count.
- Evidence documents uploaded: derived from document count.
- Evidence linked: derived from linked evidence count.
- Passport reviewed: derived from non-zero readiness.
- Public link active: derived from active share link status.
- Buyer requests reviewed: derived from no overdue buyer requests.
- Certificate expiry checked: derived from no certificate warning count.
- PDF export available: product capability, not supplier certification.

Deferred support action:

- Acknowledging or dismissing individual missing actions is deferred until there is a dedicated acknowledgement model. Missing actions remain visible until supplier data changes.

Manual QA:

1. Log in as an allowlisted admin and open an organization detail page.
2. Update concierge status, priority, internal note, and next follow-up date.
3. Click `Mark reviewed`.
4. Refresh and confirm saved status and internal review state persist.
5. Confirm the support checklist is based on real counts and does not mark supplier data as complete.
6. Confirm no public/supplier page shows concierge notes or internal review status.

## Faza 3.3 Final Admin QA

Admin routes to verify:

- `/en/admin`, `/hr/admin`, `/de/admin`
- `/en/admin/organizations`, `/hr/admin/organizations`, `/de/admin/organizations`
- `/en/admin/organizations/[id]`, `/hr/admin/organizations/[id]`, `/de/admin/organizations/[id]`
- `/en/admin/risks`, `/hr/admin/risks`, `/de/admin/risks`

Admin APIs to verify:

- `GET /api/admin/organizations`
- `GET /api/admin/organizations/[id]`
- `GET /api/admin/risks`
- `GET/PATCH /api/admin/organizations/[id]/concierge`

Final access checklist:

1. With no login, admin API calls return `401` and admin pages show a safe unauthorized/loading state without data.
2. With a normal supplier account, admin API calls return `403` and admin pages show a safe unauthorized state.
3. With an allowlisted admin account, admin pages and APIs load.
4. Confirm `ADMIN_EMAIL_ALLOWLIST` is configured only server-side and is not prefixed with `NEXT_PUBLIC_`.
5. Confirm no JWTs, cookies, share tokens, private file URLs, document contents, or secrets are logged.

Admin account/logout controls:

- Admin layout shows the current account email when available to the signed-in browser session.
- Admin layout shows an admin account area and localized logout action.
- `Back to dashboard` remains available from the admin shell.
- Logout uses the browser Nhost sign-out flow and redirects to the localized login route.
- After logout, admin APIs should return `401` and admin pages should show a safe unauthorized/login state.

Production setup required before final demo:

- `ADMIN_EMAIL_ALLOWLIST` must be configured as a server-only Vercel environment variable.
- Migration `nhost/migrations/default/0005_add_organization_concierge_notes/up.sql` must be applied and tracked if concierge status, priority, notes, follow-up, or internal review are used.
- Re-run a deployment after env or migration changes.

Final workspace checklist:

1. Organizations list shows real organizations, readiness, document count, linked evidence count, buyer request count, certificate warning count, active link state, triage, concierge status, and priority.
2. Organization detail shows overview, section readiness, missing actions, buyer request summary, support checklist, internal review state, and concierge fields.
3. Risks dashboard shows aggregate risk cards and risk items for certificates, overdue buyer requests, missing evidence, low readiness, no active public link, no documents, and no linked evidence.
4. Risk items and organization detail links navigate correctly.
5. Search controls filter locally; no dead filter or action controls are shown.
6. Internal note/status/follow-up/review actions persist after refresh.

Final privacy checklist:

- No private document URLs.
- No storage file IDs.
- No raw sensitive answer dump.
- No user/member lists.
- No impersonation.
- No email sending.
- No buyer portal/login.
- No public certification, approval, verification, audit, or assurance claim.

Faza 3.3 deferred items:

- Full audit/event history.
- Per-missing-action acknowledgement/dismissal.
- Impersonation.
- Buyer portal/login.
- Email sending.
- AI, Stripe, XBRL, plan limits, or Supabase.

## Faza 3.4 Assisted Onboarding Foundation

The Admin / Concierge organization detail page includes an assisted onboarding panel for internal customer setup tracking.

Admin routes:

- `/en/admin/organizations/[id]`
- `/hr/admin/organizations/[id]`
- `/de/admin/organizations/[id]`

Data model:

- Reuses `organization_concierge_notes`.
- Migration: `nhost/migrations/default/0006_add_assisted_onboarding_fields/up.sql`
- Added fields:
  - `onboarding_status`
  - `onboarding_next_action`
  - `onboarding_checklist`
  - `onboarding_owner_note`
  - `onboarding_completed_at`

Supported onboarding statuses:

- `not_started`
- `invited`
- `setup_in_progress`
- `waiting_on_supplier`
- `ready_for_review`
- `demo_ready`
- `completed`
- `paused`

Production action:

1. Apply and track `nhost/migrations/default/0006_add_assisted_onboarding_fields/up.sql` after `0005_add_organization_concierge_notes`.
2. Confirm `organization_concierge_notes` remains admin-only and is not exposed to supplier/public routes.
3. Redeploy after migration tracking if Hasura metadata or schema cache requires refresh.

Checklist behavior:

- The onboarding checklist is derived from existing organization data where possible.
- Current derived items include workspace creation, company profile signal, questionnaire progress, core readiness, evidence upload/linking, certificate warning state, Passport review signal, active public link, PDF availability, and buyer request presence.
- The checklist does not fake completed work and does not modify supplier questionnaire, document, Passport, or buyer request data.

Privacy scope:

- Onboarding status, next action, owner note, checklist storage, and completion timestamp are internal admin/concierge data.
- They must not appear in supplier dashboard pages, public Passport pages, public PDF exports, buyer request public surfaces, or share links.
- No partner accounts, buyer portal, impersonation, email sending, AI, Stripe, XBRL, plan limits, or Supabase are included in this step.

Manual QA:

1. Deploy and apply migration `0006_add_assisted_onboarding_fields`.
2. Login as an allowlisted admin.
3. Open `/hr/admin/organizations`.
4. Confirm the list shows onboarding status and checklist progress.
5. Open an organization detail page.
6. Update onboarding status, next action, owner note, and next follow-up date.
7. Save, refresh, and confirm persistence.
8. Confirm the onboarding checklist reflects real supplier progress.
9. Confirm supplier dashboard, public Passport, share links, and PDFs do not show onboarding notes.
10. Repeat a quick route/copy check on `/en` and `/de`.

## Faza 3.4 Partner-Ready Portfolio Grouping

The Admin / Concierge organization list and detail pages support internal grouping of organizations into assisted portfolios.

Admin routes:

- `/en/admin/organizations`
- `/hr/admin/organizations`
- `/de/admin/organizations`
- `/en/admin/organizations/[id]`
- `/hr/admin/organizations/[id]`
- `/de/admin/organizations/[id]`

Data model:

- Reuses `organization_concierge_notes`.
- Migration: `nhost/migrations/default/0007_add_admin_portfolio_fields/up.sql`
- Added fields:
  - `portfolio_label`
  - `partner_label`
  - `assigned_consultant_note`

Behavior:

- Organization detail lets an allowlisted admin set a portfolio label, assisted-by label, and internal partner note.
- Organization list shows portfolio and assisted-by labels.
- Organization list search includes organization name, portfolio label, and assisted-by label.
- Organization list has working portfolio and triage filters.
- Organization list shows safe portfolio summary counts, including unassigned portfolio count.

Privacy scope:

- Portfolio labels and internal partner notes are admin-only.
- They must not appear in supplier dashboard pages, public Passport pages, PDF exports, buyer request public surfaces, or share links.
- No partner accounts, partner login, partner permissions, buyer portal, impersonation, email sending, AI, Stripe, XBRL, plan limits, or Supabase are included.

Production action:

1. Apply and track `nhost/migrations/default/0007_add_admin_portfolio_fields/up.sql` after the concierge/onboarding migrations.
2. Confirm `organization_concierge_notes` remains admin-only.
3. Redeploy or refresh Hasura schema metadata if needed.

Manual QA:

1. Login as an allowlisted admin.
2. Open `/hr/admin/organizations`.
3. Open an organization detail page.
4. Set `Oznaka portfelja`, `Podržava`, and `Interna partnerska bilješka`.
5. Save, refresh, and confirm persistence.
6. Return to `/hr/admin/organizations` and confirm portfolio label appears.
7. Test the portfolio filter and triage filter.
8. Confirm supplier dashboard, public Passport, share links, and PDFs do not show portfolio/internal partner notes.
9. Repeat a quick route/copy check on `/en` and `/de`.

## Faza 3.4.1 Admin Detail Save Actions

The admin organization detail page uses the existing admin-only concierge endpoint for these internal actions:

- Assisted onboarding save.
- Concierge status save.
- Internal review marker.
- Assisted portfolio fields.

Endpoint:

- `PATCH /api/admin/organizations/[id]/concierge`

Expected behavior:

- Each active save/review button sends a PATCH request.
- The route requires an allowlisted admin user through the server-side admin gate.
- The organization id comes from the admin route context.
- The route upserts `organization_concierge_notes`.
- Successful saves return the updated concierge object.
- Failed saves show localized safe errors in the admin UI.

Fields updated by the shared admin support save:

- `status`
- `priority`
- `internal_note`
- `next_follow_up_date`
- `reviewed_at`
- `reviewed_by_user_id`
- `onboarding_status`
- `onboarding_next_action`
- `onboarding_owner_note`
- `onboarding_completed_at`
- `portfolio_label`
- `partner_label`
- `assigned_consultant_note`

Manual QA:

1. Login as an allowlisted admin.
2. Open `/hr/admin/organizations/[id]`.
3. Edit onboarding status, next action, and onboarding note.
4. Click `Spremi onboarding podatke`; confirm a PATCH request and success message.
5. Refresh and confirm persistence.
6. Edit concierge status, priority, next contact, and internal note.
7. Click `Spremi concierge status`; confirm a PATCH request and success message.
8. Refresh and confirm persistence.
9. Click `Označi kao pregledano`; confirm a PATCH request and internal review state.
10. Confirm a normal supplier cannot call the PATCH endpoint.

## Faza 3.4 Portfolio Overview and Follow-Up Workflow

The Admin / Concierge organizations page includes a portfolio overview for managing assisted client groups without creating partner accounts.

Behavior:

- `/[locale]/admin/organizations` shows portfolio overview cards using live admin summaries.
- Summary cards include total portfolios, total organizations, demo-ready organizations, waiting-on-supplier organizations, high-priority organizations, upcoming follow-ups, and organizations without a portfolio.
- The "Organizations by portfolio" section groups organizations by `portfolio_label`; empty labels are grouped as "No portfolio assigned".
- Each portfolio group shows organization count, average readiness, high-priority count, waiting-on-supplier count, and upcoming follow-up count.
- Portfolio group actions filter the organization list to that portfolio.
- Organization filters are functional for portfolio, triage, concierge status, priority, and organization search.
- Follow-up labels use `next_follow_up_date`:
  - overdue when the date is before today
  - due today when the date is today
  - due soon when the date is within the next 7 days
  - no follow-up scheduled when no date is set
- Completed or paused onboarding/support items are not treated as urgent follow-ups.

Data model:

- Reuses `organization_concierge_notes`.
- Uses `portfolio_label`, `partner_label`, `priority`, `status`, `onboarding_status`, and `next_follow_up_date`.
- Requires `nhost/migrations/default/0007_add_admin_portfolio_fields/up.sql` if portfolio fields are not yet in production.

Privacy scope:

- Portfolio labels, assisted-by labels, internal partner notes, concierge status, and follow-up dates are admin-only.
- They must not appear in supplier dashboards, public Passport pages, public PDFs, share links, or buyer-facing surfaces.
- No partner accounts, partner login, partner permissions, automated reminders, impersonation, buyer portal, email sending, AI, Stripe, XBRL, plan limits, or Supabase are included.

Manual QA:

1. Login as an allowlisted admin.
2. Open `/hr/admin/organizations`.
3. Confirm portfolio overview cards appear.
4. Assign portfolio labels to at least two organizations from organization detail pages.
5. Return to `/hr/admin/organizations` and confirm grouping by portfolio.
6. Click a portfolio group action and confirm the list filters to that portfolio.
7. Test portfolio, triage, concierge status, priority, and search filters.
8. Set next follow-up dates for overdue, today, and within 7 days; confirm localized labels.
9. Confirm supplier dashboard, public Passport, share links, and PDFs do not show portfolio/internal partner notes.
10. Repeat a quick route/copy check on `/en` and `/de`.

## Faza 3.4 Assisted Onboarding Handoff Package

Admin organization detail pages include an internal handoff summary for assisted onboarding and future partner/consultant handoff.

Routes:

- `/en/admin/organizations/[id]`
- `/hr/admin/organizations/[id]`
- `/de/admin/organizations/[id]`

Behavior:

- The handoff panel is admin-only and generated client-side from already-loaded admin summary data.
- It includes organization name, portfolio label, assisted-by label, concierge status, priority, onboarding status, onboarding progress, readiness percentage, evidence counts, certificate warning count, buyer request count, public link status, next action, next follow-up date, top missing actions, and a shortened internal note excerpt.
- It excludes private document URLs, storage IDs, raw sensitive answers, user/member data, and share token values.
- Handoff readiness is derived from current admin fields:
  - `Handoff ready` when next action and follow-up date are present and the organization is not high-risk/high-priority.
  - `Missing next action` when the next action is empty.
  - `Missing follow-up date` when no follow-up date is set.
  - `Needs update` when the organization is at risk or marked high priority.
- `Copy handoff summary` writes plain text to the admin clipboard only.
- `Download handoff .txt` creates a local text file in the browser from the same safe text.
- No email sending, partner account, partner login, buyer portal, impersonation, AI, Stripe, XBRL, plan limits, Supabase, or public handoff route is included.

Manual QA:

1. Login as an allowlisted admin.
2. Open `/hr/admin/organizations/[id]`.
3. Confirm `Interni handoff sažetak` appears.
4. Confirm the panel shows portfolio, onboarding, readiness, evidence, buyer request, next action, follow-up, and missing-action data.
5. Click `Kopiraj handoff sažetak`, paste into a text editor, and confirm the text is marked internal and contains no private URLs, storage IDs, raw answers, user/member data, or share token values.
6. Click `Preuzmi handoff .txt` and inspect the downloaded text file.
7. Clear next action or follow-up date and confirm the handoff readiness label changes after saving/refreshing.
8. Confirm supplier dashboard, public Passport, share links, and PDFs do not show handoff data.
9. Repeat a quick route/copy check on `/en` and `/de`.

## Faza 3.4 Assisted Onboarding Final QA

Faza 3.4 closes the admin-only assisted onboarding and partner-ready workspace.

Implemented scope:

- Assisted onboarding status, next action, onboarding note, and follow-up date.
- Derived onboarding checklist from real supplier workspace progress.
- Portfolio grouping using internal portfolio and assisted-by labels.
- Portfolio overview, grouping, and list filters.
- Follow-up visibility for overdue, due today, due soon, and no scheduled follow-up.
- Internal handoff summary with copy and text download.
- Admin-only concierge status, priority, internal notes, and internal review marker.

Production migration requirements:

1. Apply and track `nhost/migrations/default/0005_add_organization_concierge_notes/up.sql`.
2. Apply and track `nhost/migrations/default/0006_add_assisted_onboarding_fields/up.sql`.
3. Apply and track `nhost/migrations/default/0007_add_admin_portfolio_fields/up.sql`.
4. Refresh Hasura/Nhost metadata or schema cache if production does not immediately expose the new columns.

SQL QA checklist:

```sql
select
  id,
  organization_id,
  status,
  priority,
  internal_note,
  next_follow_up_date,
  onboarding_status,
  onboarding_next_action,
  onboarding_owner_note,
  portfolio_label,
  partner_label,
  assigned_consultant_note,
  reviewed_at,
  created_at,
  updated_at
from organization_concierge_notes
order by updated_at desc
limit 20;
```

Admin route QA:

- `/en/admin`
- `/hr/admin`
- `/de/admin`
- `/en/admin/organizations`
- `/hr/admin/organizations`
- `/de/admin/organizations`
- `/en/admin/organizations/[id]`
- `/hr/admin/organizations/[id]`
- `/de/admin/organizations/[id]`
- `/en/admin/risks`
- `/hr/admin/risks`
- `/de/admin/risks`

Privacy guarantees:

- `organization_concierge_notes` data is admin-only.
- Onboarding status, onboarding notes, portfolio labels, partner labels, assigned consultant notes, concierge status, internal notes, internal handoff summaries, reviewed timestamps, and reviewed-by fields must not be shown on supplier dashboards, public Passport pages, public PDFs, share links, or buyer-facing surfaces.
- Admin handoff summaries must not include private document URLs, storage file IDs, raw sensitive answers, full share tokens, JWTs, cookies, secrets, or unnecessary user/member data.

Deferred scope:

- Partner accounts.
- Partner login.
- Partner permissions.
- Automated email or reminder sending.
- Buyer portal.
- User impersonation.
- AI, Stripe, XBRL, plan limits, or Supabase.

Manual production QA:

1. Deploy.
2. Confirm `ADMIN_EMAIL_ALLOWLIST` is configured server-side in Vercel.
3. Login as an allowlisted admin.
4. Open `/hr/admin/organizations`.
5. Open an organization detail page.
6. Edit onboarding status, next action, onboarding note, and follow-up date.
7. Save and refresh to confirm persistence.
8. Edit portfolio label, assisted-by label, and internal partner note.
9. Save and refresh to confirm persistence.
10. Confirm portfolio overview cards, grouping, and filters use real counts.
11. Confirm follow-up labels show overdue, due today, due soon, and no scheduled follow-up where applicable.
12. Copy handoff summary and inspect the pasted text for internal-only safe content.
13. Download handoff `.txt` and inspect the file.
14. Open `/hr/admin/risks` and confirm risk links still open organization detail.
15. Confirm supplier dashboard, Supplier Passport, public Passport, share links, and PDFs do not show onboarding, portfolio, concierge, or handoff data.
16. Login as a normal supplier and confirm admin routes/APIs are forbidden.
17. Repeat quick route/copy checks on `/en` and `/de`.

## Faza 3.5 Korak 1 - Commercial Readiness Without Billing

Faza 3.5 starts with commercial positioning only. It does not add billing, checkout, Stripe, invoices, or plan enforcement.

Commercial plan labels:

- Starter: core Supplier Passport readiness workspace.
- Supplier Pro: buyer request, evidence readiness, certificate tracking, and response preparation positioning.
- Partner: assisted portfolio, concierge dashboard, onboarding tracking, and internal handoff positioning.
- Buyer Pilot: buyer-side discovery and pilot scoping.
- Buyer Pro: future/deferred buyer-side supplier network concept.

Important behavior:

- Plan labels are copy/metadata only.
- Admin organization list/detail may show the current workspace plan label.
- If an organization has no recognized `plan_key`, the UI falls back to `Starter`.
- Billing is not enabled in this version.
- Plan limits are not enforced in this version.
- Pricing CTAs are demo/contact links only and must not route to checkout.

Manual production QA:

1. Deploy.
2. Open `/en`, `/hr`, and `/de` and confirm the landing plan section describes plan positioning without prices or checkout.
3. Open `/en/pricing`, `/hr/pricing`, and `/de/pricing`.
4. Confirm the page shows Starter, Supplier Pro, Partner, Buyer Pilot, and Buyer Pro future/deferred positioning.
5. Confirm there is no monthly/annual billing toggle, no checkout, no invoices, and no hard plan limit language.
6. Click the demo/contact CTA and confirm it opens a real mail link, not a dead route.
7. Login as admin and open `/hr/admin/organizations`.
8. Confirm each organization shows a safe current workspace plan label.
9. Open an organization detail page and confirm the plan label appears in the admin summary/handoff context.
10. Confirm supplier/public routes do not expose admin-only commercial notes.

Deferred scope:

- Stripe.
- Billing.
- Checkout.
- Invoices.
- Plan enforcement.
- Buyer Pro product behavior.

## Faza 3.5 Korak 2 - Plans Page And Feature Matrix

The public commercial page uses the existing localized pricing route:

- `/en/pricing`
- `/hr/pricing`
- `/de/pricing`

This route now functions as a plans page for sales/demo conversations. It includes:

- Starter, Supplier Pro, Partner, Buyer Pilot, and Buyer Pro future/deferred plan cards.
- A feature matrix covering Supplier Passport profile, questionnaire, Evidence Data Room, document evidence linking, certificate expiry tracking, public Passport link, PDF draft export, Buyer Request Workspace, Admin/Concierge Workspace, assisted onboarding, portfolio grouping, internal handoff summaries, buyer-side dashboard, and online billing.
- A clear pricing stance: pricing is handled manually during pilot rollout and online checkout is not enabled.
- Real CTAs only: localized signup for starting Supplier Passport and a `mailto:` demo request link.

Safety rules:

- Do not add Stripe, checkout, payment, invoices, online billing, or plan enforcement.
- Do not gate or block product features by plan label.
- Do not expose organization data, documents, storage IDs, share tokens, admin data, or user/member data on the public plans page.
- Buyer Pro must remain marked as future/deferred until a real buyer-side product exists.

Manual QA:

1. Deploy.
2. Open `/hr/pricing`.
3. Confirm plan cards appear for Starter, Supplier Pro, Partner, Buyer Pilot, and Buyer Pro.
4. Confirm Buyer Pro is marked future/deferred.
5. Confirm the feature matrix appears and includes online billing as not enabled.
6. Confirm there are no fake prices, checkout buttons, payment references, renewal dates, or billed-monthly claims.
7. Click `Započni Supplier Passport` and confirm it routes to localized signup.
8. Click `Zatraži demo` and confirm it opens a real mail link.
9. Repeat quick checks on `/en/pricing` and `/de/pricing`.
10. Confirm `/en`, `/hr`, and `/de` navigation links to the plans/pricing route.

## Faza 3.5 Korak 3 - Demo Request And Sales CTA Flow

Public demo requests use a simple localized route:

- `/en/request-demo`
- `/hr/request-demo`
- `/de/request-demo`

Behavior:

- `Start Supplier Passport` routes to localized signup.
- `Request demo` routes to localized `/request-demo`.
- The request-demo page explains supplier, consultant/partner, and buyer-team use cases.
- The final contact CTA is a `mailto:` link to `deweb.eu@gmail.com` with a Supplier Passport demo request subject.
- No backend email sending, CRM integration, database write, checkout, payment, or billing flow is included.
- No fake submit form is shown.

Pilot rollout copy:

- Pricing and onboarding are handled manually during pilot rollout.
- Online billing is not enabled.
- Plan labels do not block or unlock product features.

Manual QA:

1. Deploy.
2. Open `/hr`.
3. Click `Započni Supplier Passport` and confirm localized signup opens.
4. Click `Zatraži demo` and confirm `/hr/request-demo` opens.
5. On `/hr/request-demo`, click `Kontaktirajte nas za demo` and confirm the mail client opens.
6. Open `/hr/pricing` and confirm all plan-card demo CTAs route to `/hr/request-demo`.
7. Repeat quick checks on `/en` and `/de`.
8. Confirm there is no fake submit form, checkout, payment flow, backend email sending, or private data on public pages.

## Faza 3.5 Korak 4 - Admin Commercial Segmentation

Commercial classification is admin-only metadata for sales, demos, onboarding, and pilot tracking. It does not add billing, checkout, Stripe, invoices, plan limits, or feature gating.

Data model:

- Reuses `organization_concierge_notes`.
- Migration: `nhost/migrations/default/0008_add_admin_commercial_fields/up.sql`.
- New nullable fields:
  - `commercial_plan`
  - `commercial_segment`
  - `commercial_status`
  - `commercial_note`
  - `pilot_start_date`
  - `pilot_target_date`

Allowed values:

- `commercial_plan`: `starter`, `supplier_pro`, `partner`, `buyer_pilot`, `buyer_pro_future`
- `commercial_segment`: `supplier`, `partner`, `buyer`, `consultant`, `internal_demo`
- `commercial_status`: `lead`, `pilot`, `active`, `paused`, `churn_risk`, `closed`

Admin UI behavior:

- Organization detail shows a `Commercial classification` panel.
- Admin can save plan/package, segment, commercial status, pilot start date, pilot target date, and commercial note through the existing admin concierge PATCH endpoint.
- Organization list shows compact commercial labels and pilot target date.
- Organization list filters include plan, segment, and commercial status.
- Organization list summary cards include active pilots, leads, churn risk, and partner prospects.

Privacy and scope:

- Commercial metadata is internal/admin-only.
- Commercial notes, pilot dates, commercial status, and internal segment labels must not appear on supplier dashboard routes, public Passport pages, public PDFs, buyer request response notes, or share links.
- Commercial labels do not enforce billing or feature limits.
- Buyer Pro remains future/deferred positioning.

Production action:

1. Apply and track `nhost/migrations/default/0008_add_admin_commercial_fields/up.sql` after migration `0007_add_admin_portfolio_fields`.
2. Refresh Hasura/Nhost metadata or schema cache if the new columns are not immediately visible.
3. Confirm admin routes remain protected by `ADMIN_EMAIL_ALLOWLIST`.

SQL QA checklist:

```sql
select
  id,
  organization_id,
  commercial_plan,
  commercial_segment,
  commercial_status,
  commercial_note,
  pilot_start_date,
  pilot_target_date,
  updated_at
from organization_concierge_notes
order by updated_at desc
limit 20;
```

Manual QA:

1. Deploy and apply migration `0008_add_admin_commercial_fields`.
2. Login as admin.
3. Open `/hr/admin/organizations`.
4. Open organization detail.
5. Set commercial plan, segment, status, pilot dates, and commercial note.
6. Save and refresh to confirm persistence.
7. Return to organization list and confirm labels appear.
8. Test plan, segment, and commercial status filters.
9. Confirm supplier dashboard, public Passport, public PDF, and buyer-facing share pages do not show commercial metadata.

## Faza 3.5 Korak 5 - Commercial Readiness Final QA

Faza 3.5 closes commercial readiness as positioning and admin metadata only. It does not add billing, checkout, Stripe, invoices, subscriptions, plan limits, feature gating, payment collection, AI, XBRL, or Supabase.

Public routes to verify:

- `/en`, `/hr`, `/de`
- `/en/pricing`, `/hr/pricing`, `/de/pricing`
- `/en/request-demo`, `/hr/request-demo`, `/de/request-demo`
- `/en/signup`, `/hr/signup`, `/de/signup`

Public commercial QA:

1. Landing pages load in all three locales.
2. Pricing pages show Starter, Supplier Pro, Partner, Buyer Pilot, and Buyer Pro future/deferred positioning.
3. Feature matrix is visible and marks buyer-side dashboard and online billing as future/not enabled where applicable.
4. Buyer Pro is clearly future/deferred.
5. Pricing copy states pilot rollout and manual commercial handling. It must not imply online checkout, active payment collection, invoices, paid subscription state, upgrade flow, or renewal dates.
6. `Start Supplier Passport` routes to localized signup.
7. `Request demo` routes to localized `/request-demo`.
8. Request-demo contact CTA uses the safe mail link and does not submit a fake form or send backend email.
9. Public pages do not load organization data, documents, storage IDs, share tokens, user/member data, or admin metadata.

Admin commercial QA:

1. Apply and track migration `nhost/migrations/default/0008_add_admin_commercial_fields/up.sql` after `0007_add_admin_portfolio_fields`.
2. Login as an allowlisted admin.
3. Open `/hr/admin/organizations`, then an organization detail page.
4. Set commercial plan, segment, commercial status, pilot start date, pilot target date, and commercial note.
5. Save and refresh to confirm persistence.
6. Return to the organization list and confirm compact plan, segment, status, and pilot target labels appear.
7. Test visible plan, segment, and commercial status filters.
8. Confirm commercial metadata is not visible in supplier dashboard, public Passport, public PDF, buyer request response notes, or share pages.
9. Confirm normal supplier users and logged-out users cannot access admin commercial APIs or pages.

Privacy and scope:

- Commercial notes, pilot dates, commercial status, and internal segment labels are admin-only.
- Public plans use generic commercial package positioning only.
- No private document URLs, storage file IDs, raw answers, secrets, cookies, JWTs, share tokens, or admin allowlists should be exposed or logged.
- Avoid public claims such as `Certified`, `VSME certified`, `Audit-ready`, `Approved`, `Verified supplier`, legally compliant, or guaranteed compliance unless the copy is explicitly a disclaimer saying the product is not that.

Deferred after Faza 3.5:

- Billing.
- Stripe.
- Checkout.
- Invoices.
- Plan enforcement.
- Buyer Pro platform.

## Faza 4.0 Korak 1 - Buyer Portal Foundation

Buyer Portal starts with a token-only access model. It reuses supplier-controlled share links and does not add buyer accounts, buyer login, buyer organizations, invitations, email sending, billing, Stripe, AI, XBRL, or Supabase.

Routes:

- `/en/buyer`, `/hr/buyer`, `/de/buyer`
- `/en/buyer/suppliers`, `/hr/buyer/suppliers`, `/de/buyer/suppliers`
- `/en/buyer/suppliers/[token]`, `/hr/buyer/suppliers/[token]`, `/de/buyer/suppliers/[token]`

Access model:

- Buyer access is based on an active supplier share token.
- Suppliers control the lifecycle through existing share link activation and expiry.
- `/buyer/suppliers` is intentionally neutral because personalized buyer supplier lists require authenticated buyer accounts, which are deferred.
- Password-protected share links still use the existing token-scoped password verification flow.

Buyer-safe data:

- Organization/supplier name.
- Supplier Passport readiness percentage.
- Section-level completion summary.
- High-level evidence availability count.
- Certificate expiry summary.
- Static guidance that supporting evidence is available on request.

Excluded from buyer portal:

- Private document URLs.
- Storage file IDs.
- Raw sensitive questionnaire answers.
- User/member data.
- Internal buyer request notes.
- Admin, concierge, onboarding, portfolio, handoff, or commercial notes.
- Full share token values in UI or logs.
- Email sending or automated requests.

Unavailable state:

- Invalid, inactive, expired, or missing live share data shows a neutral unavailable page.
- No mock supplier list is shown on buyer portal routes.
- No supplier dashboard/sidebar/admin navigation appears in buyer portal routes.

Manual QA:

1. Deploy.
2. Open `/hr/buyer`.
3. Confirm the access-model copy says buyer access uses supplier links and private evidence files are not publicly downloadable.
4. Open `/hr/buyer/suppliers` and confirm it shows neutral guidance, not a fake supplier list.
5. Open a valid `/hr/buyer/suppliers/[token]` in incognito.
6. Confirm the buyer-safe supplier summary loads without buyer login.
7. Confirm no private file URL, storage ID, raw answer dump, user/member data, admin note, commercial note, or full share token is visible.
8. Open `/hr/buyer/suppliers/invalid-token-test` and confirm the safe unavailable state.
9. Repeat quick checks on `/en/buyer` and `/de/buyer`.

## Faza 4.0 Korak 2 - Buyer Portal Supplier Navigation

The buyer supplier navigation remains token-only. `/buyer/suppliers` does not show saved suppliers, mock suppliers, buyer accounts, buyer organizations, or buyer login. It shows neutral instructions and a local link/token opener for supplier-shared Passport links.

Supplier list behavior:

- `/[locale]/buyer` explains that buyers review summaries shared with them by suppliers.
- `/[locale]/buyer/suppliers` says saved suppliers are not available without buyer accounts.
- Buyers can paste a full `/passport/[token]` URL, a `/buyer/suppliers/[token]` URL, or a plain token to open `/[locale]/buyer/suppliers/[token]`.
- The opener routes client-side only. It does not store the token, create an account, or call an API until the token route loads.
- Empty or malformed input shows a localized validation message.
- `/[locale]/buyer/suppliers/[token]` includes back links to Buyer Portal and supplier-link instructions.

Privacy checklist:

- No fake saved supplier list.
- No token persistence.
- No full share token value in UI or logs.
- No private document URLs, storage file IDs, raw sensitive answers, user/member data, internal notes, admin/concierge data, onboarding/portfolio/handoff data, or commercial metadata.
- No email sending, buyer login, buyer organization management, AI, Stripe, XBRL, Supabase, or billing changes.

Manual QA:

1. Deploy.
2. Open `/hr/buyer`.
3. Open `/hr/buyer/suppliers` and confirm there is no fake supplier list.
4. Paste a valid `/passport/[token]`, `/buyer/suppliers/[token]`, or plain token and confirm it routes to `/hr/buyer/suppliers/[token]`.
5. Confirm the valid token page shows only the buyer-safe summary and back navigation.
6. Test an empty/malformed token and confirm localized validation.
7. Open an invalid token route and confirm the safe unavailable state.
8. Confirm no private URLs, storage IDs, raw answers, admin/internal notes, or full token values are visible.
9. Repeat quick checks on `/en/buyer/suppliers` and `/de/buyer/suppliers`.

## Faza 4.0 Korak 3 - Buyer Supplier Comparison

Buyer comparison is a token-based, browser-local shortlist. It does not create buyer accounts, buyer login, buyer organizations, server-side saved buyer lists, email sending, billing, Stripe, AI, XBRL, or Supabase.

Routes and API:

- `/en/buyer/compare`, `/hr/buyer/compare`, `/de/buyer/compare`
- `POST /api/buyer/compare`

Storage model:

- The compare page stores supplier share tokens only in browser `localStorage` under `supplier-passport:buyer-compare:v1`.
- No buyer shortlist or comparison list is persisted in the database.
- Buyers can remove individual suppliers or clear the full local comparison.
- The compare page accepts `/passport/[token]`, `/buyer/suppliers/[token]`, or a plain token.
- The supplier summary page can open `/buyer/compare?token=...`; the compare page stores it locally and then removes the token query from the visible URL.
- Maximum comparison size is 10 suppliers.

Safe compare API behavior:

- Accepts up to 10 normalized tokens.
- Does not echo full tokens in the response.
- Returns indexed buyer-safe summaries only: organization name, readiness percentage, last updated date, evidence count, certificate status, and section completion/status.
- Invalid, inactive, expired, mock, or unavailable tokens return an unavailable item.
- Password-protected links return a password-required item unless already verified through the existing token-scoped share cookie.
- Logs only stage/index/error message metadata, not token values.

Excluded from comparison:

- Private document URLs.
- Storage file IDs.
- Raw sensitive questionnaire answers.
- User/member data.
- Buyer request notes.
- Admin, concierge, onboarding, portfolio, handoff, or commercial notes.
- Full share token values in UI, API responses, or logs.

Manual QA:

1. Deploy.
2. Open `/hr/buyer/compare`.
3. Add a valid supplier link or token and confirm the summary appears.
4. Add a second valid supplier link if available and confirm side-by-side cards/table rows.
5. Add an invalid token and confirm the unavailable state.
6. Remove one supplier and confirm it disappears from the browser-local list.
7. Clear the comparison and confirm the list is empty.
8. Open `/hr/buyer/suppliers/[token]`, click `Dodaj u usporedbu`, and confirm it lands on comparison without showing the token in the URL afterward.
9. Confirm no private URLs, storage IDs, raw answers, user/member data, admin/internal notes, or full token values are visible.
10. Repeat quick checks on `/en/buyer/compare` and `/de/buyer/compare`.

## Faza 4.0 Korak 4 - Buyer Request Follow-up Without Email

Buyer request follow-up is copy-message only in this phase. It does not create a backend request intake, supplier-side draft, buyer account, buyer login, email, CRM activity, or server-side buyer list.

Behavior:

- `/[locale]/buyer/suppliers/[token]` shows a `Request supporting evidence` panel for valid supplier summaries.
- `/[locale]/buyer/compare` shows the same request-message action on each valid supplier card.
- The copy action generates a plain-text request message with the supplier organization name and public `/[locale]/passport/[token]` summary link.
- The message tells the buyer to request supporting evidence directly through their usual procurement channel.
- No `Send request`, `Submit request`, `Email supplier`, or fake backend action is shown.

Excluded from copied messages:

- Private document URLs.
- Storage file IDs.
- Raw sensitive answer values.
- Admin, concierge, onboarding, portfolio, handoff, or commercial notes.
- Buyer request internal notes.
- Any automatic email delivery or CRM integration.

Deferred:

- Backend request intake from public buyer tokens.
- Supplier-side inbound request drafts.
- Buyer accounts and buyer organization workflows.
- Email automation.

Manual QA:

1. Deploy.
2. Open `/hr/buyer/suppliers/[token]`.
3. Confirm `Zatražite dokaznu dokumentaciju` appears.
4. Click `Kopiraj poruku zahtjeva`.
5. Paste the message into a text editor and confirm it contains only supplier name plus a public `/hr/passport/[token]` link.
6. Confirm no private document URL, storage ID, raw answer, admin note, commercial note, or backend-send action is visible.
7. Open `/hr/buyer/compare` with at least one valid supplier.
8. Confirm each valid supplier card can copy the request message.
9. Repeat quick checks on `/en` and `/de`.

## Faza 4.0 Korak 5 - Buyer Portal Final QA

Buyer Portal remains a token-based, buyer-safe foundation. It does not include buyer accounts, buyer login, buyer organization management, server-side saved shortlists, email sending, CRM integration, billing, Stripe, AI, XBRL, or Supabase.

Routes to verify:

- `/en/buyer`, `/hr/buyer`, `/de/buyer`
- `/en/buyer/suppliers`, `/hr/buyer/suppliers`, `/de/buyer/suppliers`
- `/en/buyer/suppliers/[token]`, `/hr/buyer/suppliers/[token]`, `/de/buyer/suppliers/[token]`
- `/en/buyer/compare`, `/hr/buyer/compare`, `/de/buyer/compare`
- `/en/passport/[token]`, `/hr/passport/[token]`, `/de/passport/[token]`

API to verify:

- `POST /api/buyer/compare`

Final QA expectations:

- `/buyer` explains buyer access is based on supplier-shared links.
- `/buyer/suppliers` has no fake saved supplier list and says buyer accounts are not enabled.
- The token opener accepts a full `/passport/[token]` URL, `/buyer/suppliers/[token]` URL, or plain token.
- Valid `/buyer/suppliers/[token]` pages show supplier name, readiness, section statuses, evidence availability, certificate status, disclaimer, back navigation, add-to-comparison, and request-evidence copy.
- Invalid, inactive, expired, or missing live token data shows a safe unavailable state with no mock fallback.
- `/buyer/compare` stores comparison tokens only in browser `localStorage`, enforces a maximum of 10 suppliers, allows remove/clear, and marks invalid tokens unavailable.
- Request evidence copy contains only supplier name plus a public `/[locale]/passport/[token]` summary link.
- No buyer route or buyer API exposes private document URLs, storage file IDs, raw sensitive answers, user/member data, buyer request internal notes, admin notes, concierge/onboarding/portfolio/handoff data, commercial metadata, full token values in logs, or admin secrets.

Production manual QA checklist:

1. Deploy.
2. Open `/hr/buyer` and confirm the access-model copy.
3. Open `/hr/buyer/suppliers` and confirm there is no fake supplier list.
4. Open a valid `/hr/buyer/suppliers/[token]`.
5. Confirm the page is buyer-safe and has back navigation.
6. Click `Dodaj u usporedbu` and confirm `/hr/buyer/compare` opens.
7. Add, remove, and clear a supplier in comparison.
8. Add an invalid token and confirm the unavailable state.
9. Click `Kopiraj poruku zahtjeva`, paste the text, and confirm it contains only the public Passport link.
10. Confirm no private URLs, storage IDs, raw answers, internal notes, user/member data, or full token values are visible.
11. Open an invalid `/hr/buyer/suppliers/not-a-real-token` and confirm safe unavailable copy.
12. Repeat quick checks on `/en` and `/de`.

Deferred after Faza 4.0:

- Buyer accounts and buyer login.
- Buyer organization management.
- Server-side saved buyer shortlists.
- Backend request intake and supplier-side inbound drafts.
- Email/CRM automation.

## Faza 4.1 Korak 1 - Full Route and Localization Smoke Test

Route smoke testing covers the public, supplier dashboard, admin, buyer, and token-based public surfaces across English, Croatian, and German.

Route expectations:

- Public routes: `/en`, `/hr`, `/de`, `/[locale]/pricing`, `/[locale]/plans`, and `/[locale]/request-demo` must load or redirect safely. `/[locale]/plans` is a locale-preserving alias to `/[locale]/pricing`.
- Supplier dashboard routes: `/[locale]/dashboard`, questionnaire, documents, Passport, share, buyer requests, company profile, settings, and activity remain authenticated supplier surfaces.
- Admin routes: `/[locale]/admin`, `/[locale]/admin/organizations`, and `/[locale]/admin/risks` remain admin-gated by server-side admin access.
- Buyer routes: `/[locale]/buyer`, `/[locale]/buyer/suppliers`, and `/[locale]/buyer/compare` are public buyer-safe surfaces.
- Token routes: `/[locale]/passport/[token]` and `/[locale]/buyer/suppliers/[token]` must show buyer-safe summaries for valid active tokens and safe unavailable states for invalid, expired, inactive, missing, or mock-only data.

Localization checklist:

- All navigation should preserve the current locale unless the language switcher is intentionally changing locale.
- Croatian public/buyer/admin copy must preserve diacritics such as `dobavljača`, `Zatražite`, `omogućeni`, `sažetak`, `praćenje`, `više`, `računi`, and `Dovršenost`.
- Avoid visible `Saćetak`, `dobavlja?`, `Zatra?`, `sa?etak`, `undefined`, `null`, `NaN`, or `[object Object]` in production UI.
- English strings such as `Basic Information`, `Environment`, and `Social` may exist as translation keys or English locale values, but Croatian/German rendered labels should use localized values where those labels are visible.

Security checklist:

- Public and buyer routes must not expose private Nhost Storage URLs, storage file IDs, raw sensitive answers, user/member data, buyer request internal notes, admin notes, concierge/onboarding/portfolio/handoff data, commercial metadata, full token values in logs, admin secrets, or private file contents.
- Supplier dashboard routes require supplier authentication.
- Admin routes require admin authorization.
- Buyer Portal does not add buyer accounts, buyer login, server-side saved shortlists, email sending, CRM, AI, Stripe, XBRL, Supabase, or plan enforcement.

Manual QA:

1. Deploy.
2. Open `/hr`, `/hr/plans`, `/hr/pricing`, and `/hr/request-demo`.
3. Confirm `/hr/plans` redirects to `/hr/pricing`.
4. Open the supplier dashboard routes while logged out and confirm safe auth behavior.
5. Log in as supplier and check `/hr/dashboard`, questionnaire, documents, Passport, share, buyer requests, company profile, settings, and activity.
6. Open `/hr/admin`, `/hr/admin/organizations`, and `/hr/admin/risks` as admin and as a normal supplier to confirm access behavior.
7. Open `/hr/buyer`, `/hr/buyer/suppliers`, and `/hr/buyer/compare`.
8. Open valid and invalid `/hr/passport/[token]` and `/hr/buyer/suppliers/[token]` routes.
9. Confirm no broken Croatian characters, English fallback in Croatian UI, mock supplier list, private URLs, storage IDs, raw answers, or dead navigation.
10. Repeat quick checks on `/en` and `/de`.

## Faza 4.1.1 Korak 1 - Company Profile Mapping and Questionnaire Deep Link

Company Profile combines the authenticated user's current organization record, the optional `company_profiles` row, and a narrow allowlist of questionnaire answers from `question_answers`.

Faza 4.1.3 update: Company Profile, the authenticated Passport/report summary, and the public Passport readiness presentation now share the same company-profile mapping and readiness visual helpers. This prevents Company Profile from showing neutral fallbacks while the Passport/report can already show real values such as industry, country, headquarters, and employee count.

Faza 4.1.4 update: Company Profile now loads questionnaire answers from `question_answers` directly and maps them through `question_item.code`, matching the production questionnaire/Passport answer source more closely. Do not reintroduce a nested `question_items { question_answers { ... } }` mapping for this page, because that shape can diverge from the live Passport/questionnaire source and fail back to empty profile cards.

Mapped questionnaire codes:

- `company_reporting_year` -> Reporting year in the questionnaire.
- `company_period_start` -> Reporting period start date in the questionnaire.
- `company_period_end` -> Reporting period end date in the questionnaire.
- `company_legal_name` -> Legal company name.
- `company_country` -> Country.
- `company_city` -> City/headquarters.
- `company_main_activity` -> Industry/main activity.
- `employees_total_headcount` -> Employee count.
- `cert_iso_9001`, `cert_iso_14001`, `cert_iso_45001`, `cert_iso_50001`, `cert_esg_rating`, and `cert_industry_specific` -> Key certifications when real questionnaire answers exist.

Organization name still comes from `organizations.name`. Website still comes from `company_profiles.website` because the current `company_basics` taxonomy does not define a website question.

Shared summary behavior:

- `lib/company-profile-summary.ts` normalizes organization fields, company profile fields, and selected questionnaire answers into `organizationName`, `legalCompanyName`, `country`, `city`, `headquarters`, `industry`, `employeeCount`, `website`, `reportingYear`, `reportingPeriodStart`, `reportingPeriodEnd`, `countriesServed`, and `keyCertifications`.
- Company Profile and Passport/report should use this shared mapper instead of duplicating question-code lookups.
- Missing fields must remain neutral fallbacks: `Not provided yet`, `Još nije uneseno`, or `Noch nicht angegeben`.

Report/public Passport layout QA:

- Long Croatian and German section labels, descriptions, and badges must wrap inside cards.
- Use shorter public badge labels where helpful: `Evidence available` / `Dokaz dostupan` / `Nachweis verfügbar` and `Evidence recommended` / `Dokaz preporučen` / `Nachweis empfohlen`.
- Public Passport and buyer summary section grids should reduce column count before labels become cramped; do not force five narrow cards across when localized copy needs more width.

Questionnaire deep-link behavior:

- Company Profile's update button links to `/[locale]/dashboard/questionnaire?section=company_basics`.
- The questionnaire opens Company Basics / Osnovni podaci / Unternehmensdaten for `section=company_basics`.
- Invalid section parameters fall back to the first live questionnaire section instead of crashing.
- The localized Company Profile pages are dynamic routes so they can read the current authenticated supplier organization instead of serving a prerendered neutral state.

Date input behavior:

- `company_period_start` and `company_period_end` render as HTML date inputs.
- Existing `DD-MM-YYYY` values are normalized to `YYYY-MM-DD` for the date input.
- Saved date values use `YYYY-MM-DD` where the browser date input is used.

Readiness visual behavior:

- `lib/readiness-visual-state.ts` is the shared visual helper for dashboard and Passport-style readiness indicators.
- Readiness below `33.333%` uses the red state.
- Readiness from `33.333%` through `66.666%` uses the yellow/amber state.
- Readiness above `66.666%` uses the green state.
- A subtle green glow is applied only when readiness is exactly `100%`.
- For the current live `31%` example, the dashboard and Passport/report readiness indicators should be red with no glow.
- PDF export remains a generated document surface; use the same readiness status/score where supported, but do not force browser-only glow effects into PDF output.

Manual QA:

1. Log in as a supplier with completed Company Basics / Osnovni podaci answers.
2. Open `/hr/dashboard/questionnaire?section=company_basics`.
3. Confirm `Osnovni podaci` is selected and completed answers such as legal company name, country, city, industry, employee count, and reporting dates are visible.
4. Open `/hr/dashboard/company-profile` and confirm real questionnaire/profile values render, including industry, country/headquarters, employee count, and legal company name when answered.
5. Confirm missing fields show `Još nije uneseno`/localized fallback, not mock company data.
6. Click `Ažuriraj u upitniku`.
7. Confirm `/hr/dashboard/questionnaire?section=company_basics` opens Osnovni podaci, not Energija.
8. Confirm the reporting-period date questions show date inputs and preserve existing dates after save and refresh.
9. Open `/hr/dashboard/passport` and a valid `/hr/passport/[token]` and confirm readiness colors follow red/yellow/green thresholds.
10. Confirm public Passport/readiness cards do not overflow for `Preporučuje se dokazna dokumentacija` replacements or German labels such as `Lieferantendaten`.
11. Repeat quick checks for `/en/dashboard/questionnaire?section=company_basics` and `/de/dashboard/questionnaire?section=company_basics`.

## Faza 4.1.5 Korak 1 - Dashboard Readiness Data Source

The localized dashboard home must be dynamic. `/[locale]/dashboard` reads the current authenticated supplier session and calls `getDashboardSetupSummary()` at request time. If the route is statically generated, the summary is calculated without a user session and the dashboard can freeze at `0%`, `0/0`, empty documents, and the neutral live-metrics fallback even when questionnaire/passport routes show real progress.

Dashboard summary source:

- Current organization: authenticated user membership resolved server-side.
- Overall readiness: completed/reviewed/answered `question_answers` divided by all `question_items`.
- Section/module completion: `question_sections`, `question_items`, and organization-scoped `question_answers`.
- Missing data count: all incomplete questionnaire items across sections, with only the first five sections shown as summary rows.
- Document count: organization-scoped `documents`.
- Linked evidence count: `document_links` scoped to the current organization's document IDs and answer IDs.
- Active share link count: active, non-expired `share_links`.

Readiness label and visual QA:

- `0%` uses `Not started` / `Nije započeto` / `Nicht begonnen`.
- More than `0%` and below `33.333%` uses needs-attention copy and the red visual state.
- `33.333%` through `66.666%` uses in-progress copy and the yellow/amber visual state.
- Above `66.666%` and below `100%` uses buyer-ready draft copy and the green visual state.
- Exactly `100%` uses strong-readiness copy and the green glow.

SQL/debug checklist:

```sql
select count(*) from question_items;

select
  count(*) filter (
    where qa.id is not null
      and qa.status in ('answered', 'completed', 'reviewed')
  ) as answered_count,
  count(qi.id) as total_count
from question_items qi
left join question_answers qa
  on qa.question_item_id = qi.id
  and qa.organization_id = '<ORG_ID>';

select count(*) from documents where organization_id = '<ORG_ID>';

select count(*)
from document_links dl
join documents d on d.id = dl.document_id
where d.organization_id = '<ORG_ID>';
```

Manual QA:

1. Log in as a supplier.
2. Open `/hr/dashboard/questionnaire` and note completed/total, for example `31/100`.
3. Open `/hr/dashboard`.
4. Confirm overall readiness matches the questionnaire percentage.
5. Confirm the setup card answers metric matches the questionnaire count.
6. Confirm module completion shows real section values such as `Osnovni podaci 12/12`, `Energija 10/15`, and `Podaci o dobavljačima 9/9` when those values exist.
7. Confirm missing data is not falsely `0` when incomplete sections remain.
8. Confirm documents and evidence link counts match Data Room/linking state.
9. Confirm the live-metrics fallback only appears when no authenticated live summary can be loaded.
10. Repeat quick checks on `/en/dashboard` and `/de/dashboard`.

## Faza 4.1.6 Korak 1 - Temporary German Locale Hide And Readiness Circle QA

German remains in the repository for future translation completion, but it is temporarily hidden from production-facing language switchers until German copy QA is complete.

Locale behavior:

- `i18n/routing.ts` keeps `locales = ["en", "hr", "de"]` so translation files and route infrastructure remain available for later.
- `productionLocales = ["en", "hr"]` controls visible language switcher options.
- Shared language switchers should show only `English` and `Hrvatski`.
- Direct `/de/...` requests are redirected by `proxy.ts` to the matching `/en/...` path, preserving the rest of the URL.

Readiness circle behavior:

- Public Passport/report uses a short circle label: `Score` in English and `Spremnost` in Croatian.
- The longer label `Readiness score` remains available as surrounding UI copy, but it should not be placed inside the circular indicator.
- The shared `ProgressRing` constrains the inside label width, reduces letter spacing, and allows wrapping so text stays inside the ring.
- Red/yellow/green readiness thresholds and the `100%`-only glow behavior are unchanged.

Manual QA:

1. Open `/hr/passport/[token]` and confirm the language switcher shows only `English` and `Hrvatski`.
2. Open `/en/passport/[token]` and confirm `Deutsch` is not visible.
3. Open dashboard, buyer portal, landing, and plans pages and confirm German is hidden from switchers.
4. Manually open `/de/passport/[token]` and confirm it redirects to `/en/passport/[token]`.
5. Confirm the English readiness circle uses the short `Score` label and does not cross the circular stroke.
6. Confirm the Croatian readiness circle uses `Spremnost` and stays inside the ring.
7. Confirm `31%` remains red and `100%` is the only state with a green glow.

## Safe Logging Rules

Allowed categories:

- `env_missing`
- `unauthenticated`
- `no_organization`
- `permission_denied`
- `graphql_error`
- `storage_error`
- `share_link_expired`
- `share_link_inactive`
- `password_required`
- `password_invalid`

Never log:

- secrets
- passwords
- password hashes
- raw tokens
- full JWTs
- raw file ids
- storage paths
- admin secrets
