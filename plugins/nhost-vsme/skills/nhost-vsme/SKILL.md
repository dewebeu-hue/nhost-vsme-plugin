---
name: nhost-vsme
description: Use when adding, migrating, reviewing, or debugging Nhost usage in the VSME Supplier Passport Next.js app, especially when replacing Supabase assumptions with Nhost Auth, Hasura GraphQL, and Nhost Storage.
---

# Nhost for VSME Supplier Passport

Use this skill for work that mentions Nhost, Hasura, GraphQL, auth, storage, file uploads, share links, supplier passports, buyer access, or replacing Supabase in this repository.

## Project Defaults

- Treat Nhost as the backend of record for authentication, Postgres-backed data through Hasura GraphQL, file storage, and server-side access control.
- Prefer GraphQL operations through generated or typed documents over untyped stringly data access.
- Keep browser code using publishable Nhost configuration only:
  - `NEXT_PUBLIC_NHOST_SUBDOMAIN`
  - `NEXT_PUBLIC_NHOST_REGION`
- Keep privileged operations on the server, route handlers, or Nhost serverless functions. Never expose admin secrets to client components.
- Use row-level permissions in Hasura for tenant isolation. The core tenant boundary is supplier/company ownership.
- Preserve this app's current UI and data vocabulary: company profile, questionnaire answers, evidence documents, passport readiness, share links, buyer requests, and audit activity.

## Before Editing Next.js Code

This repository uses a newer Next.js version with local documentation. Before writing app code, read the relevant guide under:

```text
node_modules/next/dist/docs/
```

For App Router work, start with `01-app`. For route handlers and server actions, inspect the matching local docs before changing APIs.

## Recommended Packages

Install only what is needed for the implementation slice:

```bash
npm install @nhost/nextjs @nhost/react @nhost/nhost-js graphql
```

If adding typed GraphQL generation, prefer the repository's existing TypeScript style and add the smallest useful codegen setup.

## Migration Shape

1. Add a small Nhost client module in `lib/` for browser-safe client creation.
2. Add server-only helpers for authenticated GraphQL calls where sensitive actions are needed.
3. Model VSME entities in Hasura first, then bind UI views to GraphQL queries and mutations:
   - companies
   - users and memberships
   - questionnaire sections, questions, and answers
   - evidence documents and storage file IDs
   - passport snapshots
   - share links and buyer requests
   - activity events
4. Replace mock data one screen at a time, keeping the UI stable while the data source changes.
5. Add explicit loading, empty, and error states at the component boundary nearest the data fetch.

## Auth Guidance

- Use Nhost Auth for sign-in, sign-up, password reset, and session handling.
- Gate dashboard routes with server-side session checks where possible.
- Use Hasura claims from the authenticated user for permissions.
- Avoid localStorage for security-sensitive auth state unless the Nhost SDK owns the persistence.

## Storage Guidance

- Store uploaded evidence files in Nhost Storage.
- Save file metadata in GraphQL tables, including owner company, uploader, VSME section, status, and review notes.
- Use signed or permissioned access patterns for buyer-facing share pages.

## Supabase Replacement Checklist

Run the helper script or search manually for:

```text
supabase
@supabase
SUPABASE
createClient
```

When replacing code, map concepts like this:

- Supabase Auth -> Nhost Auth
- Supabase database client -> Hasura GraphQL through Nhost
- Supabase Storage -> Nhost Storage
- Supabase Edge Functions -> Nhost serverless functions or Next.js route handlers
- Supabase RLS policies -> Hasura permissions and session variables

## Verification

- Run lint after code changes.
- Build the app when auth, routing, server components, or environment variables change.
- For visible UI changes, run the app and inspect dashboard, questionnaire, documents, passport, and share-link flows in the browser.
- Confirm no client bundle contains admin secrets or server-only environment variables.
