# Supplier Passport

Supplier Passport is a premium B2B supplier readiness and compliance data-room MVP for SME suppliers. It helps companies prepare a VSME / ESG profile, organize evidence documents, track readiness, and share a secure buyer-facing Supplier Passport link.

The product is positioned as a professional supplier presentation and evidence workflow, not just a form tool.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components built on Base UI
- lucide-react
- Recharts
- Nhost Auth
- Nhost PostgreSQL
- Hasura GraphQL
- Nhost Storage

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=
NEXT_PUBLIC_NHOST_REGION=
NEXT_PUBLIC_NHOST_GRAPHQL_URL=
NEXT_PUBLIC_NHOST_AUTH_URL=
NEXT_PUBLIC_NHOST_STORAGE_URL=
NHOST_ADMIN_SECRET=
HASURA_GRAPHQL_ADMIN_SECRET=
SHARE_LINK_COOKIE_SECRET=
ADMIN_EMAIL_ALLOWLIST=
```

`NEXT_PUBLIC_NHOST_SUBDOMAIN` and `NEXT_PUBLIC_NHOST_REGION` are enough for standard hosted Nhost URLs. The explicit URL variables are available for local or custom deployments. Never expose `NHOST_ADMIN_SECRET`, `HASURA_GRAPHQL_ADMIN_SECRET`, `SHARE_LINK_COOKIE_SECRET`, or `ADMIN_EMAIL_ALLOWLIST` to client components.

For production, set `SHARE_LINK_COOKIE_SECRET` to a long random value. It signs token-scoped public share verification cookies and must remain server-only.

For the full production environment, Nhost/Hasura migration, storage, and admin-access checklist, see `docs/production-troubleshooting.md`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

There is no `typecheck` script yet; `next build` runs TypeScript validation.

## Mock Mode

The app intentionally remains usable without Nhost credentials. When Nhost is not configured, dashboard, questionnaire, documents, passport, share, pricing, and admin screens use centralized mock data from `lib/mock-data.ts`.

Mock mode is demo-safe:

- It does not write fake data to production.
- It displays user-friendly notices where live GraphQL or Storage data is unavailable.
- It keeps the premium UI available for sales demos and product review.

## Internationalization

Supplier Passport uses `next-intl` with locale-prefixed routes.

- Supported locales: `en`, `hr`, `de`
- Default locale: `en`
- Message files live in `messages/en.json`, `messages/hr.json`, and `messages/de.json`
- Routing config lives in `i18n/routing.ts`
- Request message loading lives in `i18n/request.ts`

Route examples:

- `/en`, `/hr`, `/de`
- `/en/pricing`, `/hr/pricing`, `/de/pricing`
- `/en/dashboard`, `/hr/dashboard`, `/de/dashboard`
- `/en/share/acme-manufacturing`, `/hr/share/acme-manufacturing`, `/de/share/acme-manufacturing`

The language switcher uses language names only: English, Hrvatski, Deutsch. It preserves the current path where possible, for example `/en/pricing` to `/hr/pricing`, and does not use flag icons or a full-screen language gate.

When adding a translation key:

1. Add the key to all three message files with the same nested structure.
2. Keep ICU placeholders consistent across locales, such as `{name}`, `{date}`, `{count}`, `{companyName}`, `{completed}`, `{total}`, and `{percent}`.
3. Use `useTranslations` in client components and `getTranslations` in server components.
4. Keep UI copy in translation namespaces such as `common`, `navigation`, `actions`, `statuses`, `landing`, `pricing`, `auth`, `onboarding`, `dashboard`, `questionnaire`, `documents`, `passport`, `share`, `admin`, `settings`, `validation`, `errors`, `loading`, `emptyStates`, `mockMode`, and `legal`.

When adding a new language:

1. Add the locale to `i18n/routing.ts`.
2. Create a matching `messages/{locale}.json`.
3. Add the language label in `components/shared/language-switcher.tsx`.
4. Run lint and build, then check the route examples above.

Do not translate these terms unless explicitly required by a future localization decision:

- Supplier Passport
- VSME
- ESG
- Nhost
- Hasura
- Company names, person names, file names, route slugs, ISO certificate names, and code constants

## Nhost Setup Checklist

- Create or connect an Nhost project.
- Configure Nhost Auth.
- Apply the Hasura/PostgreSQL schema for organizations, questionnaire, documents, passports, share links, notes, and audit events.
- Use `docs/nhost-schema.md` as the MVP schema readiness checklist.
- Seed expanded VSME/Supplier Passport questionnaire sections and questions.
- Set environment variables in `.env.local`.
- Configure Hasura permissions from `docs/hasura-permissions.md`.
- Configure Nhost Storage access from `docs/nhost-storage.md`.
- Confirm browser clients only use public Nhost configuration.
- Keep privileged actions in route handlers or server-side functions.
- Use `docs/demo-qa-checklist.md`, `docs/deploy-checklist.md`, and `docs/security-checklist.md` before demos or pilots.

## Real Nhost Auth and Onboarding

Phase 2 onboarding uses Nhost Auth for identity and a server-side route handler for workspace creation.

- `/[locale]/signup` creates a Nhost Auth user and sends authenticated users to `/<locale>/onboarding`.
- `/[locale]/login` signs in through Nhost Auth, checks whether the authenticated user has an organization, then sends them to `/<locale>/dashboard` or `/<locale>/onboarding`.
- `/api/onboarding` verifies the bearer token with Nhost Auth before creating `organizations`, `organization_members` with role `owner`, and `company_profiles`.
- `/api/organizations/current` verifies the bearer token before returning the current user's primary organization.
- `NHOST_ADMIN_SECRET` or `HASURA_GRAPHQL_ADMIN_SECRET` is used only server-side for the atomic onboarding write path.

Security notes:

- The browser never sends or receives Hasura admin secrets.
- `organization_members` owner creation is server-side so users cannot claim another user's workspace.
- `plan_key`, `billing_interval`, `subscription_status`, and `is_verified` are set by server/database defaults and must not be client-editable.
- If Nhost is not configured, auth and onboarding pages show mock-mode notices and the dashboard continues to use mock organization data.

Manual validation:

- Create a new user through `/en/signup`, `/hr/signup`, or `/de/signup`.
- Confirm the user appears in Nhost Auth.
- Complete onboarding and confirm rows exist in `organizations`, `organization_members` with role `owner`, and `company_profiles`.
- Confirm the dashboard topbar shows the real organization name.
- Log out and log in again, then confirm the user returns to dashboard when an organization exists.
- Remove or disable Nhost env vars locally and confirm mock mode still renders.

## Database Schema and Seed Data

Schema and seed SQL are prepared for Nhost PostgreSQL / Hasura:

- Main schema: `nhost/migrations/0001_initial_schema.sql`
- Nhost CLI-style schema: `nhost/migrations/default/0001_initial_supplier_passport/up.sql`
- Questionnaire seed: `nhost/seeds/0001_seed_questionnaire.sql`
- Nhost CLI-style seed: `nhost/seeds/default/0001_seed.sql`

The exact apply workflow depends on the local Nhost / Hasura setup. If applying manually, run the schema migration first and then the questionnaire seed. The seed uses `on conflict` upserts so it can be rerun safely.

Hasura permissions are documented in `docs/hasura-permissions.md` and should be configured before pilot use.

## Hasura Permissions

See `docs/hasura-permissions.md`.

Required high-level rules:

- Organization data is visible only to organization members.
- Questionnaire answers, documents, document links, passports, and share links are organization-scoped.
- Owner/editor/admin can insert and update operational data.
- Viewer can read only.
- Admin notes are internal and restricted.
- Public share access must use safe server-side logic or restricted views/functions.

## Nhost Storage

See `docs/nhost-storage.md`.

Required high-level rules:

- Evidence files are stored in Nhost Storage.
- `documents.file_id` stores the Nhost file id.
- Files are not public by default.
- Buyer share access must be controlled.
- Public pages must not expose internal paths or private file ids.
- Share links should show approved-only documents.
- The current dashboard upload flow sends the signed-in user's Nhost access token to server routes, uploads to Nhost Storage, then inserts metadata into `documents` through Hasura GraphQL.
- Secure preview/download remains controlled and conservative until storage access rules or a signed/server-proxied download strategy is configured.

## Faza 2.6 Documents QA

Before sharing a production build with pilot users:

- Log in as a real production user.
- Open `/en/dashboard/documents` and confirm the current organization loads.
- Upload a small PDF or image and confirm the document appears immediately.
- Press F5 and confirm the document remains visible.
- Open `/hr/dashboard/documents` and `/de/dashboard/documents` to confirm the same document flow works on localized routes.
- Confirm a real organization with zero documents shows the empty state, not mock documents.
- Confirm live-data errors show a clear message and do not silently show mock documents.
- Confirm browser network calls do not include any Hasura admin secret or server-only secret.

## MVP Feature List

- Localized English, Croatian, and German public/auth/dashboard/share surfaces.
- Public landing page with premium Supplier Passport positioning.
- Pricing page with monthly/annual switch, Sprint package, partner plans, buyer plans, and founding partner offer.
- Nhost Auth login/signup.
- Organization onboarding and workspace creation.
- Dashboard overview with readiness, tasks, uploads, buyer requests, share links, and activity.
- VSME readiness questionnaire with live GraphQL save path and mock fallback.
- Evidence Data Room with Nhost Storage upload path, metadata table, preview panel, and mock fallback.
- Evidence-to-answer linking through `document_links`.
- Internal Supplier Passport generation with readiness score persistence.
- Buyer-specific share link creation and buyer-safe public share rendering.
- Admin/concierge UI for organization support workflows.
- Empty, loading, and user-friendly error states for demo-critical paths.

## Real Backend Workflow

The real Nhost workflow for pilot validation is:

1. Sign up or log in through Nhost Auth.
2. Complete onboarding.
3. Confirm `organizations`, `organization_members`, and `company_profiles` rows are created.
4. Open questionnaire and save answers across multiple VSME/Supplier Passport sections through Hasura GraphQL.
5. Refresh and confirm `question_answers` persisted.
6. Upload a document through Nhost Storage.
7. Confirm `documents.file_id` stores the Nhost Storage file id.
8. Link the document to a questionnaire answer through `document_links`.
9. Generate a Supplier Passport and confirm `supplier_passports.readiness_score` and `generated_at`.
10. Create a share link and confirm `share_links` row creation.
11. Open `/<locale>/share/<token>` and confirm buyer-safe public data only.

## Demo And Deploy Readiness

- Demo QA checklist: `docs/demo-qa-checklist.md`
- Deploy checklist: `docs/deploy-checklist.md`
- Vercel deployment runbook: `docs/vercel-runbook.md`
- Production smoke test: `docs/production-smoke-test.md`
- Production troubleshooting: `docs/production-troubleshooting.md`
- Security checklist: `docs/security-checklist.md`
- Hasura permissions: `docs/hasura-permissions.md`
- Storage checklist: `docs/nhost-storage.md`

After Vercel deploy, run the production smoke test before sharing the app with pilot users.

Production diagnostics:

- `/api/diagnostics/env` returns safe boolean configuration status for Nhost/Vercel debugging.
- It never returns secret values, user data, password hashes, file ids, or storage paths.
- Use it together with `docs/production-troubleshooting.md`.

## Deploying To Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set Framework Preset to Next.js.
4. Set Install Command to `npm install`.
5. Set Build Command to `npm run build`.
6. Add the client-safe Nhost variables and server-only secrets in Vercel Project Settings.
7. Deploy.
8. Configure Nhost allowed origins and auth redirect URLs for the deployed Vercel domain.
9. Run the post-deploy smoke checklist in `docs/deploy-checklist.md`.

Client-safe Vercel variables:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=
NEXT_PUBLIC_NHOST_REGION=
NEXT_PUBLIC_NHOST_GRAPHQL_URL=https://<subdomain>.hasura.<region>.nhost.run/v1/graphql
NEXT_PUBLIC_NHOST_AUTH_URL=https://<subdomain>.auth.<region>.nhost.run/v1
NEXT_PUBLIC_NHOST_STORAGE_URL=https://<subdomain>.storage.<region>.nhost.run/v1
```

Server-only Vercel variables:

```bash
HASURA_GRAPHQL_ADMIN_SECRET=
NHOST_ADMIN_SECRET=
SHARE_LINK_COOKIE_SECRET=
```

Use the exact GraphQL/Auth/Storage URLs shown in the Nhost dashboard if they differ from the examples above.
The endpoint types must not be swapped: `NEXT_PUBLIC_NHOST_AUTH_URL` is only for signup/login/session flows and must contain `.auth.`, `NEXT_PUBLIC_NHOST_STORAGE_URL` is only for file access and must contain `.storage.`, and `NEXT_PUBLIC_NHOST_GRAPHQL_URL` is only for Hasura GraphQL, must contain `.hasura.`, and should end with `/v1/graphql`.

## Before Pilot: Required Hasura Permission Validation

Before using real buyer or supplier data, run the two-user/two-organization validation plan in `docs/hasura-permissions.md`.

Required scenario:

- User A belongs only to Organization A as owner.
- User B belongs only to Organization B as owner.
- Optional User C belongs to Organization A as viewer.
- User A and User B can read/write only their own organization data.
- Viewer can read allowed organization data but cannot write questionnaire answers, documents, document links, passports, or share links.
- Public share links do not expose internal notes, admin notes, raw file ids, storage paths, organization members, billing fields, or unapproved documents.

Use these docs together:

- Permission validation: `docs/hasura-permissions.md`
- Security checklist: `docs/security-checklist.md`
- Demo QA checklist: `docs/demo-qa-checklist.md`

## Known Limitations

- Password-protected public share links use server-side password verification and a token-scoped HTTP-only verification cookie. Advanced rate limiting/backoff for password attempts is still a future hardening item.
- PDF export is still a placeholder action.
- Public share document view/download uses a controlled server-side route. Production Nhost Storage file-read permissions and hosting file-size limits should be confirmed before broad buyer rollout.
- Admin authorization is represented in UI and documentation but should be enforced through Hasura before production.
- Plan limits are not implemented.
- Stripe/billing is not implemented.
- Partner/buyer portals are not fully implemented beyond current MVP surfaces.
- No Stripe, AI, XBRL, or advanced CSRD engine is included in this MVP.

## Manual QA Checklist

Public:

- Landing pages load: `/en`, `/hr`, `/de`.
- Pricing pages load: `/en/pricing`, `/hr/pricing`, `/de/pricing`.
- Pricing Monthly / Annual switch works in each locale.
- Login pages load: `/en/login`, `/hr/login`, `/de/login`.
- Signup pages load: `/en/signup`, `/hr/signup`, `/de/signup`.
- Sample share pages load: `/en/share/acme-manufacturing`, `/hr/share/acme-manufacturing`, `/de/share/acme-manufacturing`.
- Expired share state renders a safe translated message.
- Language switcher preserves the current route when changing locale.
- There are no missing translation key errors.
- Croatian and German pages have no horizontal layout overflow.

Dashboard:

- Dashboards load: `/en/dashboard`, `/hr/dashboard`, `/de/dashboard`.
- Questionnaire loads.
- Answers save through GraphQL when Nhost is configured.
- Real questionnaire save/load QA: sign in with a Nhost user, confirm the user has an `organization_members` role of `owner`, `editor`, or `admin`, open `/en/dashboard/questionnaire`, edit Energy answers, click Save & Continue, refresh, and confirm values persist in `question_answers`.
- Confirm a `viewer` organization member can load questionnaire data but cannot update answers.
- Mock fallback works when Nhost is missing.
- Documents page loads.
- Document upload works through Nhost Storage.
- Document metadata saves through Hasura.
- Real document upload QA: sign in as owner/editor/admin, open `/en/dashboard/documents`, upload a PDF or image, choose a document type, confirm the file appears in Nhost Storage, confirm a `documents` row stores `file_id`, refresh, and confirm the document remains listed.
- Confirm a `viewer` organization member can view permitted documents but cannot upload metadata.
- Document can be linked to answer.
- Linked evidence appears under question.
- Generate Supplier Passport creates or updates a `supplier_passports` row with a readiness score.
- Create Share Link creates a `share_links` row and returns `/<locale>/share/<token>`.
- Generated share link opens and shows buyer-safe Supplier Passport data.
- Mock share page `/en/share/acme-manufacturing` still loads.

Security:

- Expired share link is handled.
- Inactive share link should be handled in server-side share logic before pilot.
- Internal notes are not visible publicly.
- Admin notes are not visible publicly.
- Raw file paths are not visible publicly.
- Raw GraphQL/Hasura/Nhost errors are not visible publicly.
- Nhost admin secret is not exposed to client code.
- Private document access uses controlled routes.

Admin:

- Admin organizations page loads.
- Selected organization panel works.
- Admin notes display internally only.
- Operations widgets render.

## Current Backend Direction

Supplier Passport uses Nhost Auth, Hasura GraphQL, Nhost PostgreSQL, and Nhost Storage. Legacy backend assumptions have been replaced by Nhost/Hasura permissions and storage patterns for this project.
