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
