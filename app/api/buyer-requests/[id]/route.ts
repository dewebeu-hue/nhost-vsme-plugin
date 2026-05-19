import { NextResponse } from "next/server";
import {
  type BuyerRequest,
  type BuyerRequestInput,
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
  query GetBuyerRequestReadiness($organizationId: uuid!, $documentIds: [uuid!]) {
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
    }
    document_links(where: { document_id: { _in: $documentIds } }) {
      question_answer_id
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
  const readiness = await loadSectionReadiness(
    organizationResult.organizationId,
    normalizedRequest,
  );

  return NextResponse.json({
    ok: true,
    request: normalizedRequest,
    sectionReadiness: readiness,
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
  const readiness = await loadSectionReadiness(
    organizationResult.organizationId,
    normalizedRequest,
  );

  return NextResponse.json({
    ok: true,
    request: normalizedRequest,
    sectionReadiness: readiness,
  });
}

async function loadBuyerRequest(id: string, organizationId: string) {
  return executeAdminGraphql<{ buyer_requests: BuyerRequest[] }>({
    operationName: "GetBuyerRequest",
    query: getBuyerRequestQuery,
    variables: { id, organizationId },
  });
}

async function loadSectionReadiness(
  organizationId: string,
  buyerRequest: BuyerRequest,
): Promise<BuyerRequestSectionReadiness[]> {
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
    documents: Array<{ id: string }>;
    document_links: Array<{ question_answer_id: string }>;
  }>({
    operationName: "GetBuyerRequestReadiness",
    query: readinessQuery,
    variables: { organizationId, documentIds },
  });

  if (!result.ok) {
    return [];
  }

  const requested = new Set(buyerRequest.requested_sections);
  const answerByQuestionItem = new Map(
    result.data.question_answers.map((answer) => [answer.question_item_id, answer]),
  );
  const linkedAnswerIds = new Set(
    result.data.document_links.map((link) => link.question_answer_id),
  );

  return result.data.question_sections
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
      const evidenceLinked = answers.filter((answer) => linkedAnswerIds.has(answer.id)).length;

      return {
        code: section.code as BuyerRequestSectionReadiness["code"],
        title: section.title,
        totalQuestions: items.length,
        answeredQuestions,
        completion: items.length ? Math.round((answeredQuestions / items.length) * 100) : 0,
        evidenceRequired,
        evidenceLinked,
      };
    });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
