# Supplier Passport Demo QA Checklist

Use this checklist before founder demos, buyer walkthroughs, and pilot calls.

## Environment

- Confirm `.env.local` is present for real Nhost mode, or intentionally absent/empty for mock mode.
- Confirm client-safe variables use `NEXT_PUBLIC_` only for Nhost public URLs/subdomain/region.
- Confirm `NHOST_ADMIN_SECRET` and `HASURA_GRAPHQL_ADMIN_SECRET` are server-only and never prefixed with `NEXT_PUBLIC_`.
- Confirm `npm run lint` passes.
- Confirm `npm run build` passes.
- Confirm the local app opens at `http://localhost:3000` or the deployment URL.

## Public Pages

- `/en`, `/hr`, and `/de` load.
- `/en/pricing`, `/hr/pricing`, and `/de/pricing` load.
- Pricing defaults to monthly.
- Annual pricing changes Starter and Supplier Pro only.
- VSME Passport Sprint stays one-time.
- Supplier Passport Setup appears as a subscription add-on, not a duplicate large one-time card.
- `/en/login`, `/hr/login`, and `/de/login` load.
- `/en/signup`, `/hr/signup`, and `/de/signup` load.
- `/en/share/acme-manufacturing`, `/hr/share/acme-manufacturing`, and `/de/share/acme-manufacturing` load with safe mock buyer data.

## Auth And Onboarding

- Sign up with Nhost Auth.
- Confirm the user appears in Nhost Auth.
- Complete onboarding.
- Confirm an `organizations` row is created.
- Confirm an `organization_members` row is created with role `owner`.
- Confirm a `company_profiles` row is created.
- Confirm `/[locale]/dashboard` opens after onboarding.
- Log out and log in again.
- Confirm an existing organization user goes to dashboard.
- Confirm a signed-in user without organization goes to onboarding.

## Dashboard

- `/en/dashboard`, `/hr/dashboard`, and `/de/dashboard` load.
- `/en/dashboard/company` loads.
- `/en/dashboard/activity` loads.
- `/en/dashboard/settings` loads.
- Dashboard topbar shows the real organization name in live mode.
- Mock organization appears in mock mode.
- No raw Nhost, Hasura, or GraphQL errors are shown to the user.

## Questionnaire

- `/en/dashboard/questionnaire`, `/hr/dashboard/questionnaire`, and `/de/dashboard/questionnaire` load.
- Question sections load from Hasura in live mode.
- Energy questions load from Hasura in live mode.
- Existing answers load for the current organization.
- Save Energy answers.
- Refresh the page and confirm answers persist.
- Confirm `question_answers.value` stores JSON values.
- Confirm completed/reviewed statuses count toward Passport readiness.
- Confirm `needs_evidence` does not count as complete.
- Confirm mock questionnaire still works when Nhost is not configured.

## Documents / Storage

- `/en/dashboard/documents`, `/hr/dashboard/documents`, and `/de/dashboard/documents` load.
- Upload dialog opens.
- Select a PDF or image file.
- Choose document type.
- Optionally set expiry date.
- Upload succeeds for owner/editor/admin.
- Confirm file appears in Nhost Storage.
- Confirm `documents.file_id` contains the Nhost file id.
- Confirm document metadata appears in the Evidence Data Room table after refresh.
- Confirm raw `file_id` and internal storage paths are not visible in normal UI.
- Confirm secure preview remains controlled or shows the safe placeholder.
- Confirm mock documents still work when Nhost is not configured.

## Evidence Linking

- Open a document preview.
- Click `Link to answer`.
- Search/select a questionnaire answer.
- Link the document.
- Confirm a `document_links` row exists.
- Confirm the linked answer appears in the document preview.
- Open the questionnaire.
- Confirm linked evidence appears under the relevant question.
- Attach evidence from the questionnaire.
- Confirm the link persists after refresh.

## Supplier Passport

- `/en/dashboard/passport`, `/hr/dashboard/passport`, and `/de/dashboard/passport` load.
- Click `Generate Passport`.
- Confirm a `supplier_passports` row is created or updated.
- Confirm `readiness_score` is set.
- Confirm `generated_at` is set.
- Confirm the UI shows generated status/date.
- Confirm mock Passport preview still works in mock mode.

## Share Links

- Open Create Share Link dialog.
- Enter buyer name and buyer email.
- Choose expiry date if needed.
- Choose document visibility.
- Create the share link.
- Confirm a `share_links` row is created.
- Confirm `password_hash` is set only when password protection is selected.
- Confirm the generated URL uses the current locale.
- Open generated `/en/share/[token]`.
- Confirm inactive links show inactive state.
- Confirm expired links show expired state.
- Confirm password-protected links show the password screen and do not show buyer content.
- Enter a wrong password and confirm a localized error appears.
- Enter the correct password and confirm buyer-safe content appears.
- Refresh the page and confirm verified access persists during the cookie lifetime.
- Deactivate or expire the link and confirm content is blocked even after prior verification.

## Public Share Security

- Public share page shows company summary.
- Public share page shows readiness score.
- Public share page shows buyer-safe document metadata only.
- Create one reviewed document and one unreviewed/linked-only document.
- Create a share link with `approved_only`.
- Confirm the reviewed document appears.
- Confirm the unreviewed document does not appear or cannot be opened.
- Open View for a reviewed document and confirm it loads through `/api/share/[token]/documents/[documentId]`.
- Open Download for a reviewed document and confirm it uses `?download=1`.
- For a password-protected link, try the document URL before password verification and confirm it fails.
- Verify the password and confirm the allowed document URL works.
- Deactivate or expire the share link and confirm the document URL fails.
- Try a document id from another organization and confirm it is blocked.
- Internal notes are not visible.
- Admin notes are not visible.
- `organization_members` data is not visible.
- Billing/subscription fields are not visible.
- Raw `file_id` values are not visible.
- Raw storage paths or public file URLs are not visible.
- Unapproved/internal documents are not visible.
- Live document view/download buttons remain disabled or controlled until storage access is configured.

## Admin Panel

- `/en/admin/organizations`, `/hr/admin/organizations`, and `/de/admin/organizations` load.
- Organization table renders.
- Selected organization panel renders.
- Internal notes are shown only in internal/admin surfaces.
- Admin UI remains clearly separate from public buyer share pages.

## i18n

- Language switcher appears on public/auth/share/dashboard surfaces where designed.
- Language switcher preserves the current route when switching locale.
- English pages have no missing translation keys.
- Croatian pages have no missing translation keys.
- German pages have no missing translation keys.
- Longer Croatian/German labels do not create horizontal overflow on main demo routes.

## Mock Mode

- Remove or disable Nhost environment variables locally.
- Landing, pricing, auth, dashboard, questionnaire, documents, passport, share, and admin pages still render.
- Mock mode shows user-friendly notices where appropriate.
- Mock mode does not attempt production writes.

## Build / Deploy

- `npm run lint` passes.
- `npm run build` passes.
- Deployment environment variables are configured.
- Hasura permissions are configured before pilot use.
- Nhost Storage permissions/access strategy is confirmed before enabling buyer downloads.

## Known Limitations

- Password-protected share links support server-side verification and a temporary token-scoped cookie. Advanced rate limiting/backoff for password attempts is still follow-up work.
- Public share document view/download uses a controlled server-side route. Confirm production Nhost Storage file-read permissions and hosting file-size limits before broad buyer rollout.
- PDF export is a placeholder.
- Stripe/billing is not implemented.
- AI, XBRL, advanced CSRD engine, and plan limits are not implemented.
- Partner and buyer portals are not fully implemented beyond current MVP surfaces.
