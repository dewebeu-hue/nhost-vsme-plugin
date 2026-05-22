import { NextResponse } from "next/server";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";

export const runtime = "nodejs";

type DocumentLinksPayload = {
  action?: unknown;
  documentId?: unknown;
  questionAnswerId?: unknown;
  questionAnswerIds?: unknown;
  questionItemIds?: unknown;
  selectedQuestionItemIds?: unknown;
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
  question_item_id: string;
};

type QuestionItemScope = {
  id: string;
};

type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
  created_at: string;
};

type DocumentLinkDocumentRecord = {
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

type DocumentLinkAnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  status: string;
  value: unknown;
  updated_at: string;
};

type DocumentLinkQuestionItemRecord = {
  id: string;
  code: string;
  title: string;
  evidence_required: boolean;
  section_id: string;
};

type DocumentLinkQuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
};

type EnrichedDocumentLinkRecord = DocumentLinkRecord & {
  document: DocumentLinkDocumentRecord | null;
  question_answer:
    | (DocumentLinkAnswerRecord & {
        question_item:
          | (DocumentLinkQuestionItemRecord & {
              question_section: DocumentLinkQuestionSectionRecord | null;
            })
          | null;
      })
    | null;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

type DocumentLinksErrorMetadata = {
  hasUserId?: boolean;
  hasCurrentOrganizationId?: boolean;
  hasDocumentOrganizationId?: boolean;
  hasMembership?: boolean;
  documentBelongsToCurrentOrganization?: boolean;
  hasDocumentId?: boolean;
  hasQuestionItemIds?: boolean;
  firstSelectedQuestionItemIdPresent?: boolean;
  selectedQuestionItemCount?: number;
  foundQuestionItemCount?: number;
  answerOrganizationMatches?: boolean;
  safeGraphqlMessage?: string;
};

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
    $questionItemIds: [uuid!]!
  ) {
    documents_by_pk(id: $documentId) {
      id
      organization_id
      status
    }
    question_items(where: { id: { _in: $questionItemIds } }) {
      id
    }
    question_answers(
      where: {
        question_item_id: { _in: $questionItemIds }
        organization_id: { _eq: $organizationId }
      }
    ) {
      id
      organization_id
      question_item_id
    }
  }
`;

const createMissingAnswersMutation = `
  mutation CreateMissingQuestionAnswers($objects: [question_answers_insert_input!]!) {
    insert_question_answers(
      objects: $objects
      on_conflict: {
        constraint: question_answers_organization_id_question_item_id_key
        update_columns: []
      }
    ) {
      returning {
        id
        organization_id
        question_item_id
      }
    }
  }
`;

const linkDocumentsToAnswersMutation = `
  mutation LinkDocumentsToAnswers($objects: [document_links_insert_input!]!) {
    insert_document_links(
      objects: $objects
      on_conflict: {
        constraint: document_links_document_id_question_answer_id_key
        update_columns: [created_at]
      }
    ) {
      returning {
        id
        document_id
        question_answer_id
        created_at
      }
    }
  }
`;

const unlinkDocumentFromAnswerMutation = `
  mutation UnlinkDocumentFromAnswer($documentId: uuid!, $questionAnswerId: uuid!) {
    delete_document_links(
      where: {
        document_id: { _eq: $documentId }
        question_answer_id: { _eq: $questionAnswerId }
      }
    ) {
      returning {
        id
        document_id
        question_answer_id
        created_at
      }
    }
  }
`;

const getDocumentLinkDocumentIdsQuery = `
  query GetDocumentLinkDocumentIds($organizationId: uuid!) {
    documents(where: { organization_id: { _eq: $organizationId } }) {
      id
    }
  }
`;

const getDocumentLinksDataQuery = `
  query GetDocumentLinksData($organizationId: uuid!, $documentIds: [uuid!]) {
    documents(where: { organization_id: { _eq: $organizationId } }) {
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
    question_answers(where: { organization_id: { _eq: $organizationId } }) {
      id
      organization_id
      question_item_id
      status
      value
      updated_at
    }
    question_items {
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
      {
        hasUserId: organizationResult.category !== "auth_user_lookup_failed",
        hasCurrentOrganizationId: false,
        hasMembership: false,
        safeGraphqlMessage: organizationResult.safeGraphqlMessage,
      },
    );
  }

  try {
    const payload = (await request.json()) as DocumentLinksPayload;
    const explicitAction = readString(payload.action);
    const inferredAction = payload.documentId
      ? payload.questionItemIds || payload.selectedQuestionItemIds || payload.questionAnswerIds
        ? "link"
        : payload.questionAnswerId
          ? "unlink"
          : "list"
      : "list";
    const action = explicitAction || inferredAction;
    const organizationId = organizationResult.organizationId;

    if (action === "link") {
      const documentId = readString(payload.documentId);
      const questionItemIds = readIdArray(
        payload.questionItemIds ?? payload.selectedQuestionItemIds ?? payload.questionAnswerIds,
      );

      if (!isUuid(documentId) || !questionItemIds.length) {
        return documentLinksError("invalid_link_payload", "validation", 400, {
          hasUserId: true,
          hasCurrentOrganizationId: true,
          hasMembership: true,
          hasDocumentId: isUuid(documentId),
          hasQuestionItemIds:
            Array.isArray(payload.questionItemIds) ||
            Array.isArray(payload.selectedQuestionItemIds) ||
            Array.isArray(payload.questionAnswerIds),
          firstSelectedQuestionItemIdPresent: questionItemIds.length > 0,
          selectedQuestionItemCount: questionItemIds.length,
        });
      }

      const scopeResult = await verifyDocumentAndAnswersScope(
        organizationId,
        documentId,
        questionItemIds,
      );

      if (!scopeResult.ok) {
        return documentLinksError(
          scopeResult.category,
          scopeResult.stage,
          scopeResult.status,
          scopeResult.metadata,
        );
      }
      const ensuredAnswerResult = await ensureQuestionAnswersForItems(
        organizationId,
        questionItemIds,
        scopeResult.answers,
      );

      if (!ensuredAnswerResult.ok) {
        return documentLinksError(
          "question_answer_ensure_graphql_error",
          "ensure_answer",
          502,
          {
            hasUserId: true,
            hasCurrentOrganizationId: true,
            hasMembership: true,
            selectedQuestionItemCount: questionItemIds.length,
            safeGraphqlMessage: ensuredAnswerResult.safeGraphqlMessage,
          },
        );
      }

      const questionAnswerIds = ensuredAnswerResult.questionAnswerIds;

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
          {
            hasUserId: true,
            hasCurrentOrganizationId: true,
            hasDocumentOrganizationId: true,
            hasMembership: true,
            selectedQuestionItemCount: questionItemIds.length,
            safeGraphqlMessage: linkResult.safeGraphqlMessage,
          },
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
        return documentLinksError("invalid_unlink_payload", "validation", 400, {
          hasUserId: true,
          hasCurrentOrganizationId: true,
          hasMembership: true,
        });
      }

      const answerScopeResult = await executeDocumentLinksAdminGraphql<{
        question_answers_by_pk: AnswerScope | null;
      }>({
        operationName: "GetAnswerForUnlink",
        query: `
          query GetAnswerForUnlink($questionAnswerId: uuid!) {
            question_answers_by_pk(id: $questionAnswerId) {
              id
              organization_id
              question_item_id
            }
          }
        `,
        variables: { questionAnswerId },
      });

      if (!answerScopeResult.ok) {
        return documentLinksError(
          "question_answer_lookup_graphql_error",
          "scope_check",
          502,
          {
            hasUserId: true,
            hasCurrentOrganizationId: true,
            hasMembership: true,
            safeGraphqlMessage: answerScopeResult.safeGraphqlMessage,
          },
        );
      }

      const questionItemId = answerScopeResult.data.question_answers_by_pk?.question_item_id;

      if (!questionItemId) {
        return documentLinksError("question_answer_not_found", "scope_check", 404, {
          hasUserId: true,
          hasCurrentOrganizationId: true,
          hasMembership: true,
          answerOrganizationMatches: false,
        });
      }

      const scopeResult = await verifyDocumentAndAnswersScope(organizationId, documentId, [
        questionItemId,
      ]);

      if (!scopeResult.ok) {
        return documentLinksError(
          scopeResult.category,
          scopeResult.stage,
          scopeResult.status,
          scopeResult.metadata,
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
          {
            hasUserId: true,
            hasCurrentOrganizationId: true,
            hasMembership: true,
            safeGraphqlMessage: unlinkResult.safeGraphqlMessage,
          },
        );
      }
    }

    const linksResult = await loadDocumentLinksForOrganization(organizationId);

    if (!linksResult.ok) {
      return documentLinksError(
        "document_links_lookup_graphql_error",
        "links_lookup",
        502,
        {
          hasUserId: true,
          hasCurrentOrganizationId: true,
          hasMembership: true,
          safeGraphqlMessage: linksResult.safeGraphqlMessage,
        },
      );
    }

    return NextResponse.json({
      configured: true,
      ok: true,
      linkedCount: linksResult.links.length,
      links: linksResult.links,
    });
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

async function loadDocumentLinksForOrganization(
  organizationId: string,
): Promise<
  | { ok: true; links: EnrichedDocumentLinkRecord[] }
  | { ok: false; safeGraphqlMessage: string }
> {
  const documentIdsResult = await executeDocumentLinksAdminGraphql<{
    documents: Array<{ id: string }>;
  }>({
    operationName: "GetDocumentLinkDocumentIds",
    query: getDocumentLinkDocumentIdsQuery,
    variables: { organizationId },
  });

  if (!documentIdsResult.ok) {
    return documentIdsResult;
  }

  const documentIds = documentIdsResult.data.documents.map((document) => document.id);

  if (!documentIds.length) {
    return { ok: true, links: [] };
  }

  const dataResult = await executeDocumentLinksAdminGraphql<{
    documents: DocumentLinkDocumentRecord[];
    question_answers: DocumentLinkAnswerRecord[];
    question_items: DocumentLinkQuestionItemRecord[];
    question_sections: DocumentLinkQuestionSectionRecord[];
    document_links: DocumentLinkRecord[];
  }>({
    operationName: "GetDocumentLinksData",
    query: getDocumentLinksDataQuery,
    variables: { organizationId, documentIds },
  });

  if (!dataResult.ok) {
    return dataResult;
  }

  const documentMap = new Map(dataResult.data.documents.map((document) => [document.id, document]));
  const answerMap = new Map(dataResult.data.question_answers.map((answer) => [answer.id, answer]));
  const questionItemMap = new Map(dataResult.data.question_items.map((item) => [item.id, item]));
  const sectionMap = new Map(dataResult.data.question_sections.map((section) => [section.id, section]));

  return {
    ok: true,
    links: dataResult.data.document_links.map((link) => {
      const answer = answerMap.get(link.question_answer_id);
      const questionItem = answer ? questionItemMap.get(answer.question_item_id) : null;
      const questionSection = questionItem ? sectionMap.get(questionItem.section_id) : null;

      return {
        ...link,
        document: documentMap.get(link.document_id) ?? null,
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
    }),
  };
}

async function verifyDocumentAndAnswersScope(
  organizationId: string,
  documentId: string,
  questionItemIds: string[],
): Promise<
  | { ok: true; document: DocumentScope; questionItems: QuestionItemScope[]; answers: AnswerScope[] }
  | { ok: false; category: string; stage: string; status: number; metadata: DocumentLinksErrorMetadata }
> {
  const scopeResult = await executeDocumentLinksAdminGraphql<{
    documents_by_pk: DocumentScope | null;
    question_items: QuestionItemScope[];
    question_answers: AnswerScope[];
  }>({
    operationName: "VerifyDocumentLinkScope",
    query: verifyDocumentLinkScopeQuery,
    variables: { organizationId, documentId, questionItemIds },
  });

  if (!scopeResult.ok) {
    return {
      ok: false,
      category: "document_link_scope_graphql_error",
      stage: "scope_check",
      status: 502,
      metadata: {
        hasUserId: true,
        hasCurrentOrganizationId: true,
        hasMembership: true,
        selectedQuestionItemCount: questionItemIds.length,
        safeGraphqlMessage: scopeResult.safeGraphqlMessage,
      },
    };
  }

  const document = scopeResult.data.documents_by_pk;

  if (!document) {
    return {
      ok: false,
      category: "document_not_found",
      stage: "scope_check",
      status: 404,
      metadata: {
        hasUserId: true,
        hasCurrentOrganizationId: true,
        hasDocumentOrganizationId: false,
        hasMembership: true,
        documentBelongsToCurrentOrganization: false,
        selectedQuestionItemCount: questionItemIds.length,
        foundQuestionItemCount: scopeResult.data.question_items.length,
        answerOrganizationMatches: scopeResult.data.question_answers.every(
          (answer) => answer.organization_id === organizationId,
        ),
      },
    };
  }

  const documentBelongsToCurrentOrganization = document.organization_id === organizationId;

  if (!documentBelongsToCurrentOrganization) {
    return {
      ok: false,
      category: "organization_scope_mismatch",
      stage: "scope_check",
      status: 403,
      metadata: {
        hasUserId: true,
        hasCurrentOrganizationId: true,
        hasDocumentOrganizationId: Boolean(document.organization_id),
        hasMembership: true,
        documentBelongsToCurrentOrganization,
        selectedQuestionItemCount: questionItemIds.length,
        foundQuestionItemCount: scopeResult.data.question_items.length,
        answerOrganizationMatches: scopeResult.data.question_answers.every(
          (answer) => answer.organization_id === organizationId,
        ),
      },
    };
  }

  if (scopeResult.data.question_items.length !== questionItemIds.length) {
    return {
      ok: false,
      category: "question_item_not_found",
      stage: "scope_check",
      status: 404,
      metadata: {
        hasUserId: true,
        hasCurrentOrganizationId: true,
        hasDocumentOrganizationId: true,
        hasMembership: true,
        documentBelongsToCurrentOrganization,
        selectedQuestionItemCount: questionItemIds.length,
        foundQuestionItemCount: scopeResult.data.question_items.length,
        answerOrganizationMatches: scopeResult.data.question_answers.every(
          (answer) => answer.organization_id === organizationId,
        ),
      },
    };
  }

  return {
    ok: true,
    document,
    questionItems: scopeResult.data.question_items,
    answers: scopeResult.data.question_answers,
  };
}

async function ensureQuestionAnswersForItems(
  organizationId: string,
  questionItemIds: string[],
  existingAnswers: AnswerScope[],
): Promise<
  | { ok: true; questionAnswerIds: string[] }
  | { ok: false; safeGraphqlMessage: string }
> {
  const answersByQuestionItem = new Map(
    existingAnswers.map((answer) => [answer.question_item_id, answer]),
  );
  const missingQuestionItemIds = questionItemIds.filter(
    (questionItemId) => !answersByQuestionItem.has(questionItemId),
  );

  if (!missingQuestionItemIds.length) {
    return resolveEnsuredQuestionAnswerIds(questionItemIds, answersByQuestionItem);
  }

  const createResult = await executeDocumentLinksAdminGraphql<{
    insert_question_answers: { returning: AnswerScope[] } | null;
  }>({
    operationName: "CreateMissingQuestionAnswers",
    query: createMissingAnswersMutation,
    variables: {
      objects: missingQuestionItemIds.map((questionItemId) => ({
        organization_id: organizationId,
        question_item_id: questionItemId,
        status: "not_started",
        value: null,
      })),
    },
  });

  if (!createResult.ok) {
    return { ok: false, safeGraphqlMessage: createResult.safeGraphqlMessage };
  }

  for (const answer of createResult.data.insert_question_answers?.returning ?? []) {
    answersByQuestionItem.set(answer.question_item_id, answer);
  }

  return resolveEnsuredQuestionAnswerIds(questionItemIds, answersByQuestionItem);
}

function resolveEnsuredQuestionAnswerIds(
  questionItemIds: string[],
  answersByQuestionItem: Map<string, AnswerScope>,
) {
  const questionAnswerIds = questionItemIds
    .map((questionItemId) => answersByQuestionItem.get(questionItemId)?.id)
    .filter(isString);

  if (questionAnswerIds.length !== questionItemIds.length) {
    return {
      ok: false,
      safeGraphqlMessage: "Could not resolve questionnaire answer rows for all selected items.",
    } as const;
  }

  return { ok: true, questionAnswerIds } as const;
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
      reason: "graphql_returned_errors",
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
  metadata: DocumentLinksErrorMetadata = {},
) {
  console.warn("document_links_failed", {
    category,
    stage,
    hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
    hasUserId: metadata.hasUserId ?? false,
    hasCurrentOrganizationId: metadata.hasCurrentOrganizationId ?? false,
    hasDocumentOrganizationId: metadata.hasDocumentOrganizationId ?? false,
    hasMembership: metadata.hasMembership ?? false,
    hasDocumentId: metadata.hasDocumentId,
    hasQuestionItemIds: metadata.hasQuestionItemIds,
    firstSelectedQuestionItemIdPresent: metadata.firstSelectedQuestionItemIdPresent,
    documentBelongsToCurrentOrganization: metadata.documentBelongsToCurrentOrganization,
    selectedQuestionItemCount: metadata.selectedQuestionItemCount,
    foundQuestionItemCount: metadata.foundQuestionItemCount,
    answerOrganizationMatches: metadata.answerOrganizationMatches,
  });

  return NextResponse.json(
    {
      error: "We could not update evidence links right now. Please try again.",
      category,
      stage,
      hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
      hasUserId: metadata.hasUserId ?? false,
      hasCurrentOrganizationId: metadata.hasCurrentOrganizationId ?? false,
      hasDocumentOrganizationId: metadata.hasDocumentOrganizationId ?? false,
      hasMembership: metadata.hasMembership ?? false,
      hasDocumentId: metadata.hasDocumentId,
      hasQuestionItemIds: metadata.hasQuestionItemIds,
      firstSelectedQuestionItemIdPresent: metadata.firstSelectedQuestionItemIdPresent,
      documentBelongsToCurrentOrganization: metadata.documentBelongsToCurrentOrganization,
      selectedQuestionItemCount: metadata.selectedQuestionItemCount,
      foundQuestionItemCount: metadata.foundQuestionItemCount,
      answerOrganizationMatches: metadata.answerOrganizationMatches,
    },
    { status },
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readIdArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
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

function isString(value: unknown): value is string {
  return typeof value === "string";
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
