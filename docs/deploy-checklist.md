# Supplier Passport Deploy Checklist

Use this checklist before deploying the MVP to Vercel or another hosting provider.

## Required Environment Variables

Client-safe:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=
NEXT_PUBLIC_NHOST_REGION=
NEXT_PUBLIC_NHOST_GRAPHQL_URL=
NEXT_PUBLIC_NHOST_AUTH_URL=
NEXT_PUBLIC_NHOST_STORAGE_URL=
```

Server-only, if used:

```bash
HASURA_GRAPHQL_ADMIN_SECRET=
NHOST_ADMIN_SECRET=
SHARE_LINK_COOKIE_SECRET=
```

Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

Example production URLs:

```bash
NEXT_PUBLIC_NHOST_GRAPHQL_URL=https://<subdomain>.hasura.<region>.nhost.run/v1/graphql
NEXT_PUBLIC_NHOST_AUTH_URL=https://<subdomain>.auth.<region>.nhost.run/v1
NEXT_PUBLIC_NHOST_STORAGE_URL=https://<subdomain>.storage.<region>.nhost.run/v1
```

Use the exact endpoint values from the Nhost dashboard if the project uses a different GraphQL host. `SHARE_LINK_COOKIE_SECRET` must be a long random server-only value in production.
Do not swap service URLs: `NEXT_PUBLIC_NHOST_AUTH_URL` must look like `https://<subdomain>.auth.<region>.nhost.run/v1`, `NEXT_PUBLIC_NHOST_STORAGE_URL` must look like `https://<subdomain>.storage.<region>.nhost.run/v1`, and `NEXT_PUBLIC_NHOST_GRAPHQL_URL` must look like `https://<subdomain>.hasura.<region>.nhost.run/v1/graphql`.

## Vercel Project Setup

- Import the GitHub repository into Vercel.
- Framework Preset: Next.js.
- Install Command: `npm install`.
- Build Command: `npm run build`.
- Output Directory: leave as the Next.js default.
- Add all environment variables above for Production, Preview, and Development as needed.
- Keep server-only secrets out of `NEXT_PUBLIC_*` variables.
- Do not paste secrets into build logs, README examples, screenshots, or browser-visible config.

## Nhost Project

- Nhost project exists.
- Nhost region/subdomain match environment variables.
- Nhost Auth is enabled.
- Email/password auth is enabled for demo users.
- Demo user is created or signup is enabled.
- Nhost Storage is enabled.
- Storage access strategy is documented in `docs/nhost-storage.md`.
- Vercel deployment domain is added to Nhost allowed origins.
- Auth redirect URLs are configured for the deployed domain.
- Include redirects/callbacks used by the app, such as:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/en`
  - `https://your-domain.com/hr`
  - `https://your-domain.com/de`
  - `https://your-domain.com/en/dashboard`
  - `https://your-domain.com/hr/dashboard`
  - `https://your-domain.com/de/dashboard`

## Hasura / PostgreSQL

- Schema migration is applied.
- Questionnaire seed is applied.
- `question_sections` contains seeded sections.
- `question_items` contains seeded Energy questions.
- All public MVP tables are tracked.
- Required object/array relationships are tracked.
- Hasura `user` role exists.
- `X-Hasura-User-Id` is available from Nhost Auth JWT/session variables.
- Hasura permissions from `docs/hasura-permissions.md` are configured.
- Viewer cannot write.
- Owner/editor/admin can write expected operational data.
- User A cannot read User B organization data.

## Demo Data

- Demo organization exists, or onboarding flow is ready to create it.
- Demo user is an `organization_members.owner`.
- Demo company profile exists.
- Energy questionnaire seed exists.
- Optional demo documents are uploaded through the app, not manually exposed publicly.
- Optional demo share link is created from the app.

## Public Pages

- `/en`, `/hr`, `/de` load.
- `/en/pricing`, `/hr/pricing`, `/de/pricing` load.
- `/en/login`, `/hr/login`, `/de/login` load.
- `/en/signup`, `/hr/signup`, `/de/signup` load.
- `/en/share/acme-manufacturing` loads as safe mock sample.
- A real generated `/en/share/[token]` loads.

## Dashboard Workflow

- Signup/login works with Nhost Auth.
- Onboarding creates `organizations`, `organization_members`, and `company_profiles`.
- Dashboard shows real organization name.
- Questionnaire saves and reloads answers.
- Documents upload to Nhost Storage.
- `documents.file_id` is populated.
- Documents can be linked to answers.
- Supplier Passport can be generated.
- Share link can be created.
- Real share link opens buyer-safe data.

## Security

- Admin secrets are server-only.
- No `NEXT_PUBLIC_*ADMIN*` variables exist.
- Public share page does not expose internal notes.
- Public share page does not expose admin notes.
- Public share page does not expose organization members.
- Public share page does not expose billing/subscription fields.
- Public share page does not expose raw `file_id` or storage paths.
- Public share page does not expose unapproved/internal documents.
- Expired share links are blocked.
- Inactive share links are blocked.
- Password-protected share links verify server-side.
- `password_hash` is never sent to the browser.
- Protected share content is not rendered before verification.
- `SHARE_LINK_COOKIE_SECRET` is configured in Vercel as a server-only secret.
- Controlled document route validates token, expiry, password verification, organization ownership, and document visibility.
- Build logs do not print secrets.

## Build

- `npm install` completed.
- `npm run lint` passes.
- `npm run build` passes.
- No unexpected console warnings on key demo routes.
- No hydration mismatch on landing or dashboard pages.
- Pricing toggle works after production build.
- Language switcher preserves route in production.

## Post-Deploy Smoke

- Open deployed `/` and verify locale redirect to `/en`, `/hr`, or `/de` based on browser language.
- Confirm there is no redirect loop.
- Open deployed `/en`.
- Open deployed `/hr`.
- Open deployed `/de`.
- Open deployed `/en`.
- Open deployed `/en/pricing`.
- Open deployed `/hr/pricing`.
- Open deployed `/de/share/acme-manufacturing`.
- Log in as demo user.
- Complete onboarding or use an existing organization.
- Open `/en/dashboard`.
- Open `/en/dashboard/questionnaire`.
- Save one answer and refresh.
- Open `/en/dashboard/documents`.
- Upload one small test file.
- Link document to answer.
- Generate Passport.
- Create share link.
- Open generated share link in a separate/private browser session.
- Create or open a password-protected share link.
- Confirm the password screen appears before content.
- Enter a wrong password and confirm a safe error.
- Enter the correct password and confirm buyer-safe content renders.
- Open an approved document through View/Download.
- Confirm public share page hides internal notes, admin notes, raw file ids, storage paths, organization members, billing fields, and unapproved documents.
- Confirm browser console has no major errors on public, auth, dashboard, and share routes.

## Production Auth/Data Troubleshooting

Safe diagnostics:

- Open `/api/diagnostics/env` on the deployed app.
- Confirm it returns only boolean configuration status, never secret values.
- Expected production checks:
  - `nhostSubdomainConfigured: true`
  - `nhostRegionConfigured: true`
  - `graphqlUrlConfigured: true` if explicit GraphQL URL is set
  - `authUrlConfigured: true` if explicit Auth URL is set
  - `storageUrlConfigured: true` if explicit Storage URL is set
  - `authUrlLooksLikeAuthEndpoint: true` when explicit Auth URL is set
  - `storageUrlLooksLikeStorageEndpoint: true` when explicit Storage URL is set
  - `graphqlUrlLooksLikeHasuraEndpoint: true` when explicit GraphQL URL is set
  - `hasuraAdminSecretConfiguredServerSide: true` if onboarding/server-side public share lookup is used
  - `shareCookieSecretConfiguredServerSide: true`

If login fails:

- Confirm Nhost Auth is enabled.
- Confirm email/password login is enabled.
- Confirm Vercel domain is listed in Nhost allowed origins.
- Confirm Nhost auth redirect URLs include the deployed locale routes and `/auth/callback`.
- Confirm `NEXT_PUBLIC_NHOST_SUBDOMAIN` and `NEXT_PUBLIC_NHOST_REGION` are set.
- Confirm explicit `NEXT_PUBLIC_NHOST_AUTH_URL` matches the Nhost Auth URL and contains `.auth.`, not `.storage.`.
- Confirm explicit `NEXT_PUBLIC_NHOST_STORAGE_URL` matches the Nhost Storage URL and contains `.storage.`, not `.auth.`.
- Confirm explicit `NEXT_PUBLIC_NHOST_GRAPHQL_URL` matches the Hasura URL, contains `.hasura.`, and ends with `/v1/graphql`.
- Check browser console for safe auth diagnostics only; do not paste secrets into logs or screenshots.

If login succeeds but dashboard stays on mock/demo data:

- Confirm `/api/diagnostics/env` reports Nhost public config as configured.
- Confirm the signed-in Nhost user has an `organization_members` row.
- Confirm `organization_members.user_id` exactly matches the Nhost Auth user UUID.
- Confirm `/api/organizations/current` returns an organization instead of `category: no_organization`, `env_missing`, `unauthenticated`, or `permission_denied`.

If dashboard or Passport page is empty:

- Confirm the user belongs to an organization.
- Confirm Hasura `organizations` select permission works through `organization_members`.
- Confirm `supplier_passports` row exists after clicking Generate Passport.
- If no passport exists, the UI correctly shows: "Generate a Supplier Passport before creating a buyer share link."

If GraphQL returns permission denied:

- Confirm Hasura `user` role exists.
- Confirm Nhost JWT includes `X-Hasura-User-Id`.
- Confirm organization-scoped permissions from `docs/hasura-permissions.md` are applied.
- Confirm `question_sections` and `question_items` select permissions are enabled.
- Confirm `question_answers`, `documents`, `document_links`, `supplier_passports`, and `share_links` permissions use the expected relationships.

If onboarding fails:

- Confirm `HASURA_GRAPHQL_ADMIN_SECRET` or `NHOST_ADMIN_SECRET` is configured server-side in Vercel.
- Confirm tables are tracked in Hasura.
- Confirm insert permissions are not required for the server-side onboarding route, but schema constraints still allow the inserted rows.

If share link is empty or unavailable:

- Generate a Supplier Passport first.
- Confirm `supplier_passports` and `share_links` rows exist.
- Confirm the share link is active and not expired.
- Confirm protected links have `password_hash` and `SHARE_LINK_COOKIE_SECRET` is configured.

If public file access is blocked:

- Confirm the document status is `reviewed` for `approved_only` links.
- Confirm linked/reviewed documents have `document_links` rows for `all_linked_documents`.
- Confirm production Nhost Storage accepts the controlled server-side file read path.
