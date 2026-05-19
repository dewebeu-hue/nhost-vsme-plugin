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

Fix:

- Apply the expanded taxonomy migration/seed to the live Nhost/Hasura database.
- The expanded taxonomy is data-only and uses `on conflict (code) do update`, so it can be rerun without deleting saved answers.
- Confirm every active section has question rows:

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

## Documents Upload Fails

Likely causes:

- Nhost Storage is not enabled.
- Storage permissions are missing.
- `HASURA_GRAPHQL_ADMIN_SECRET` is missing in Vercel.
- Server-side metadata insert into `documents` fails after file upload.
- `NEXT_PUBLIC_NHOST_STORAGE_URL` is wrong.
- The logged-in user has no `organization_members` row.
- The user role is `viewer`, which cannot upload in the MVP flow.

Fix:

- Confirm Nhost Storage is enabled.
- Confirm Storage URL matches the Nhost dashboard.
- Confirm `HASURA_GRAPHQL_ADMIN_SECRET` is configured as a server-only Vercel env var.
- Confirm `GET /api/documents` returns the real organization documents after login.
- Confirm `POST /api/documents/upload` returns a `document` object after upload.
- Confirm the uploaded file appears in Nhost Storage.
- Confirm the inserted row in `documents` includes `organization_id`, `uploaded_by`, `file_id`, `file_name`, `file_size_bytes`, `mime_type`, `document_type`, `status`, and `expires_at`.
- Press F5 on `/en/dashboard/documents` and confirm the document remains visible.

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
