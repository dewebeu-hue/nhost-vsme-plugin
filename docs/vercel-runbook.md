# Vercel Deployment Runbook

Use this runbook to deploy Supplier Passport to Vercel with Nhost, Hasura, and Nhost Storage configured.

## Prerequisites

- GitHub repository is ready and pushed.
- Vercel account is available.
- Nhost project is ready.
- Hasura tables are tracked.
- Hasura permissions are configured.
- Nhost Storage is enabled.
- Nhost Auth is enabled.
- `npm run lint` and `npm run build` pass locally.

## Import Project Into Vercel

1. Open the Vercel dashboard.
2. Select **Add New Project**.
3. Import the GitHub repository.
4. Set **Framework Preset** to `Next.js`.
5. Set **Install Command** to:

```bash
npm install
```

6. Set **Build Command** to:

```bash
npm run build
```

7. Leave **Output Directory** as the default.
8. Add the environment variables below.
9. Deploy.

## Environment Variables

Client-safe variables:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=
NEXT_PUBLIC_NHOST_REGION=
NEXT_PUBLIC_NHOST_GRAPHQL_URL=
NEXT_PUBLIC_NHOST_AUTH_URL=
NEXT_PUBLIC_NHOST_STORAGE_URL=
```

Server-only variables:

```bash
HASURA_GRAPHQL_ADMIN_SECRET=
NHOST_ADMIN_SECRET=
SHARE_LINK_COOKIE_SECRET=
```

Never prefix admin secrets or cookie secrets with `NEXT_PUBLIC_`.

## Example Values

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=<your-nhost-subdomain>
NEXT_PUBLIC_NHOST_REGION=<your-nhost-region>
NEXT_PUBLIC_NHOST_GRAPHQL_URL=https://<subdomain>.hasura.<region>.nhost.run/v1/graphql
NEXT_PUBLIC_NHOST_AUTH_URL=https://<subdomain>.auth.<region>.nhost.run/v1
NEXT_PUBLIC_NHOST_STORAGE_URL=https://<subdomain>.storage.<region>.nhost.run/v1
```

Use the exact URLs shown in the Nhost dashboard if they differ from these examples.

## Generate SHARE_LINK_COOKIE_SECRET

Run this locally in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into Vercel as `SHARE_LINK_COOKIE_SECRET`. Keep it private.

## Configure Nhost Allowed Origins

In the Nhost dashboard, add the deployed Vercel domain:

```text
https://your-project.vercel.app
```

If you add a custom domain later, add it too:

```text
https://your-domain.com
```

## Configure Nhost Auth Redirect URLs

Add the deployed app URLs used by the public/auth/dashboard flow.

Examples:

```text
https://your-project.vercel.app/en
https://your-project.vercel.app/hr
https://your-project.vercel.app/de
https://your-project.vercel.app/en/login
https://your-project.vercel.app/en/signup
https://your-project.vercel.app/en/onboarding
https://your-project.vercel.app/en/dashboard
```

Add equivalent `/hr/...` and `/de/...` auth/dashboard routes if the Nhost project requires explicit redirect allowlisting per locale.

Also include the callback route if used in your Nhost Auth settings:

```text
https://your-project.vercel.app/auth/callback
```

## First Deploy Validation

- Open `/`.
- Confirm locale redirect works.
- Open `/en`.
- Open `/hr`.
- Open `/de`.
- Open `/en/pricing`.
- Log in with a Nhost user.
- Complete onboarding or use an existing organization.
- Open dashboard.
- Save and reload a questionnaire answer.
- Upload a document.
- Link the document to an answer.
- Generate a Supplier Passport.
- Create a share link.
- Open the public share link in a private browser session.
- Test a protected share link with a wrong password and then the correct password.
- Test document view/download if enabled for the shared document.
- Confirm the browser console has no major errors.
- Confirm the public share page does not show internal notes, admin notes, raw file ids, storage paths, organization members, billing fields, or unapproved documents.

## Common Errors And Fixes

Env vars missing:

- Confirm all `NEXT_PUBLIC_NHOST_*` variables are set in Vercel.
- Confirm server-only secrets are set for the correct Vercel environment.
- Redeploy after changing env vars.

Nhost CORS or allowed origin issue:

- Add the Vercel deployment domain to Nhost allowed origins.
- Include the custom domain if production uses one.

Auth redirect not allowed:

- Add `/en`, `/hr`, `/de`, login/signup/onboarding/dashboard URLs, and `/auth/callback` to Nhost redirect URLs.

Hasura permission denied:

- Confirm the user has an `organization_members` row.
- Confirm the row uses the Nhost Auth user UUID, not email.
- Confirm Hasura `user` role permissions are configured.

User has no organization:

- Complete onboarding.
- Confirm `organizations`, `organization_members`, and `company_profiles` rows were created.

Tables not tracked in Hasura:

- Track all MVP public tables.
- Re-check relationships after tracking tables.

Relationships missing:

- Add object/array relationships listed in `docs/hasura-permissions.md`.
- Ensure relationship names match GraphQL queries used by the app.

Build fails due to missing env:

- The app should build without live Nhost values, but Vercel production should still have real values.
- Check for accidental server-only env access in client components.

Share password verification fails:

- Confirm `SHARE_LINK_COOKIE_SECRET` is set in Vercel.
- Confirm the protected share link has `password_hash`.
- Redeploy after adding the secret.

Public file access blocked:

- Confirm the document is `reviewed` for `approved_only` links.
- Confirm linked/reviewed document has a `document_links` row for `all_linked_documents`.
- Confirm the document belongs to the same organization as the share link.
- Confirm Nhost Storage allows the server-side controlled route to read files.

## Rollback

- Open the Vercel project.
- Go to the **Deployments** tab.
- Select the previous known-good deployment.
- Choose **Promote to Production**.
- Keep the previous production deployment available until the new deploy is validated.
- Do not change or roll back the Nhost schema casually; coordinate database changes separately from Vercel deployment rollback.
