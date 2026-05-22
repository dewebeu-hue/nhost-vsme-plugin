import "server-only";

import { AuthenticationRequiredError, requireCurrentUser } from "@/lib/auth/session";
import { requireAdminUser } from "@/lib/admin-workspace";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import { executeHasuraGraphql } from "@/lib/graphql/client";

export const supportRequestCategories = [
  "general",
  "questionnaire",
  "documents",
  "evidence_links",
  "sharing",
  "passport_pdf",
  "account",
  "other",
] as const;

export const supportRequestStatuses = ["open", "in_progress", "resolved", "closed"] as const;
export const supportRequestPriorities = ["low", "normal", "high"] as const;

export type SupportRequestCategory = (typeof supportRequestCategories)[number];
export type SupportRequestStatus = (typeof supportRequestStatuses)[number];
export type SupportRequestPriority = (typeof supportRequestPriorities)[number];

export type SupportRequestSummary = {
  id: string;
  organizationId: string;
  organizationName: string;
  requesterEmail: string | null;
  requesterName: string | null;
  subject: string | null;
  message: string;
  category: SupportRequestCategory | null;
  status: SupportRequestStatus;
  priority: SupportRequestPriority;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

type SupportRequestRecord = {
  id: string;
  organization_id: string;
  requester_email: string | null;
  requester_name: string | null;
  subject: string | null;
  message: string;
  category: string | null;
  status: string;
  priority: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type CreateSupportRequestInput = {
  subject?: unknown;
  message?: unknown;
  category?: unknown;
};

type UpdateSupportRequestInput = {
  status?: unknown;
  priority?: unknown;
  adminNote?: unknown;
};

const insertSupportRequestMutation = `
  mutation InsertSupportRequest($object: support_requests_insert_input!) {
    insert_support_requests_one(object: $object) {
      id
      organization_id
      requester_email
      requester_name
      subject
      message
      category
      status
      priority
      admin_note
      created_at
      updated_at
      resolved_at
    }
  }
`;

const listSupportRequestsQuery = `
  query ListSupportRequests {
    support_requests(order_by: [{ status: asc }, { created_at: desc }]) {
      id
      organization_id
      requester_email
      requester_name
      subject
      message
      category
      status
      priority
      admin_note
      created_at
      updated_at
      resolved_at
    }
    organizations {
      id
      name
    }
  }
`;

const updateSupportRequestMutation = `
  mutation UpdateSupportRequest($id: uuid!, $changes: support_requests_set_input!) {
    update_support_requests_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      organization_id
      requester_email
      requester_name
      subject
      message
      category
      status
      priority
      admin_note
      created_at
      updated_at
      resolved_at
    }
  }
`;

const organizationNameByIdQuery = `
  query GetSupportRequestOrganization($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
    }
  }
`;

export class SupportRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupportRequestValidationError";
  }
}

export async function createSupportRequest(request: Request, input: CreateSupportRequestInput) {
  const user = await requireCurrentUser(request);
  const organization = await getPrimaryOrganizationForUserWithAdmin(user.id);

  if (!organization) {
    throw new AuthenticationRequiredError("Organization membership required.");
  }

  const normalized = normalizeCreateInput(input);
  const requesterName = getRequesterName(user);
  const result = await executeHasuraGraphql<{
    insert_support_requests_one: SupportRequestRecord | null;
  }>(
    insertSupportRequestMutation,
    {
      object: {
        organization_id: organization.id,
        requester_user_id: user.id,
        requester_email: user.email ?? null,
        requester_name: requesterName,
        subject: normalized.subject,
        message: normalized.message,
        category: normalized.category,
      },
    },
    { useAdminSecret: true },
  );

  if (!result.insert_support_requests_one) {
    throw new Error("support_request_create_failed");
  }

  return normalizeSupportRequest(result.insert_support_requests_one, organization.name);
}

export async function getAdminSupportRequests(request: Request) {
  await requireAdminUser(request);
  const result = await executeHasuraGraphql<{
    support_requests: SupportRequestRecord[];
    organizations: Array<{ id: string; name: string }>;
  }>(
    listSupportRequestsQuery,
    {},
    { useAdminSecret: true },
  );
  const organizationNames = new Map(
    result.organizations.map((organization) => [organization.id, organization.name]),
  );

  return result.support_requests.map((supportRequest) =>
    normalizeSupportRequest(supportRequest, organizationNames.get(supportRequest.organization_id)),
  );
}

export async function updateAdminSupportRequest(
  request: Request,
  supportRequestId: string,
  input: UpdateSupportRequestInput,
) {
  await requireAdminUser(request);
  const normalized = normalizeUpdateInput(input);
  const resolvedAt = normalized.status && ["resolved", "closed"].includes(normalized.status)
    ? new Date().toISOString()
    : normalized.status
      ? null
      : undefined;
  const changes: Record<string, unknown> = {
    ...("status" in normalized ? { status: normalized.status } : {}),
    ...("priority" in normalized ? { priority: normalized.priority } : {}),
    ...("adminNote" in normalized ? { admin_note: normalized.adminNote } : {}),
    ...(resolvedAt !== undefined ? { resolved_at: resolvedAt } : {}),
  };

  if (!Object.keys(changes).length) {
    throw new SupportRequestValidationError("No supported changes provided.");
  }

  const result = await executeHasuraGraphql<{
    update_support_requests_by_pk: SupportRequestRecord | null;
  }>(
    updateSupportRequestMutation,
    { id: supportRequestId, changes },
    { useAdminSecret: true },
  );

  if (!result.update_support_requests_by_pk) {
    return null;
  }

  const organizationName = await getOrganizationName(result.update_support_requests_by_pk.organization_id);

  return normalizeSupportRequest(result.update_support_requests_by_pk, organizationName);
}

function normalizeCreateInput(input: CreateSupportRequestInput) {
  const message = normalizeRequiredText(input.message, 3, 3000, "Message is required.");
  const subject = normalizeOptionalText(input.subject, 160);
  const category = normalizeCategory(input.category);

  return { subject, message, category };
}

function normalizeUpdateInput(input: UpdateSupportRequestInput) {
  return {
    ...(input.status !== undefined ? { status: normalizeStatus(input.status) } : {}),
    ...(input.priority !== undefined ? { priority: normalizePriority(input.priority) } : {}),
    ...(input.adminNote !== undefined ? { adminNote: normalizeOptionalText(input.adminNote, 5000) } : {}),
  };
}

function normalizeRequiredText(value: unknown, min: number, max: number, message: string) {
  if (typeof value !== "string") {
    throw new SupportRequestValidationError(message);
  }

  const normalized = value.trim();

  if (normalized.length < min) {
    throw new SupportRequestValidationError(message);
  }

  return normalized.slice(0, max);
}

function normalizeOptionalText(value: unknown, max: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : null;
}

function normalizeCategory(value: unknown): SupportRequestCategory | null {
  if (typeof value !== "string" || !value.trim()) {
    return "general";
  }

  if (supportRequestCategories.includes(value as SupportRequestCategory)) {
    return value as SupportRequestCategory;
  }

  throw new SupportRequestValidationError("Unsupported support category.");
}

function normalizeStatus(value: unknown): SupportRequestStatus {
  if (typeof value === "string" && supportRequestStatuses.includes(value as SupportRequestStatus)) {
    return value as SupportRequestStatus;
  }

  throw new SupportRequestValidationError("Unsupported support status.");
}

function normalizePriority(value: unknown): SupportRequestPriority {
  if (typeof value === "string" && supportRequestPriorities.includes(value as SupportRequestPriority)) {
    return value as SupportRequestPriority;
  }

  throw new SupportRequestValidationError("Unsupported support priority.");
}

async function getOrganizationName(organizationId: string) {
  const result = await executeHasuraGraphql<{
    organizations_by_pk: { name: string } | null;
  }>(organizationNameByIdQuery, { organizationId }, { useAdminSecret: true });

  return result.organizations_by_pk?.name;
}

function normalizeSupportRequest(
  record: SupportRequestRecord,
  organizationName = "Organization",
): SupportRequestSummary {
  return {
    id: record.id,
    organizationId: record.organization_id,
    organizationName,
    requesterEmail: record.requester_email,
    requesterName: record.requester_name,
    subject: record.subject,
    message: record.message,
    category: supportRequestCategories.includes(record.category as SupportRequestCategory)
      ? (record.category as SupportRequestCategory)
      : null,
    status: supportRequestStatuses.includes(record.status as SupportRequestStatus)
      ? (record.status as SupportRequestStatus)
      : "open",
    priority: supportRequestPriorities.includes(record.priority as SupportRequestPriority)
      ? (record.priority as SupportRequestPriority)
      : "normal",
    adminNote: record.admin_note,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    resolvedAt: record.resolved_at,
  };
}

function getRequesterName(user: { displayName?: string | null; metadata?: Record<string, unknown> | null }) {
  const metadataName =
    typeof user.metadata?.displayName === "string"
      ? user.metadata.displayName
      : typeof user.metadata?.fullName === "string"
        ? user.metadata.fullName
        : typeof user.metadata?.name === "string"
          ? user.metadata.name
          : null;

  return user.displayName || metadataName;
}
