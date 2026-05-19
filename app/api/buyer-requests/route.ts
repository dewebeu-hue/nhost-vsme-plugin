import { NextResponse } from "next/server";
import {
  type BuyerRequest,
  type BuyerRequestInput,
  type BuyerRequestListReadiness,
  isBuyerRequestStatus,
  normalizeBuyerRequestRecord,
  normalizeRequestedSections,
} from "@/lib/buyer-requests";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

type OrganizationResolution =
  | { ok: true; userId: string; organizationId: string; role: string }
  | {
      ok: false;
      category: string;
      stage: string;
      status: number;
      hasUserId: boolean;
      safeGraphqlMessage?: string;
    };

const writableRoles = new Set(["owner", "editor", "admin"]);

type QuestionSectionRecord = {
  id: string;
  code: string;
};

type QuestionItemRecord = {
  id: string;
  section_id: string;
};

type QuestionAnswerRecord = {
  question_item_id: string;
  status: string;
};

const getMembershipQuery = `
  query GetBuyerRequestMembership($userId: uuid!) {
    organization_members(where: { user_id: { _eq: $userId } }, limit: 1) {
      id
      user_id
      organization_id
      role
    }
  }
`;

const listBuyerRequestsQuery = `
  query ListBuyerRequests($organizationId: uuid!, $status: String) {
    buyer_requests(
      where: {
        organization_id: { _eq: $organizationId }
        status: { _eq: $status }
      }
      order_by: [{ due_date: asc_nulls_last }, { created_at: desc }]
    ) {
      id
      organization_id
      buyer_name
      buyer_contact_name
      buyer_contact_email
      request_title
      request_description
      due_date
      status
      requested_sections
      notes
      created_by_user_id
      created_at
      updated_at
    }
  }
`;

const listAllBuyerRequestsQuery = `
  query ListBuyerRequests($organizationId: uuid!) {
    buyer_requests(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ due_date: asc_nulls_last }, { created_at: desc }]
    ) {
      id
      organization_id
      buyer_name
      buyer_contact_name
      buyer_contact_email
      request_title
      request_description
      due_date
      status
      requested_sections
      notes
      created_by_user_id
      created_at
      updated_at
    }
  }
`;

const insertBuyerRequestMutation = `
  mutation InsertBuyerRequest($object: buyer_requests_insert_input!) {
    insert_buyer_requests_one(object: $object) {
      id
      organization_id
      buyer_name
      buyer_contact_name
      buyer_contact_email
      request_title
      request_description
      due_date
      status
      requested_sections
      notes
      created_by_user_id
      created_at
      updated_at
    }
  }
`;

const listReadinessQuery = `
  query GetBuyerRequestListReadiness($organizationId: uuid!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
    }
    question_answers(where: { organization_id: { _eq: $organizationId } }) {
      question_item_id
      status
    }
  }
`;

export async function GET(request: Request) {
  const organizationResult = await resolveOrganizationForRequest(request);

  if (!organizationResult.ok) {
    return buyerRequestError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      organizationResult,
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const useStatusFilter = isBuyerRequestStatus(status);
  const result = await executeAdminGraphql<{ buyer_requests: BuyerRequest[] }>({
    operationName: "ListBuyerRequests",
    query: useStatusFilter ? listBuyerRequestsQuery : listAllBuyerRequestsQuery,
    variables: useStatusFilter
      ? { organizationId: organizationResult.organizationId, status }
      : { organizationId: organizationResult.organizationId },
  });

  if (!result.ok) {
    return buyerRequestError("buyer_request_list_graphql_error", "list", 502, {
      hasUserId: true,
      safeGraphqlMessage: result.safeGraphqlMessage,
    });
  }

  const normalizedRequests = result.data.buyer_requests.map(normalizeBuyerRequestRecord);
  const readinessByRequestId = await loadListReadiness(
    organizationResult.organizationId,
    normalizedRequests,
  );

  return NextResponse.json({
    ok: true,
    requests: normalizedRequests.map((buyerRequest) => ({
      ...buyerRequest,
      readiness: readinessByRequestId.get(buyerRequest.id),
    })),
  });
}

export async function POST(request: Request) {
  const organizationResult = await resolveOrganizationForRequest(request);

  if (!organizationResult.ok) {
    return buyerRequestError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      organizationResult,
    );
  }

  if (!writableRoles.has(organizationResult.role)) {
    return buyerRequestError("permission_denied", "membership_lookup", 403, {
      hasUserId: true,
    });
  }

  const payload = await readJson<BuyerRequestInput>(request);
  const validation = validateBuyerRequestInput(payload, "create");

  if (!validation.ok) {
    return buyerRequestError(validation.category, "validation", 400, { hasUserId: true });
  }

  const result = await executeAdminGraphql<{ insert_buyer_requests_one: BuyerRequest | null }>({
    operationName: "InsertBuyerRequest",
    query: insertBuyerRequestMutation,
    variables: {
      object: {
        organization_id: organizationResult.organizationId,
        buyer_name: validation.value.buyer_name,
        buyer_contact_name: validation.value.buyer_contact_name,
        buyer_contact_email: validation.value.buyer_contact_email,
        request_title: validation.value.request_title,
        request_description: validation.value.request_description,
        due_date: validation.value.due_date,
        status: validation.value.status,
        requested_sections: validation.value.requested_sections,
        notes: validation.value.notes,
        created_by_user_id: organizationResult.userId,
      },
    },
  });

  if (!result.ok || !result.data.insert_buyer_requests_one) {
    return buyerRequestError("buyer_request_insert_graphql_error", "insert", 502, {
      hasUserId: true,
      safeGraphqlMessage: result.ok
        ? "Buyer request insert returned no row."
        : result.safeGraphqlMessage,
    });
  }

  return NextResponse.json({
    ok: true,
    request: normalizeBuyerRequestRecord(result.data.insert_buyer_requests_one),
  });
}

export async function resolveOrganizationForRequest(request: Request): Promise<OrganizationResolution> {
  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return {
      ok: false,
      category: tokenResult.category,
      stage: "auth",
      status: 401,
      hasUserId: false,
    };
  }

  const userResult = await resolveUserIdFromNhostToken(tokenResult.token);

  if (!userResult.ok) {
    return {
      ok: false,
      category: userResult.category,
      stage: "auth_user_lookup",
      status: 401,
      hasUserId: false,
    };
  }

  const membershipResult = await executeAdminGraphql<{ organization_members: Membership[] }>({
    operationName: "GetBuyerRequestMembership",
    query: getMembershipQuery,
    variables: { userId: userResult.userId },
  });

  if (!membershipResult.ok) {
    return {
      ok: false,
      category: "membership_lookup_graphql_error",
      stage: "membership_lookup",
      status: 502,
      hasUserId: true,
      safeGraphqlMessage: membershipResult.safeGraphqlMessage,
    };
  }

  const membership = membershipResult.data.organization_members[0];

  if (!membership) {
    return {
      ok: false,
      category: "membership_not_found",
      stage: "membership_lookup",
      status: 404,
      hasUserId: true,
    };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

export function validateBuyerRequestInput(payload: BuyerRequestInput | null, mode: "create" | "update") {
  if (!payload || typeof payload !== "object") {
    return { ok: false as const, category: "invalid_buyer_request_payload" };
  }

  const buyerName = normalizeOptionalString(payload.buyerName);
  const requestTitle = normalizeOptionalString(payload.requestTitle);
  const status = payload.status && isBuyerRequestStatus(payload.status) ? payload.status : "draft";
  const buyerContactEmail = normalizeOptionalString(payload.buyerContactEmail);
  const dueDate = normalizeDate(payload.dueDate);

  if (mode === "create" && (!buyerName || !requestTitle)) {
    return { ok: false as const, category: "missing_required_fields" };
  }

  if (
    mode === "update" &&
    (("buyerName" in payload && !buyerName) || ("requestTitle" in payload && !requestTitle))
  ) {
    return { ok: false as const, category: "missing_required_fields" };
  }

  if (buyerContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerContactEmail)) {
    return { ok: false as const, category: "invalid_buyer_contact_email" };
  }

  if (payload.dueDate && !dueDate) {
    return { ok: false as const, category: "invalid_due_date" };
  }

  return {
    ok: true as const,
    value: {
      buyer_name: buyerName ?? "",
      buyer_contact_name: normalizeOptionalString(payload.buyerContactName),
      buyer_contact_email: buyerContactEmail,
      request_title: requestTitle ?? "",
      request_description: normalizeOptionalString(payload.requestDescription),
      due_date: dueDate,
      status,
      requested_sections: normalizeRequestedSections(payload.requestedSections),
      notes: normalizeOptionalString(payload.notes),
    },
  };
}

async function loadListReadiness(
  organizationId: string,
  buyerRequests: BuyerRequest[],
): Promise<Map<string, BuyerRequestListReadiness>> {
  if (!buyerRequests.length) {
    return new Map();
  }

  const result = await executeAdminGraphql<{
    question_sections: QuestionSectionRecord[];
    question_items: QuestionItemRecord[];
    question_answers: QuestionAnswerRecord[];
  }>({
    operationName: "GetBuyerRequestListReadiness",
    query: listReadinessQuery,
    variables: { organizationId },
  });

  if (!result.ok) {
    return new Map();
  }

  const answerByQuestionItem = new Map(
    result.data.question_answers.map((answer) => [answer.question_item_id, answer]),
  );
  const sectionsByCode = new Map(result.data.question_sections.map((section) => [section.code, section]));
  const itemsBySectionId = new Map<string, QuestionItemRecord[]>();

  for (const item of result.data.question_items) {
    const current = itemsBySectionId.get(item.section_id) ?? [];
    current.push(item);
    itemsBySectionId.set(item.section_id, current);
  }

  return new Map(
    buyerRequests.map((buyerRequest) => [
      buyerRequest.id,
      {
        ...calculateRequestReadiness(
          buyerRequest,
          result.data.question_sections,
          sectionsByCode,
          itemsBySectionId,
          answerByQuestionItem,
        ),
      },
    ]),
  );
}

function calculateRequestReadiness(
  buyerRequest: BuyerRequest,
  allSections: QuestionSectionRecord[],
  sectionsByCode: Map<string, QuestionSectionRecord>,
  itemsBySectionId: Map<string, QuestionItemRecord[]>,
  answerByQuestionItem: Map<string, QuestionAnswerRecord>,
) {
  const sections = buyerRequest.requested_sections.length
    ? buyerRequest.requested_sections
        .map((code) => sectionsByCode.get(code))
        .filter((section): section is QuestionSectionRecord => Boolean(section))
    : allSections;

  const items = sections.flatMap((section) => itemsBySectionId.get(section.id) ?? []);

  if (!items.length) {
    return { readinessPercent: 0, missingActionsCount: sections.length ? sections.length : 0 };
  }

  const answered = items.filter((item) => {
    const answer = answerByQuestionItem.get(item.id);
    return answer && ["in_progress", "completed", "needs_evidence", "reviewed"].includes(answer.status);
  }).length;

  const incompleteSections = sections.filter((section) => {
    const sectionItems = itemsBySectionId.get(section.id) ?? [];
    if (!sectionItems.length) {
      return true;
    }

    return sectionItems.some((item) => {
      const answer = answerByQuestionItem.get(item.id);
      return !answer || !["in_progress", "completed", "needs_evidence", "reviewed"].includes(answer.status);
    });
  }).length;

  return {
    readinessPercent: Math.round((answered / items.length) * 100),
    missingActionsCount: incompleteSections,
  };
}

export async function executeAdminGraphql<TData>({
  operationName,
  query,
  variables,
}: {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}): Promise<AdminGraphqlResult<TData>> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

  if (!graphqlUrl || !adminSecret) {
    return { ok: false, safeGraphqlMessage: "Buyer request backend is not configured." };
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ operationName, query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    return { ok: false, safeGraphqlMessage: firstError };
  }

  if (!payload.data) {
    return { ok: false, safeGraphqlMessage: "GraphQL response did not include data." };
  }

  return { ok: true, data: payload.data };
}

export function buyerRequestError(
  category: string,
  stage: string,
  status: number,
  metadata: { hasUserId?: boolean; safeGraphqlMessage?: string } = {},
) {
  logSafeDiagnostic("buyer_request_failed", {
    category,
    stage,
    hasUserId: metadata.hasUserId ?? false,
    message: metadata.safeGraphqlMessage,
  });

  return NextResponse.json(
    {
      error: "We could not update buyer requests right now.",
      category,
      stage,
      hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
      hasUserId: metadata.hasUserId ?? false,
      safeGraphqlMessage: metadata.safeGraphqlMessage,
    },
    { status },
  );
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function readBearerToken(header: string | null) {
  if (!header) {
    return { ok: false as const, category: "missing_authorization_header" };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false as const, category: "malformed_authorization_header" };
  }

  const token = header.slice("bearer ".length).trim();

  if (!token) {
    return { ok: false as const, category: "malformed_authorization_header" };
  }

  return { ok: true as const, token };
}

async function resolveUserIdFromNhostToken(token: string) {
  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return { ok: false as const, category: "auth_user_lookup_failed" };
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false as const,
        category: isTokenExpired(token) ? "token_expired" : "auth_user_lookup_failed",
      };
    }

    if (!response.ok) {
      return { ok: false as const, category: "auth_user_lookup_failed" };
    }

    const user = (await response.json()) as { id?: unknown };

    if (typeof user.id !== "string" || !user.id) {
      return { ok: false as const, category: "user_id_missing" };
    }

    return { ok: true as const, userId: user.id };
  } catch {
    return { ok: false as const, category: "auth_user_lookup_failed" };
  }
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 2000) : null;
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : value;
}

function isTokenExpired(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return false;
  }

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { exp?: unknown };

    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}
