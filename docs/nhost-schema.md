# Nhost / Hasura Schema

Supplier Passport uses Nhost PostgreSQL exposed through Hasura GraphQL. The initial schema lives in:

- `nhost/migrations/0001_initial_schema.sql`
- `nhost/migrations/default/0001_initial_supplier_passport/up.sql`

Questionnaire seed data lives in:

- `nhost/seeds/0001_seed_questionnaire.sql`
- `nhost/seeds/0002_expand_questionnaire_taxonomy.sql`
- `nhost/seeds/default/0001_seed.sql`
- `nhost/seeds/default/0002_expand_questionnaire_taxonomy.sql`

## Tables

| Table | Purpose |
| --- | --- |
| `organizations` | Tenant root for each supplier, consultant client, or buyer workspace. Includes `plan_key`, `billing_interval`, and `subscription_status` for future plan enforcement. |
| `organization_members` | Maps Nhost Auth user ids to organizations and roles. `user_id` is a UUID, but the MVP migration does not add a foreign key to Nhost Auth internals. |
| `company_profiles` | Buyer-facing company profile details, industries, certifications, contact details, and countries served. |
| `question_sections` | Ordered VSME questionnaire sections such as Company Basics, Energy, Waste, Governance, and Supplier Information. |
| `question_items` | Individual VSME questions, answer type metadata, options, units, evidence requirement, and questionnaire level. |
| `question_answers` | Organization-specific answers, status, internal notes, and review metadata. |
| `documents` | Evidence metadata for uploaded files. `file_id` stores the Nhost Storage file id and should not be treated as a public file path. |
| `document_links` | Many-to-many link between evidence documents and questionnaire answers. |
| `supplier_passports` | Generated or draft Supplier Passport snapshots for an organization. |
| `share_links` | Secure buyer-facing token links with expiry, optional `password_hash`, active flag, and `document_visibility`. |
| `share_link_accesses` | Access log for share links. |
| `admin_notes` | Internal concierge/admin notes scoped to an organization. |
| `audit_events` | Append-style audit trail for user/system actions. |

## Key Relationships

- `organization_members.organization_id -> organizations.id`
- `company_profiles.organization_id -> organizations.id`
- `question_items.section_id -> question_sections.id`
- `question_answers.organization_id -> organizations.id`
- `question_answers.question_item_id -> question_items.id`
- `documents.organization_id -> organizations.id`
- `document_links.document_id -> documents.id`
- `document_links.question_answer_id -> question_answers.id`
- `supplier_passports.organization_id -> organizations.id`
- `share_links.passport_id -> supplier_passports.id`
- `share_links.organization_id -> organizations.id`
- `share_link_accesses.share_link_id -> share_links.id`
- `admin_notes.organization_id -> organizations.id`
- `audit_events.organization_id -> organizations.id`

## Plan Fields

`organizations` includes these non-enforcing MVP plan fields:

- `plan_key`: `starter`, `supplier_pro`, `partner`, `buyer_pilot`, `buyer_pro`
- `billing_interval`: `monthly`, `yearly`
- `subscription_status`: `trialing`, `active`, `past_due`, `canceled`, `unpaid`

Plan limits are intentionally not implemented in this phase.

## Storage Model

Evidence files are stored in Nhost Storage. The database stores only metadata:

- `documents.file_id` is the Nhost Storage file id.
- `documents.file_name`, `file_size_bytes`, `mime_type`, `document_type`, and `status` drive the UI.
- Public buyer pages must not expose raw storage paths or private file ids.
- View/download actions should use controlled server-side access in a later step.

## Share Link Model

`share_links.token` is the buyer-facing lookup token. A real share endpoint must check:

- `is_active`
- `expires_at`
- `password_hash` if password protection is enabled
- `document_visibility`
- approved-only document visibility

The current public share page remains mock-backed for demo use.

## Audit Events

`audit_events` is available for future append-style tracking of actions such as answer updates, document uploads, document links, passport generation, and share-link access. It is not wired to UI behavior in this phase.

## Seed Data

The seed creates these `question_sections` codes:

- `company_basics`
- `employees`
- `energy`
- `fuel`
- `waste`
- `environmental_policies`
- `health_safety`
- `certifications`
- `governance`
- `supplier_information`

The expanded taxonomy migration/seed creates 100 VSME-aligned and Supplier Passport buyer-readiness questions across all active sections. It is intentionally data-only and upserts by stable `question_items.code`, so existing saved answers remain attached where question codes already existed.

## Permissions

Hasura permissions are intentionally not implemented in this migration step. They will be implemented in Phase 2 Step 3. See `docs/hasura-permissions.md` for the permission checklist.
