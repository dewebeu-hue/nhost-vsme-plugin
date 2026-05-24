import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import { getPrimaryOrganizationForUserWithAdmin, type OrganizationBasics } from "@/lib/data/organizations";
import type { GraphqlJson } from "@/lib/data/questionnaire";
import { doesAnswerRequireEvidence } from "@/lib/evidence-requirements";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";
import {
  calculateOverallCompletion,
  calculateSectionCompletion,
} from "@/lib/questionnaire-completion";

type DashboardQuestionSection = {
  id: string;
  code: string;
  title: string;
  sort_order: number;
};

type DashboardQuestionItem = {
  id: string;
  section_id: string;
  answer_type: string;
  evidence_required: boolean;
};

type DashboardQuestionAnswer = {
  id: string;
  question_item_id: string;
  value: GraphqlJson;
  status: string | null;
  updated_at: string | null;
};

type DashboardDocument = {
  id: string;
  file_name: string;
  document_type: string | null;
  created_at: string | null;
};

type DashboardShareLink = {
  id: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string | null;
};

type DashboardSupplierPassport = {
  id: string;
  updated_at: string | null;
  generated_at: string | null;
};

type DashboardBuyerRequest = {
  id: string;
  buyer_name: string;
  request_title: string;
  due_date: string | null;
  status: string;
  updated_at: string | null;
  created_at: string | null;
};

type DashboardSetupDataResponse = {
  question_sections: DashboardQuestionSection[];
  question_items: DashboardQuestionItem[];
  question_answers: DashboardQuestionAnswer[];
  documents: DashboardDocument[];
  share_links: DashboardShareLink[];
  supplier_passports: DashboardSupplierPassport[];
  buyer_requests: DashboardBuyerRequest[];
};

type DashboardDocumentLinksResponse = {
  document_links: Array<{
    id: string;
    document_id: string;
    question_answer_id: string;
    created_at: string | null;
  }>;
};

export type DashboardSectionProgress = {
  code: string;
  title: string;
  completed: number;
  total: number;
  percent: number;
  missing: number;
  evidenceRequiredMissing: number;
};

export type DashboardRecentUploadSummary = {
  name: string;
  category: string;
  uploadedAt: string;
};

export type DashboardActiveShareLinkSummary = {
  buyer: string;
  module: string;
  status: "Active";
  expires: string;
};

export type DashboardActivitySummary = {
  kind: "answers" | "documents" | "links" | "share";
  count: number;
};

export type DashboardBuyerRequestSummary = {
  id: string;
  buyer: string;
  module: string;
  status: "In progress" | "Requested" | "Not started" | "Shared" | "Completed";
  dueDate: string | null;
};

export type DashboardSetupSummary = {
  organizationId: string;
  organizationName: string;
  answeredQuestions: number;
  totalQuestions: number;
  questionnairePercent: number;
  documentsCount: number;
  linkedEvidenceCount: number;
  activeShareLinkCount: number;
  pdfAvailable: boolean;
  readinessPercent: number;
  missingItemsCount: number;
  evidenceRequiredCount: number;
  lastUpdated: string | null;
  sectionProgress: DashboardSectionProgress[];
  missingSections: DashboardSectionProgress[];
  recentUploads: DashboardRecentUploadSummary[];
  activeShareLinks: DashboardActiveShareLinkSummary[];
  recentBuyerRequests: DashboardBuyerRequestSummary[];
  recentActivity: DashboardActivitySummary[];
  source: "live" | "unavailable";
};

const dashboardSetupDataQuery = `
  query GetDashboardSetupSummary($organizationId: uuid!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
      sort_order
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      answer_type
      evidence_required
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      question_item_id
      value
      status
      updated_at
    }
    documents(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      file_name
      document_type
      created_at
    }
    share_links(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      is_active
      expires_at
      created_at
    }
    supplier_passports(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ generated_at: desc_nulls_last }, { created_at: desc }]
      limit: 1
    ) {
      id
      generated_at
      updated_at
    }
    buyer_requests(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ updated_at: desc_nulls_last }, { created_at: desc }]
      limit: 5
    ) {
      id
      buyer_name
      request_title
      due_date
      status
      updated_at
      created_at
    }
  }
`;

const dashboardDocumentLinksQuery = `
  query GetDashboardDocumentLinks($documentIds: [uuid!], $questionAnswerIds: [uuid!]) {
    document_links(
      where: {
        document_id: { _in: $documentIds }
        question_answer_id: { _in: $questionAnswerIds }
      }
      order_by: { created_at: desc }
    ) {
      id
      document_id
      question_answer_id
      created_at
    }
  }
`;

export async function getDashboardSetupSummary(): Promise<DashboardSetupSummary | null> {
  if (!getNhostGraphqlUrl()) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const organization = await getPrimaryOrganizationForUserWithAdmin(user.id);

  if (!organization) {
    return null;
  }

  return getDashboardSetupSummaryForOrganization(organization);
}

export async function getDashboardSetupSummaryForOrganization(
  organization: OrganizationBasics,
): Promise<DashboardSetupSummary> {
  const data = await executeHasuraGraphql<DashboardSetupDataResponse>(
    dashboardSetupDataQuery,
    { organizationId: organization.id },
    { useAdminSecret: true },
  );

  const documentIds = data.documents.map((document) => document.id);
  const answerIds = data.question_answers.map((answer) => answer.id);
  const links = documentIds.length && answerIds.length
    ? await executeHasuraGraphql<DashboardDocumentLinksResponse>(
      dashboardDocumentLinksQuery,
      { documentIds, questionAnswerIds: answerIds },
      { useAdminSecret: true },
    )
    : { document_links: [] };

  const answerByQuestionId = new Map(
    data.question_answers.map((answer) => [answer.question_item_id, answer]),
  );
  const linkedEvidenceCountByAnswerId = new Map<string, number>();

  for (const link of links.document_links) {
    linkedEvidenceCountByAnswerId.set(
      link.question_answer_id,
      (linkedEvidenceCountByAnswerId.get(link.question_answer_id) ?? 0) + 1,
    );
  }

  const questionsBySection = new Map<string, DashboardQuestionItem[]>();

  data.question_items.forEach((question) => {
    const questions = questionsBySection.get(question.section_id) ?? [];
    questions.push(question);
    questionsBySection.set(question.section_id, questions);
  });

  const sectionProgress = data.question_sections.map((section) => {
    const completion = calculateSectionCompletion(
      section,
      data.question_items,
      data.question_answers,
    );
    const questions = questionsBySection.get(section.id) ?? [];
    const evidenceRequiredMissing = questions.filter((question) => {
      const answer = answerByQuestionId.get(question.id);

      return Boolean(
        answer &&
          doesAnswerRequireEvidence(question, answer.value) &&
          (linkedEvidenceCountByAnswerId.get(answer.id) ?? 0) === 0,
      );
    }).length;

    return {
      code: section.code,
      title: section.title,
      completed: completion.answeredCount,
      total: completion.totalCount,
      percent: completion.percent,
      missing: Math.max(completion.totalCount - completion.answeredCount, 0),
      evidenceRequiredMissing,
    };
  });
  const overallCompletion = calculateOverallCompletion(
    data.question_sections,
    data.question_items,
    data.question_answers,
  );
  const answeredQuestions = overallCompletion.answeredCount;
  const totalQuestions = overallCompletion.totalCount;
  const missingSections = sectionProgress.filter((section) => section.missing > 0);
  const missingItemsCount = missingSections.reduce((sum, section) => sum + section.missing, 0);
  const evidenceRequiredCount = sectionProgress.reduce(
    (sum, section) => sum + section.evidenceRequiredMissing,
    0,
  );
  const latestAnswerDate = data.question_answers[0]?.updated_at ?? null;
  const latestDocumentDate = data.documents[0]?.created_at ?? null;
  const latestPassportDate =
    data.supplier_passports[0]?.generated_at ?? data.supplier_passports[0]?.updated_at ?? null;
  const lastUpdated = [latestAnswerDate, latestDocumentDate, latestPassportDate]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;
  const activeShareLinks = data.share_links.filter((link) => isShareLinkActive(link));

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    answeredQuestions,
    totalQuestions,
    questionnairePercent: overallCompletion.percent,
    documentsCount: data.documents.length,
    linkedEvidenceCount: links.document_links.length,
    activeShareLinkCount: activeShareLinks.length,
    pdfAvailable: totalQuestions > 0,
    readinessPercent: overallCompletion.percent,
    missingItemsCount,
    evidenceRequiredCount,
    lastUpdated,
    sectionProgress,
    missingSections,
    recentUploads: data.documents.slice(0, 5).map((document) => ({
      name: document.file_name || "Document",
      category: document.document_type || "other",
      uploadedAt: document.created_at ?? "",
    })),
    activeShareLinks: activeShareLinks.map((link) => ({
      buyer: "public_supplier_passport",
      module: "Supplier Passport",
      status: "Active" as const,
      expires: link.expires_at ?? "",
    })),
    recentBuyerRequests: data.buyer_requests.map((request) => ({
      id: request.id,
      buyer: request.buyer_name || "Buyer",
      module: request.request_title || "Buyer request",
      status: mapBuyerRequestStatus(request.status),
      dueDate: request.due_date,
    })),
    recentActivity: createRecentActivity({
      answeredQuestions,
      documentsCount: data.documents.length,
      linkedEvidenceCount: links.document_links.length,
      activeShareLinkCount: activeShareLinks.length,
    }),
    source: "live",
  };
}

function isShareLinkActive(link: DashboardShareLink) {
  if (!link.is_active) {
    return false;
  }

  if (!link.expires_at) {
    return true;
  }

  return new Date(link.expires_at).getTime() > Date.now();
}

function mapBuyerRequestStatus(status: string): DashboardBuyerRequestSummary["status"] {
  if (status === "draft") {
    return "Not started";
  }

  if (status === "shared") {
    return "Shared";
  }

  if (status === "closed") {
    return "Completed";
  }

  if (status === "ready_to_share") {
    return "Requested";
  }

  return "In progress";
}

function createRecentActivity({
  answeredQuestions,
  documentsCount,
  linkedEvidenceCount,
  activeShareLinkCount,
}: {
  answeredQuestions: number;
  documentsCount: number;
  linkedEvidenceCount: number;
  activeShareLinkCount: number;
}) {
  const activity: DashboardActivitySummary[] = [];

  if (answeredQuestions > 0) {
    activity.push({ kind: "answers", count: answeredQuestions });
  }

  if (documentsCount > 0) {
    activity.push({ kind: "documents", count: documentsCount });
  }

  if (linkedEvidenceCount > 0) {
    activity.push({ kind: "links", count: linkedEvidenceCount });
  }

  if (activeShareLinkCount > 0) {
    activity.push({ kind: "share", count: activeShareLinkCount });
  }

  return activity;
}
