import { NextResponse } from "next/server";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type EvidenceDocumentRecord = {
  id: string;
  organization_id: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  document_type: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type QuestionItemRecord = {
  id: string;
  code: string;
  title: string;
  evidence_required: boolean;
  section_id: string;
};

type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
};

type QuestionAnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  status: "not_started" | "in_progress" | "completed" | "needs_evidence" | "reviewed";
};

type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
  created_at: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

type BearerTokenResult =
  | { ok: true; token: string }
  | {
      ok: false;
      category: "missing_authorization_header" | "malformed_authorization_header";
    };

type UserIdResolutionResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      category: "auth_user_lookup_failed" | "token_expired" | "user_id_missing";
    };

const getMembershipQuery = `
  query GetDocumentMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      limit: 1
    ) {
      id
      user_id
      organization_id
      role
    }
  }
`;

const getDocumentsDataQuery = `
  query GetDocumentsData($organizationId: uuid!, $documentIds: [uuid!]) {
    documents(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      organization_id
      file_name
      file_size_bytes
      mime_type
      document_type
      status
      expires_at
      created_at
      updated_at
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      organization_id
      question_item_id
      status
    }
    question_items(order_by: { sort_order: asc }) {
      id
      code
      title
      evidence_required
      section_id
    }
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
    }
    document_links(
      where: { document_id: { _in: $documentIds } }
      order_by: { created_at: desc }
    ) {
      id
      document_id
      question_answer_id
      created_at
    }
  }
`;

const getDocumentIdsQuery = `
  query GetDocumentIds($organizationId: uuid!) {
    documents(where: { organization_id: { _eq: $organizationId } }) {
      id
    }
  }
`;

export async function GET(request: Request) {
  logSafeDiagnostic("documents_load_start");
  return loadDocuments(request);
}

export async function POST(request: Request) {
  logSafeDiagnostic("documents_load_start");
  return loadDocuments(request);
}

async function loadDocuments(request: Request) {
  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return documentsError(tokenResult.category, "auth", 401);
  }

  const organizationResult = await resolveOrganizationIdForRequest(tokenResult.token);

  if (!organizationResult.ok) {
    return documentsError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      {
        hasUserId: organizationResult.hasUserId,
        organizationIdPresent: false,
        membershipVerified: false,
        documentCount: 0,
        safeGraphqlMessage: organizationResult.safeGraphqlMessage,
      },
    );
  }

  const documentIdsResult = await executeDocumentsAdminGraphql<{
    documents: Array<{ id: string }>;
  }>({
    operationName: "GetDocumentIds",
    query: getDocumentIdsQuery,
    variables: { organizationId: organizationResult.organizationId },
  });

  if (!documentIdsResult.ok) {
    return documentsError("documents_lookup_graphql_error", "documents_lookup", 502, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
      documentCount: 0,
      safeGraphqlMessage: documentIdsResult.safeGraphqlMessage,
    });
  }

  const documentIds = documentIdsResult.data.documents.map((document) => document.id);
  const dataResult = await executeDocumentsAdminGraphql<{
    documents: EvidenceDocumentRecord[];
    question_answers: QuestionAnswerRecord[];
    question_items: QuestionItemRecord[];
    question_sections: QuestionSectionRecord[];
    document_links: DocumentLinkRecord[];
  }>({
    operationName: "GetDocumentsData",
    query: getDocumentsDataQuery,
    variables: {
      organizationId: organizationResult.organizationId,
      documentIds,
    },
  });

  if (!dataResult.ok) {
    return documentsError("documents_lookup_graphql_error", "documents_lookup", 502, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
      documentCount: 0,
      safeGraphqlMessage: dataResult.safeGraphqlMessage,
    });
  }

  const itemMap = new Map(dataResult.data.question_items.map((item) => [item.id, item]));
  const sectionMap = new Map(dataResult.data.question_sections.map((section) => [section.id, section]));
  const answerMap = new Map(dataResult.data.question_answers.map((answer) => [answer.id, answer]));
  const answers = dataResult.data.question_answers.map((answer) => {
    const questionItem = itemMap.get(answer.question_item_id);
    const questionSection = questionItem ? sectionMap.get(questionItem.section_id) : null;

    return {
      ...answer,
      question_item: questionItem
        ? {
            ...questionItem,
            question_section: questionSection ?? null,
          }
        : null,
    };
  });
  const documentLinks = dataResult.data.document_links.map((link) => {
    const answer = answerMap.get(link.question_answer_id);
    const questionItem = answer ? itemMap.get(answer.question_item_id) : null;
    const questionSection = questionItem ? sectionMap.get(questionItem.section_id) : null;

    return {
      ...link,
      question_answer: answer
        ? {
            ...answer,
            question_item: questionItem
              ? {
                  ...questionItem,
                  question_section: questionSection ?? null,
                }
              : null,
          }
        : null,
    };
  });

  logSafeDiagnostic("documents_load_success", {
    hasUserId: true,
    organizationIdPresent: true,
    membershipVerified: true,
    documentCount: dataResult.data.documents.length,
  });

  return NextResponse.json({
    configured: true,
    organization: { id: organizationResult.organizationId },
    documents: dataResult.data.documents,
    documentLinks,
    questions: dataResult.data.question_items.map((item) => ({
      ...item,
      question_section: sectionMap.get(item.section_id) ?? null,
    })),
    answers,
    isMock: false,
  });
}

type OrganizationResolutionResult =
  | {
      ok: true;
      userId: string;
      organizationId: string;
      role: string;
    }
  | {
      ok: false;
      category:
        | "auth_user_lookup_failed"
        | "token_expired"
        | "user_id_missing"
        | "hasura_admin_secret_missing"
        | "membership_lookup_graphql_error"
        | "membership_not_found";
      stage: string;
      status: number;
      hasUserId: boolean;
      membershipCount: number;
      safeGraphqlMessage?: string;
    };

async function resolveOrganizationIdForRequest(token: string): Promise<OrganizationResolutionResult> {
  const userResult = await resolveUserIdFromNhostToken(token);

  if (!userResult.ok) {
    return {
      ok: false,
      category: userResult.category,
      stage: "auth_user_lookup",
      status: 401,
      hasUserId: false,
      membershipCount: 0,
    };
  }

  if (!getNhostGraphqlUrl() || !process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
    return {
      ok: false,
      category: "hasura_admin_secret_missing",
      stage: "membership_lookup",
      status: 500,
      hasUserId: true,
      membershipCount: 0,
    };
  }

  const membershipResult = await executeDocumentsAdminGraphql<{
    organization_members: Membership[];
  }>({
    operationName: "GetDocumentMembership",
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
      membershipCount: 0,
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
      membershipCount: 0,
    };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

function documentsError(
  category: string,
  stage: string,
  status: number,
  metadata: {
    hasUserId?: boolean;
    organizationIdPresent?: boolean;
    membershipVerified?: boolean;
    documentCount?: number;
    safeGraphqlMessage?: string;
  } = {},
) {
  logSafeDiagnostic("documents_failed", {
    category,
    stage,
    hasUserId: metadata.hasUserId ?? false,
    organizationIdPresent: metadata.organizationIdPresent ?? false,
    membershipVerified: metadata.membershipVerified ?? false,
    documentCount: metadata.documentCount ?? 0,
    message: metadata.safeGraphqlMessage,
  });

  return NextResponse.json(
    {
      error: "We could not load your documents right now.",
      category,
      stage,
      hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
      hasUserId: metadata.hasUserId ?? false,
      organizationIdPresent: metadata.organizationIdPresent ?? false,
      membershipVerified: metadata.membershipVerified ?? false,
      documentCount: metadata.documentCount ?? 0,
      safeGraphqlMessage: metadata.safeGraphqlMessage,
    },
    { status },
  );
}

function readBearerToken(header: string | null): BearerTokenResult {
  if (!header) {
    return { ok: false, category: "missing_authorization_header" };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  const token = header.slice("bearer ".length).trim();

  if (!token) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  return { ok: true, token };
}

async function resolveUserIdFromNhostToken(token: string): Promise<UserIdResolutionResult> {
  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return { ok: false, category: "auth_user_lookup_failed" };
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        category: isTokenExpired(token) ? "token_expired" : "auth_user_lookup_failed",
      };
    }

    if (!response.ok) {
      return { ok: false, category: "auth_user_lookup_failed" };
    }

    const user = (await response.json()) as { id?: unknown };

    if (typeof user.id !== "string" || !user.id) {
      return { ok: false, category: "user_id_missing" };
    }

    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, category: "auth_user_lookup_failed" };
  }
}

async function executeDocumentsAdminGraphql<TData>({
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
    return { ok: false, safeGraphqlMessage: "Hasura admin lookup is not configured." };
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Documents admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Documents admin GraphQL returned errors", {
      operationName,
      message: firstError,
    });
    return { ok: false, safeGraphqlMessage: firstError };
  }

  if (!payload.data) {
    return { ok: false, safeGraphqlMessage: "GraphQL response did not include data." };
  }

  return { ok: true, data: payload.data };
}

function isTokenExpired(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}
