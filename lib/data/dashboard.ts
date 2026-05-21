import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";

type DashboardQuestionSection = {
  id: string;
  code: string;
  title: string;
  sort_order: number;
};

type DashboardQuestionItem = {
  id: string;
  section_id: string;
};

type DashboardQuestionAnswer = {
  id: string;
  question_item_id: string;
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

type DashboardSetupDataResponse = {
  question_sections: DashboardQuestionSection[];
  question_items: DashboardQuestionItem[];
  question_answers: DashboardQuestionAnswer[];
  documents: DashboardDocument[];
  share_links: DashboardShareLink[];
  supplier_passports: DashboardSupplierPassport[];
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

export type DashboardSetupSummary = {
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
  lastUpdated: string | null;
  sectionProgress: DashboardSectionProgress[];
  missingSections: DashboardSectionProgress[];
  recentUploads: DashboardRecentUploadSummary[];
  activeShareLinks: DashboardActiveShareLinkSummary[];
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
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      question_item_id
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

  const completeAnswerQuestionIds = new Set(
    data.question_answers
      .filter((answer) => isAnswerComplete(answer.status))
      .map((answer) => answer.question_item_id),
  );
  const questionsBySection = new Map<string, DashboardQuestionItem[]>();

  data.question_items.forEach((question) => {
    const questions = questionsBySection.get(question.section_id) ?? [];
    questions.push(question);
    questionsBySection.set(question.section_id, questions);
  });

  const sectionProgress = data.question_sections.map((section) => {
    const questions = questionsBySection.get(section.id) ?? [];
    const completed = questions.filter((question) => completeAnswerQuestionIds.has(question.id)).length;
    const total = questions.length;
    const percent = calculatePercent(completed, total);

    return {
      code: section.code,
      title: section.title,
      completed,
      total,
      percent,
      missing: Math.max(total - completed, 0),
    };
  });
  const answeredQuestions = completeAnswerQuestionIds.size;
  const totalQuestions = data.question_items.length;
  const missingSections = sectionProgress.filter((section) => section.missing > 0);
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
    organizationName: organization.name,
    answeredQuestions,
    totalQuestions,
    questionnairePercent: calculatePercent(answeredQuestions, totalQuestions),
    documentsCount: data.documents.length,
    linkedEvidenceCount: links.document_links.length,
    activeShareLinkCount: activeShareLinks.length,
    pdfAvailable: totalQuestions > 0,
    readinessPercent: calculatePercent(answeredQuestions, totalQuestions),
    missingItemsCount: missingSections.reduce((sum, section) => sum + section.missing, 0),
    lastUpdated,
    sectionProgress,
    missingSections: missingSections.slice(0, 5),
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
    recentActivity: createRecentActivity({
      answeredQuestions,
      documentsCount: data.documents.length,
      linkedEvidenceCount: links.document_links.length,
      activeShareLinkCount: activeShareLinks.length,
    }),
    source: "live",
  };
}

function isAnswerComplete(status: string | null) {
  return status === "answered" || status === "completed" || status === "reviewed";
}

function calculatePercent(completed: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
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
