import { NextResponse } from "next/server";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";
import type { GraphqlJson } from "@/lib/data/questionnaire";
import type { QuestionAnswerStatus } from "@/lib/types";

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type QuestionItemRecord = {
  id: string;
  section_id: string;
  code: string;
  title: string;
  help_text: string | null;
  answer_type:
    | "text"
    | "number"
    | "boolean"
    | "select"
    | "date"
    | "multi_select"
    | "textarea";
  unit: string | null;
  options: GraphqlJson;
  evidence_required: boolean;
  questionnaire_level: "basic" | "full";
  sort_order: number;
};

type QuestionAnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  value: GraphqlJson;
  status: QuestionAnswerStatus;
  internal_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type LiveDocument = {
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

type DocumentLink = {
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

type SaveAnswerPayload = {
  answers?: unknown;
};

type AnswerInput = {
  questionItemId: string;
  value: GraphqlJson;
  status: QuestionAnswerStatus;
  internalNote?: string;
};

const allowedStatuses: QuestionAnswerStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "needs_evidence",
  "reviewed",
];

const getMembershipQuery = `
  query GetQuestionnaireMembership($userId: uuid!) {
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

const getQuestionnaireDataQuery = `
  query GetQuestionnaireData($organizationId: uuid!, $documentIds: [uuid!]!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
      description
      sort_order
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      code
      title
      help_text
      answer_type
      unit
      options
      evidence_required
      questionnaire_level
      sort_order
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      organization_id
      question_item_id
      value
      status
      internal_note
      reviewed_by
      reviewed_at
      created_at
      updated_at
    }
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

const getDocumentsForLinksQuery = `
  query GetQuestionnaireDocuments($organizationId: uuid!) {
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
  }
`;

const upsertQuestionAnswersMutation = `
  mutation UpsertQuestionnaireAnswers($objects: [question_answers_insert_input!]!) {
    insert_question_answers(
      objects: $objects
      on_conflict: {
        constraint: question_answers_organization_id_question_item_id_key
        update_columns: [value, status, internal_note]
      }
    ) {
      returning {
        id
        organization_id
        question_item_id
        value
        status
        internal_note
        reviewed_by
        reviewed_at
        created_at
        updated_at
      }
    }
  }
`;

export async function GET(request: Request) {
  logSafeDiagnostic("questionnaire_load_start");

  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return questionnaireError(tokenResult.category, "auth", 401);
  }

  const organizationResult = await resolveOrganizationIdForRequest(tokenResult.token);

  if (!organizationResult.ok) {
    return questionnaireError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      {
        hasUserId: organizationResult.hasUserId,
        organizationIdResolved: false,
        membershipCount: organizationResult.membershipCount,
      },
    );
  }

  const url = new URL(request.url);
  const requestedSectionCode = url.searchParams.get("sectionCode")?.trim() || "energy";

  logSafeDiagnostic("organization_id_resolved", {
    organizationIdResolved: true,
  });

  const documentsResult = await executeQuestionnaireAdminGraphql<{
    documents: LiveDocument[];
  }>({
    operationName: "GetQuestionnaireDocuments",
    query: getDocumentsForLinksQuery,
    variables: { organizationId: organizationResult.organizationId },
  });

  if (!documentsResult.ok) {
    return questionnaireError("questionnaire_lookup_graphql_error", "questionnaire_lookup", 502, {
      hasUserId: true,
      organizationIdResolved: true,
      membershipCount: 1,
      safeGraphqlMessage: documentsResult.safeGraphqlMessage,
    });
  }

  const documentIds = documentsResult.data.documents.map((document) => document.id);
  const dataResult = await executeQuestionnaireAdminGraphql<{
    question_sections: QuestionSectionRecord[];
    question_items: QuestionItemRecord[];
    question_answers: QuestionAnswerRecord[];
    documents: LiveDocument[];
    document_links: DocumentLink[];
  }>({
    operationName: "GetQuestionnaireData",
    query: getQuestionnaireDataQuery,
    variables: {
      organizationId: organizationResult.organizationId,
      documentIds,
    },
  });

  if (!dataResult.ok) {
    return questionnaireError("questionnaire_lookup_graphql_error", "questionnaire_lookup", 502, {
      hasUserId: true,
      organizationIdResolved: true,
      membershipCount: 1,
      safeGraphqlMessage: dataResult.safeGraphqlMessage,
    });
  }

  const sections = dataResult.data.question_sections;
  const items = dataResult.data.question_items;
  const answers = dataResult.data.question_answers;
  const documents = dataResult.data.documents;
  const documentMap = new Map(documents.map((document) => [document.id, document]));
  const documentLinks = dataResult.data.document_links.map((link) => ({
    ...link,
    document: documentMap.get(link.document_id) ?? null,
  }));
  const activeSection =
    sections.find((section) => section.code === requestedSectionCode) ?? sections[0];
  const activeSectionCode = activeSection?.code ?? requestedSectionCode;
  const questions = activeSection
    ? items.filter((item) => item.section_id === activeSection.id)
    : items;

  logSafeDiagnostic("questionnaire_load_success", {
    sectionsCount: sections.length,
    itemsCount: items.length,
    answersCount: answers.length,
  });

  return NextResponse.json({
    configured: true,
    organization: {
      id: organizationResult.organizationId,
    },
    organizationId: organizationResult.organizationId,
    activeSectionCode,
    sections,
    items,
    questions,
    answers,
    documents,
    documentLinks,
    isMock: false,
  });
}

export async function POST(request: Request) {
  logSafeDiagnostic("questionnaire_save_start");

  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return questionnaireError(tokenResult.category, "auth", 401);
  }

  const organizationResult = await resolveOrganizationIdForRequest(tokenResult.token);

  if (!organizationResult.ok) {
    return questionnaireError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      {
        hasUserId: organizationResult.hasUserId,
        organizationIdResolved: false,
        membershipCount: organizationResult.membershipCount,
      },
    );
  }

  let payload: SaveAnswerPayload;

  try {
    payload = (await request.json()) as SaveAnswerPayload;
  } catch {
    return questionnaireError("unknown_questionnaire_error", "request_parse", 400);
  }

  const answers = parseAnswers(payload.answers);

  logSafeDiagnostic("answers_to_save", {
    count: answers.length,
  });

  if (!answers.length) {
    return NextResponse.json({ saved: [] });
  }

  const objects = answers.map((answer) => ({
    organization_id: organizationResult.organizationId,
    question_item_id: answer.questionItemId,
    value: answer.value,
    status: answer.status === "reviewed" ? "completed" : answer.status,
    internal_note: answer.internalNote ?? null,
  }));

  const saveResult = await executeQuestionnaireAdminGraphql<{
    insert_question_answers: {
      returning: QuestionAnswerRecord[];
    } | null;
  }>({
    operationName: "UpsertQuestionnaireAnswers",
    query: upsertQuestionAnswersMutation,
    variables: { objects },
  });

  if (!saveResult.ok) {
    return questionnaireError("answer_upsert_graphql_error", "answer_upsert", 502, {
      hasUserId: true,
      organizationIdResolved: true,
      membershipCount: 1,
      safeGraphqlMessage: saveResult.safeGraphqlMessage,
    });
  }

  return NextResponse.json({
    saved: saveResult.data.insert_question_answers?.returning ?? [],
    organizationId: organizationResult.organizationId,
  });
}

type OrganizationResolutionResult =
  | {
      ok: true;
      userId: string;
      organizationId: string;
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

  logSafeDiagnostic("user_id_resolved", {
    userIdResolved: userResult.ok,
  });

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

  const membershipResult = await executeQuestionnaireAdminGraphql<{
    organization_members: Membership[];
  }>({
    operationName: "GetQuestionnaireMembership",
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
  const membershipCount = membershipResult.data.organization_members.length;

  if (!membership) {
    return {
      ok: false,
      category: "membership_not_found",
      stage: "membership_lookup",
      status: 404,
      hasUserId: true,
      membershipCount,
    };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organizationId: membership.organization_id,
  };
}

function questionnaireError(
  category: string,
  stage: string,
  status: number,
  metadata: {
    hasUserId?: boolean;
    organizationIdResolved?: boolean;
    membershipCount?: number;
    safeGraphqlMessage?: string;
  } = {},
) {
  logSafeDiagnostic("questionnaire_load_failed", {
    category,
    stage,
    hasUserId: metadata.hasUserId ?? false,
    organizationIdResolved: metadata.organizationIdResolved ?? false,
    membershipCount: metadata.membershipCount ?? 0,
    message: metadata.safeGraphqlMessage,
  });

  return NextResponse.json(
    {
      error: "We could not load live questionnaire data.",
      category,
      stage,
      hasAdminSecret: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
      hasUserId: metadata.hasUserId ?? false,
      organizationIdResolved: metadata.organizationIdResolved ?? false,
      membershipCount: metadata.membershipCount ?? 0,
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

async function executeQuestionnaireAdminGraphql<TData>({
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
    console.error("Questionnaire admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Questionnaire admin GraphQL returned errors", {
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

function parseAnswers(value: unknown): AnswerInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): AnswerInput[] => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const questionItemId = readString(record.questionItemId);
    const status = readStatus(record.status);

    if (!isUuid(questionItemId) || !status || !isGraphqlJson(record.value)) {
      return [];
    }

    const internalNote = readString(record.internalNote);

    return [
      {
        questionItemId,
        value: record.value,
        status,
        internalNote: internalNote || undefined,
      },
    ];
  });
}

function readStatus(value: unknown): QuestionAnswerStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  return allowedStatuses.includes(value as QuestionAnswerStatus)
    ? (value as QuestionAnswerStatus)
    : null;
}

function isGraphqlJson(value: unknown): value is GraphqlJson {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isGraphqlJson);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isGraphqlJson);
  }

  return false;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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
