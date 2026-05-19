import { NextResponse } from "next/server";
import {
  type BuyerRequest,
  type BuyerRequestInput,
  type BuyerRequestResponsePackage,
  type BuyerRequestSectionReadiness,
  normalizeBuyerRequestRecord,
} from "@/lib/buyer-requests";
import {
  buyerRequestError,
  executeAdminGraphql,
  resolveOrganizationForRequest,
  validateBuyerRequestInput,
} from "@/app/api/buyer-requests/route";

type BuyerRequestRouteProps = {
  params: Promise<{ id: string }>;
};

type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
  sort_order: number;
};

type QuestionItemRecord = {
  id: string;
  section_id: string;
  evidence_required: boolean;
};

type DocumentRecord = {
  id: string;
  document_type: string;
  expires_at: string | null;
};

type QuestionAnswerRecord = {
  id: string;
  question_item_id: string;
  status: string;
};

const writableRoles = new Set(["owner", "editor", "admin"]);

const getBuyerRequestQuery = `
  query GetBuyerRequest($id: uuid!, $organizationId: uuid!) {
    buyer_requests(
      where: { id: { _eq: $id }, organization_id: { _eq: $organizationId } }
      limit: 1
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

const updateBuyerRequestMutation = `
  mutation UpdateBuyerRequest($id: uuid!, $organizationId: uuid!, $set: buyer_requests_set_input!) {
    update_buyer_requests(
      where: { id: { _eq: $id }, organization_id: { _eq: $organizationId } }
      _set: $set
    ) {
      returning {
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
  }
`;

const readinessQuery = `
  query GetBuyerRequestReadiness($organizationId: uuid!, $documentIds: [uuid!], $now: timestamptz!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
      sort_order
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      evidence_required
    }
    question_answers(where: { organization_id: { _eq: $organizationId } }) {
      id
      question_item_id
      status
    }
    documents(where: { organization_id: { _eq: $organizationId } }) {
      id
      document_type
      expires_at
    }
    document_links(where: { document_id: { _in: $documentIds } }) {
      document_id
      question_answer_id
    }
    organizations_by_pk(id: $organizationId) {
      name
    }
    share_links(
      where: {
        organization_id: { _eq: $organizationId }
        is_active: { _eq: true }
        _or: [{ expires_at: { _is_null: true } }, { expires_at: { _gt: $now } }]
      }
      limit: 1
    ) {
      id
      token
    }
  }
`;

export async function GET(request: Request, { params }: BuyerRequestRouteProps) {
  const { id } = await params;
  const organizationResult = await resolveOrganizationForRequest(request);

  if (!organizationResult.ok) {
    return buyerRequestError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      organizationResult,
    );
  }

  const requestResult = await loadBuyerRequest(id, organizationResult.organizationId);

  if (!requestResult.ok) {
    return buyerRequestError("buyer_request_lookup_graphql_error", "lookup", 502, {
      hasUserId: true,
      safeGraphqlMessage: requestResult.safeGraphqlMessage,
    });
  }

  const buyerRequest = requestResult.data.buyer_requests[0];

  if (!buyerRequest) {
    return buyerRequestError("buyer_request_not_found", "lookup", 404, { hasUserId: true });
  }

  const normalizedRequest = normalizeBuyerRequestRecord(buyerRequest);
  const readiness = await loadResponseWorkspaceData(
    organizationResult.organizationId,
    normalizedRequest,
  );

  return NextResponse.json({
    ok: true,
    request: normalizedRequest,
    sectionReadiness: readiness.sectionReadiness,
    responsePackage: readiness.responsePackage,
  });
}

export async function PATCH(request: Request, { params }: BuyerRequestRouteProps) {
  const { id } = await params;
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
    return buyerRequestError("permission_denied", "membership_lookup", 403, { hasUserId: true });
  }

  const payload = (await readJson(request)) as BuyerRequestInput | null;
  const validation = validateBuyerRequestInput(payload, "update");

  if (!validation.ok) {
    return buyerRequestError(validation.category, "validation", 400, { hasUserId: true });
  }

  const set: Record<string, unknown> = {};

  if (payload && "buyerName" in payload) {
    set.buyer_name = validation.value.buyer_name;
  }
  if (payload && "buyerContactName" in payload) {
    set.buyer_contact_name = validation.value.buyer_contact_name;
  }
  if (payload && "buyerContactEmail" in payload) {
    set.buyer_contact_email = validation.value.buyer_contact_email;
  }
  if (payload && "requestTitle" in payload) {
    set.request_title = validation.value.request_title;
  }
  if (payload && "requestDescription" in payload) {
    set.request_description = validation.value.request_description;
  }
  if (payload && "dueDate" in payload) {
    set.due_date = validation.value.due_date;
  }
  if (payload && "status" in payload) {
    set.status = validation.value.status;
  }
  if (payload && "requestedSections" in payload) {
    set.requested_sections = validation.value.requested_sections;
  }
  if (payload && "notes" in payload) {
    set.notes = validation.value.notes;
  }

  if (!Object.keys(set).length) {
    return buyerRequestError("invalid_buyer_request_payload", "validation", 400, {
      hasUserId: true,
    });
  }

  const updateResult = await executeAdminGraphql<{
    update_buyer_requests: { returning: BuyerRequest[] };
  }>({
    operationName: "UpdateBuyerRequest",
    query: updateBuyerRequestMutation,
    variables: {
      id,
      organizationId: organizationResult.organizationId,
      set,
    },
  });

  if (!updateResult.ok) {
    return buyerRequestError("buyer_request_update_graphql_error", "update", 502, {
      hasUserId: true,
      safeGraphqlMessage: updateResult.safeGraphqlMessage,
    });
  }

  const updated = updateResult.data.update_buyer_requests.returning[0];

  if (!updated) {
    return buyerRequestError("buyer_request_not_found", "update", 404, { hasUserId: true });
  }

  const normalizedRequest = normalizeBuyerRequestRecord(updated);
  const readiness = await loadResponseWorkspaceData(
    organizationResult.organizationId,
    normalizedRequest,
  );

  return NextResponse.json({
    ok: true,
    request: normalizedRequest,
    sectionReadiness: readiness.sectionReadiness,
    responsePackage: readiness.responsePackage,
  });
}

async function loadBuyerRequest(id: string, organizationId: string) {
  return executeAdminGraphql<{ buyer_requests: BuyerRequest[] }>({
    operationName: "GetBuyerRequest",
    query: getBuyerRequestQuery,
    variables: { id, organizationId },
  });
}

async function loadResponseWorkspaceData(
  organizationId: string,
  buyerRequest: BuyerRequest,
): Promise<{
  sectionReadiness: BuyerRequestSectionReadiness[];
  responsePackage: BuyerRequestResponsePackage;
}> {
  const documentIdsResult = await executeAdminGraphql<{ documents: Array<{ id: string }> }>({
    operationName: "GetBuyerRequestDocumentIds",
    query: `
      query GetBuyerRequestDocumentIds($organizationId: uuid!) {
        documents(where: { organization_id: { _eq: $organizationId } }) {
          id
        }
      }
    `,
    variables: { organizationId },
  });

  const documentIds = documentIdsResult.ok
    ? documentIdsResult.data.documents.map((document) => document.id)
    : [];

  const result = await executeAdminGraphql<{
    question_sections: QuestionSectionRecord[];
    question_items: QuestionItemRecord[];
    question_answers: QuestionAnswerRecord[];
    documents: DocumentRecord[];
    document_links: Array<{ document_id: string; question_answer_id: string }>;
    organizations_by_pk: { name: string | null } | null;
    share_links: Array<{ id: string; token: string }>;
  }>({
    operationName: "GetBuyerRequestReadiness",
    query: readinessQuery,
    variables: { organizationId, documentIds, now: new Date().toISOString() },
  });

  if (!result.ok) {
    return {
      sectionReadiness: [],
      responsePackage: {
        hasActiveShareLink: false,
        publicPassportPath: null,
        organizationName: null,
        uploadedDocumentCount: 0,
        linkedEvidenceCount: 0,
        expiredCertificateCount: 0,
        expiringSoonCertificateCount: 0,
      },
    };
  }

  const requested = new Set(buyerRequest.requested_sections);
  const documentById = new Map(result.data.documents.map((document) => [document.id, document]));
  const answerByQuestionItem = new Map(
    result.data.question_answers.map((answer) => [answer.question_item_id, answer]),
  );
  const certificateExpiry = calculateCertificateExpiry(result.data.documents);
  const activeShareLink = result.data.share_links[0] ?? null;

  const sectionReadiness = result.data.question_sections
    .filter((section) => requested.size === 0 || requested.has(section.code as BuyerRequest["requested_sections"][number]))
    .map((section) => {
      const items = result.data.question_items.filter((item) => item.section_id === section.id);
      const answers = items
        .map((item) => answerByQuestionItem.get(item.id))
        .filter((answer): answer is QuestionAnswerRecord => Boolean(answer));
      const answeredQuestions = answers.filter((answer) =>
        ["in_progress", "completed", "needs_evidence", "reviewed"].includes(answer.status),
      ).length;
      const evidenceRequired = items.filter((item) => item.evidence_required).length;
      const answerIds = new Set(answers.map((answer) => answer.id));
      const evidenceLinked = result.data.document_links.filter((link) =>
        answerIds.has(link.question_answer_id),
      ).length;
      const isCertifications = section.code === "certifications";

      return {
        code: section.code as BuyerRequestSectionReadiness["code"],
        title: section.title,
        totalQuestions: items.length,
        answeredQuestions,
        completion: items.length ? Math.round((answeredQuestions / items.length) * 100) : 0,
        evidenceRequired,
        evidenceLinked,
        expiredCertificates: isCertifications ? certificateExpiry.expired : 0,
        expiringSoonCertificates: isCertifications ? certificateExpiry.expiringSoon : 0,
      };
    });

  const linkedDocumentIds = new Set(
    result.data.document_links
      .map((link) => documentById.get(link.document_id)?.id)
      .filter((id): id is string => Boolean(id)),
  );

  return {
    sectionReadiness,
    responsePackage: {
      hasActiveShareLink: Boolean(activeShareLink),
      publicPassportPath: activeShareLink
        ? `/passport/${encodeURIComponent(activeShareLink.token)}`
        : null,
      organizationName: result.data.organizations_by_pk?.name ?? null,
      uploadedDocumentCount: result.data.documents.length,
      linkedEvidenceCount: linkedDocumentIds.size,
      expiredCertificateCount: certificateExpiry.expired,
      expiringSoonCertificateCount: certificateExpiry.expiringSoon,
    },
  };
}

function calculateCertificateExpiry(documents: DocumentRecord[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const ninetyDaysFromNow = new Date(startOfToday);
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  return documents.reduce(
    (summary, document) => {
      if (document.document_type !== "certificate" || !document.expires_at) {
        return summary;
      }

      const expiry = new Date(document.expires_at);

      if (Number.isNaN(expiry.getTime())) {
        return summary;
      }

      if (expiry < startOfToday) {
        summary.expired += 1;
      } else if (expiry <= ninetyDaysFromNow) {
        summary.expiringSoon += 1;
      }

      return summary;
    },
    { expired: 0, expiringSoon: 0 },
  );
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
