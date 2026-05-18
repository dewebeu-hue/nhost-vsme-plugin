# Production Smoke Test

Run this checklist after every Vercel production deploy and before sharing the app with pilot users.

## Environment Check

- Open `/api/diagnostics/env`.
- Confirm the response contains only safe boolean values and `nodeEnv`.
- Confirm all public Nhost env checks are `true`:
  - `nhostSubdomainConfigured`
  - `nhostRegionConfigured`
  - `graphqlUrlConfigured`
  - `authUrlConfigured`
  - `storageUrlConfigured`
- Confirm `shareCookieSecretConfiguredServerSide` is `true`.
- Confirm `hasuraAdminSecretConfiguredServerSide` or `nhostAdminSecretConfiguredServerSide` is `true` if server-side admin actions are used.
- Confirm `nodeEnv` is `production` on Vercel.
- Confirm the endpoint does not return secret values, admin secrets, password hashes, file ids, storage paths, or user data.

## Public Page Check

- Open `/`.
- Open `/en`.
- Open `/hr`.
- Open `/de`.
- Open `/en/pricing`.
- Open `/hr/pricing`.
- Open `/de/pricing`.
- Open `/en/share/acme-manufacturing`.
- Open `/hr/share/acme-manufacturing`.
- Open `/de/share/acme-manufacturing`.

Expected:

- Pages load.
- No major console errors.
- Language switcher works.
- Pricing monthly/annual toggle works.
- No hydration mismatch appears in the console.

## Auth Check

- Open `/en/signup`.
- Create a test user.
- Confirm the user appears in Nhost Auth.
- Open `/en/login`.
- Log in with the test user.
- Confirm login redirects correctly.

## Onboarding Check

- After signup/login, a user with no organization should go to onboarding.
- Complete onboarding.
- Confirm rows exist in:
  - `organizations`
  - `organization_members`
  - `company_profiles`
- Confirm `organization_members.user_id` matches the Nhost Auth user UUID.

## Dashboard Check

- Open `/en/dashboard`.
- Confirm the dashboard shows the real organization name if real mode is active.
- Confirm a signed-in user with no organization is redirected to onboarding.
- Confirm permission failures show readable errors and do not expose raw GraphQL/Hasura details.

## Questionnaire Check

- Open `/en/dashboard/questionnaire`.
- Confirm Energy questions load.
- Save answers.
- Refresh the page.
- Confirm answers persist in `question_answers`.

## Documents Check

- Open `/en/dashboard/documents`.
- Upload a document.
- Confirm the file appears in Nhost Storage.
- Confirm metadata exists in the `documents` table.
- Confirm `documents.file_id` is populated.
- Refresh the page.
- Confirm the document remains listed.

## Evidence Linking Check

- Link the uploaded document to an answer.
- Confirm a `document_links` row exists.
- Confirm linked evidence appears in the document preview.
- Confirm linked evidence appears under the questionnaire answer.

## Passport And Share Check

- Open `/en/dashboard/passport`.
- Generate a Supplier Passport.
- Confirm a `supplier_passports` row exists.
- Confirm `readiness_score` and `generated_at` are populated.
- Create a share link.
- Confirm a `share_links` row exists.
- Open `/en/share/[token]`.
- Confirm the public page shows buyer-safe content only.

## Protected Share Link Check

- Create a share link with a password.
- Open the public link in a private browser session.
- Confirm the password form appears.
- Enter a wrong password.
- Confirm a localized error appears.
- Enter the correct password.
- Confirm content unlocks.
- Expire or deactivate the link.
- Confirm the link stays blocked even after previous verification.

## Security Check

Confirm the public share page does not show:

- internal notes
- admin notes
- raw `file_id`
- storage paths
- `organization_members`
- billing fields
- unapproved documents
- password hashes
- raw GraphQL/Hasura/Nhost errors
