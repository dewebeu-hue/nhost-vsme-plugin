import { NextResponse } from "next/server";
import { DOCUMENT_LINK_FRAGMENT } from "@/lib/graphql/fragments";
import { GET_DOCUMENT_LINKS } from "@/lib/graphql/queries";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";

export const runtime = "nodejs";

type DocumentLinksPayload = {
  action?: unknown;
  organizationId?: unknown;
  documentId?: unknown;
  questionAnswerId?: unknown;
  questionAnswerIds?: unknown;
  currentDocumentStatus?: unknown;
};

type Membership = {
  id: string;
  organization_id: string;
  role: string;
};

type DocumentScope = {
  id: string;
  organization_id: string;
  status: string;
};

type AnswerScope = {
  id: string;
  organization_id: string;
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
  | { ok: false; category: "missing_authorization_header" | "malformed_authorization_header" };

type UserIdResolutionResult =
  | { ok: true; userId: string }
  | { ok: false; category: "auth_user_lookup_failed" | "token_expired" | "user_id_missing" };

type OrganizationResolutionResult =
  | { ok: true; userId: string; organizationId: string; role: string }
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
      safeGraphqlMessage?: string;
    };

const getMembershipQuery = `
  query GetDocumentLinkMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      limit: 1
    ) {
      id
      organization_id
      role
    }
  }
`;

const verifyDocumentLinkScopeQuery = `
  query VerifyDocumentLinkScope(
    $organizationId: uuid!
    $documentId: uuid!
    $questionAnswerIds: [uuid!]!
  ) {
    documents_by_pk(id: $documentId) {
      id
      organization_id
      status
    }
    question_answers(
      where: {
        id: { _in: $questionAnswerIds }
        organization_id: { _eq: $organizationId }
      }
    ) {
      id
      organization_id
    }
  }
`;

const linkDocumentsToAnswersMutation = `
  ${DOCUMENT_LINK_FRAGMENT}

  mutation LinkDocumentsToAnswers($objects: [document_links_insert_input!]!) {
    insert_document_links(
      objects: $objects
      on_conflict: {
        constraint: document_links_document_id_question_answer_id_key
        update_columns: [created_at]
      }
    ) {
      returning {
        ...DocumentLinkFields
      }
    }
  }
`;

const unlinkDocumentFromAnswerMutation = `
  ${DOCUMENT_LINK_FRAGMENT}

  mutation UnlinkDocumentFromAnswer($documentId: uuid!, $questionAnswerId: uuid!) {
    delete_document_links(
      where: {
        document_id: { _eq: $documentId }
        question_answer_id: { _eq: $questionAnswerId }
      }
    ) {
      returning {
        ...DocumentLinkFields
      }
    }
  }
`;

const updateDocumentStatusMutation = `
  mutation UpdateEvidenceDocumentStatus($documentId: uuid!, $status: String!) {
    update_documents_by_pk(pk_columns: { id: $documentId }, _set: { status: $status }) {
      id
      status
    }
  }
`;

export async function POST(request: Request) {
  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return documentLinksError(tokenResult.category, "auth", 401);
  }

  const organizationResult = await resolveOrganizationForRequest(tokenResult.token);

  if (!organizationResult.ok) {
    return documentLinksError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      organizationResult.safeGraphqlMessage,
    );
  }

  try {
    const payload = (await request.json()) as DocumentLinksPayload;
    const action = readString(payload.action) || "list";
    const organizationId = readString(payload.organizationId);

    if (!isUuid(organizationId) || organizationId !== organizationResult.organizationId) {
      return documentLinksError("organization_scope_mismatch", "scope_check", 403);
    }

    if (action === "link") {
      const documentId = readString(payload.documentId);
      const questionAnswerIds = readUuidArray(payload.questionAnswerIds);

      if (!isUuid(documentId) || !questionAnswerIds.length) {
        return documentLinksError("invalid_link_payload", "validation", 400);
      }

      const scopeResult = await verifyDocumentAndAnswersScope(
        organizationId,
        documentId,
        questionAnswerIds,
      );

      if (!scopeResult.ok) {
        return documentLinksError(
          scopeResult.category,
          scopeResult.stage,
          scopeResult.status,
          scopeResult.safeGraphqlMessage,
        );
      }

      const linkResult = await executeDocumentLinksAdminGraphql<{
        insert_document_links: { returning: DocumentLinkRecord[] } | null;
      }>({
        operationName: "LinkDocumentsToAnswers",
        query: linkDocumentsToAnswersMutation,
        variables: {
          objects: questionAnswerIds.map((questionAnswerId) => ({
            document_id: documentId,
            question_answer_id: questionAnswerId,
          })),
        },
      });

      if (!linkResult.ok) {
        return documentLinksError(
          "document_link_graphql_error",
          "link_mutation",
          502,
          linkResult.safeGraphqlMessage,
        );
      }

      if (isUploadedStatus(readString(payload.currentDocumentStatus)) || scopeResult.document.status === "uploaded") {
        await executeDocumentLinksAdminGraphql({
          operationName: "UpdateEvidenceDocumentStatus",
          query: updateDocumentStatusMutation,
          variables: { documentId, status: "linked" },
        });
      }
    }

    if (action === "unlink") {
      const documentId = readString(payload.documentId);
      const questionAnswerId = readString(payload.questionAnswerId);

      if (!isUuid(documentId) || !isUuid(questionAnswerId)) {
        return documentLinksError("invalid_unlink_payload", "validation", 400);
      }

      const scopeResult = await verifyDocumentAndAnswersScope(organizationId, documentId, [
        questionAnswerId,
      ]);

      if (!scopeResult.ok) {
        return documentLinksError(
          scopeResult.category,
          scopeResult.stage,
          scopeResult.status,
          scopeResult.safeGraphqlMessage,
        );
      }

      const unlinkResult = await executeDocumentLinksAdminGraphql({
        operationName: "UnlinkDocumentFromAnswer",
        query: unlinkDocumentFromAnswerMutation,
        variables: { documentId, questionAnswerId },
      });

      if (!unlinkResult.ok) {
        return documentLinksError(
          "document_unlink_graphql_error",
          "unlink_mutation",
          502,
          unlinkResult.safeGraphqlMessage,
        );
      }
    }

    const linksResult = await executeDocumentLinksAdminGraphql<{ document_links: unknown[] }>({
      operationName: "GetDocumentLinks",
      query: GET_DOCUMENT_LINKS,
      variables: { organizationId },
    });

    if (!linksResult.ok) {
      return documentLinksError(
        "document_links_lookup_graphql_error",
        "links_lookup",
        502,
        linksResult.safeGraphqlMessage,
      );
    }

    return NextResponse.json({ configured: true, links: linksResult.data.document_links });
  } catch {
    return documentLinksError("unknown_document_links_error", "unknown", 500);
  }
}

async function resolveOrganizationForRequest(token: string): Promise<OrganizationResolutionResult> {
  const userResult = await resolveUserIdFromNhostToken(token);

  if (!userResult.ok) {
    return {
      ok: false,
      category: userResult.category,
      stage: "auth_user_lookup",
      status: 401,
    };
  }

  if (!getNhostGraphqlUrl() || !process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
    return {
      ok: false,
      category: "hasura_admin_secret_missing",
      stage: "membership_lookup",
      status: 500,
    };
  }

  const membershipResult = await executeDocumentLinksAdminGraphql<{
    organization_members: Membership[];
  }>({
    operationName: "GetDocumentLinkMembership",
    query: getMembershipQuery,
    variables: { userId: userResult.userId },
  });

  if (!membershipResult.ok) {
    return {
      ok: false,
      category: "membership_lookup_graphql_error",
      stage: "membership_lookup",
      status: 502,
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
    };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

async function verifyDocumentAndAnswersScope(
  organizationId: string,
  documentId: string,
  questionAnswerIds: string[],
): Promise<
  | { ok: true; document: DocumentScope; answers: AnswerScope[] }
  | { ok: false; category: string; stage: string; status: number; safeGraphqlMessage?: string }
> {
  const scopeResult = await executeDocumentLinksAdminGraphql<{
    documents_by_pk: DocumentScope | null;
    question_answers: AnswerScope[];
  }>({
    operationName: "VerifyDocumentLinkScope",
    query: verifyDocumentLinkScopeQuery,
    variables: { organizationId, documentId, questionAnswerIds },
  });

  if (!scopeResult.ok) {
    return {
      ok: false,
      category: "document_link_scope_graphql_error",
      stage: "scope_check",
      status: 502,
      safeGraphqlMessage: scopeResult.safeGraphqlMessage,
    };
  }

  const document = scopeResult.data.documents_by_pk;

  if (!document || document.organization_id !== organizationId) {
    return { ok: false, category: "document_not_found", stage: "scope_check", status: 404 };
  }

  if (scopeResult.data.question_answers.length !== questionAnswerIds.length) {
    return { ok: false, category: "question_answer_not_found", stage: "scope_check", status: 404 };
  }

  return { ok: true, document, answers: scopeResult.data.question_answers };
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

async function executeDocumentLinksAdminGraphql<TData>({
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
    console.error("Document links admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Document links admin GraphQL returned errors", {
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

function documentLinksError(
  category: string,
  stage: string,
  status: number,
  safeGraphqlMessage?: string,
) {
  console.warn("document_links_failed", {
    category,
    stage,
    hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
    message: safeGraphqlMessage,
  });

  return NextResponse.json(
    {
      error: "We could not update evidence links right now. Please try again.",
      category,
      stage,
      hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
      safeGraphqlMessage,
    },
    { status },
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readUuidArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && isUuid(item));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value,
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

function isUploadedStatus(status: string) {
  return status.toLowerCase() === "uploaded";
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
