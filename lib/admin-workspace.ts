import "server-only";

import { AuthenticationRequiredError, requireCurrentUser, type AuthenticatedUser } from "@/lib/auth/session";
import { executeHasuraGraphql } from "@/lib/graphql/client";

export type AdminTriageStatus = "needs_attention" | "in_progress" | "demo_ready" | "at_risk";
export type AdminRiskSeverity = "critical" | "warning" | "info";
export type ConciergeStatus =
  | "not_started"
  | "onboarding"
  | "waiting_on_supplier"
  | "ready_for_review"
  | "demo_ready"
  | "paused";
export type ConciergePriority = "low" | "normal" | "high";

export type AdminConciergeNote = {
  status: ConciergeStatus;
  priority: ConciergePriority;
  internalNote: string | null;
  nextFollowUpDate: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  updatedAt: string | null;
};

export type AdminMissingAction = {
  id: string;
  type: "questionnaire" | "documents" | "evidence" | "certificates" | "share_link" | "buyer_requests";
  label: string;
  severity: AdminRiskSeverity;
  sectionCode?: string | null;
  sectionLabel?: string | null;
  count?: number;
};

export type AdminSectionSummary = {
  code: string;
  label: string;
  answeredQuestions: number;
  totalQuestions: number;
  completionPercent: number;
  evidenceLinkedCount: number;
  evidenceRequiredCount: number;
};

export type AdminOrganizationSummary = {
  id: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
  readinessPercent: number;
  answeredQuestions: number;
  totalQuestions: number;
  documentCount: number;
  linkedEvidenceCount: number;
  buyerRequestCount: number;
  activeShareLink: boolean;
  certificateWarningCount: number;
  expiredCertificateCount: number;
  expiring30Count: number;
  expiring90Count: number;
  overdueBuyerRequestCount: number;
  missingActionCount: number;
  triageStatus: AdminTriageStatus;
  concierge: AdminConciergeNote | null;
};

export type AdminOrganizationDetail = AdminOrganizationSummary & {
  sections: AdminSectionSummary[];
  missingActions: AdminMissingAction[];
  buyerRequests: Array<{
    id: string;
    buyerName: string;
    requestTitle: string;
    status: string;
    dueDate: string | null;
    updatedAt: string | null;
  }>;
};

export type AdminRiskItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  riskType:
    | "certificate_expired"
    | "certificate_expiring"
    | "overdue_buyer_request"
    | "missing_evidence"
    | "low_readiness"
    | "no_active_share_link"
    | "no_documents"
    | "no_linked_evidence";
  severity: AdminRiskSeverity;
  date: string | null;
  readinessPercent: number | null;
  count: number;
};

export type AdminRisksPayload = {
  totals: {
    totalOrganizations: number;
    lowReadinessOrganizations: number;
    noDocumentsOrganizations: number;
    noLinkedEvidenceOrganizations: number;
    expiredCertificates: number;
    expiringWithin30Days: number;
    expiringWithin90Days: number;
    overdueBuyerRequests: number;
    noActiveShareLinkOrganizations: number;
  };
  risks: AdminRiskItem[];
};

export class AdminUnauthorizedError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminUnauthorizedError";
    this.status = status;
  }
}

type OrganizationRecord = {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type SectionRecord = {
  id: string;
  code: string;
  title: string;
  sort_order: number;
};

type ItemRecord = {
  id: string;
  section_id: string;
  evidence_required: boolean;
};

type AnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  status: string;
};

type DocumentRecord = {
  id: string;
  organization_id: string;
  document_type: string;
  expires_at?: string | null;
};

type DocumentLinkRecord = {
  document_id: string;
  question_answer_id: string;
};

type BuyerRequestRecord = {
  id: string;
  organization_id: string;
  buyer_name: string;
  request_title: string;
  status: string;
  due_date?: string | null;
  updated_at?: string | null;
};

type ShareLinkRecord = {
  organization_id: string;
  is_active: boolean;
  expires_at?: string | null;
};

type ConciergeRecord = {
  organization_id: string;
  status: string;
  priority: string;
  internal_note?: string | null;
  next_follow_up_date?: string | null;
  reviewed_at?: string | null;
  reviewed_by_user_id?: string | null;
  updated_at?: string | null;
};

type AdminGraphqlData = {
  organizations: OrganizationRecord[];
  question_sections: SectionRecord[];
  question_items: ItemRecord[];
  question_answers: AnswerRecord[];
  documents: DocumentRecord[];
  document_links: DocumentLinkRecord[];
  buyer_requests: BuyerRequestRecord[];
  share_links: ShareLinkRecord[];
  organization_concierge_notes: ConciergeRecord[];
};

const adminOverviewQuery = `
  query AdminWorkspaceOverview {
    organizations(order_by: { created_at: desc }) {
      id
      name
      created_at
      updated_at
    }
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
      sort_order
    }
    question_items {
      id
      section_id
      evidence_required
    }
    question_answers {
      id
      organization_id
      question_item_id
      status
    }
    documents {
      id
      organization_id
      document_type
      expires_at
    }
    document_links {
      document_id
      question_answer_id
    }
    buyer_requests {
      id
      organization_id
      buyer_name
      request_title
      status
      due_date
      updated_at
    }
    share_links {
      organization_id
      is_active
      expires_at
    }
    organization_concierge_notes {
      organization_id
      status
      priority
      internal_note
      next_follow_up_date
      reviewed_at
      reviewed_by_user_id
      updated_at
    }
  }
`;

const organizationExistsQuery = `
  query AdminOrganizationExists($id: uuid!) {
    organizations_by_pk(id: $id) {
      id
    }
  }
`;

const upsertConciergeNoteMutation = `
  mutation UpsertConciergeNote($object: organization_concierge_notes_insert_input!) {
    insert_organization_concierge_notes_one(
      object: $object
      on_conflict: {
        constraint: organization_concierge_notes_organization_id_key
        update_columns: [
          status
          priority
          internal_note
          next_follow_up_date
          reviewed_at
          reviewed_by_user_id
          updated_by_user_id
          updated_at
        ]
      }
    ) {
      organization_id
      status
      priority
      internal_note
      next_follow_up_date
      reviewed_at
      reviewed_by_user_id
      updated_at
    }
  }
`;

export async function requireAdminUser(request?: Request) {
  let user: AuthenticatedUser;

  try {
    user = await requireCurrentUser(request);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      throw new AdminUnauthorizedError(401, "Authentication required.");
    }

    throw error;
  }

  const allowlist = parseAdminAllowlist();
  const email = user.email?.trim().toLowerCase() ?? "";

  if (!email || !allowlist.has(email)) {
    throw new AdminUnauthorizedError(403, "Admin access denied.");
  }

  return user;
}

export async function getAdminOrganizations(request: Request) {
  await requireAdminUser(request);
  const context = await loadAdminContext();

  return buildOrganizationSummaries(context);
}

export async function getAdminOrganizationDetail(request: Request, organizationId: string) {
  await requireAdminUser(request);
  const context = await loadAdminContext();
  const summary = buildOrganizationSummaries(context).find((item) => item.id === organizationId);

  if (!summary) {
    return null;
  }

  return buildOrganizationDetail(context, summary);
}

export async function getAdminRisks(request: Request): Promise<AdminRisksPayload> {
  await requireAdminUser(request);
  const context = await loadAdminContext();
  const organizations = buildOrganizationSummaries(context);
  const risks: AdminRiskItem[] = [];

  for (const organization of organizations) {
    if (organization.expiredCertificateCount > 0) {
      risks.push(buildRisk(organization, "certificate_expired", "critical", organization.expiredCertificateCount));
    }

    if (organization.expiring30Count > 0 || organization.expiring90Count > 0) {
      risks.push(
        buildRisk(
          organization,
          "certificate_expiring",
          organization.expiring30Count > 0 ? "warning" : "info",
          organization.expiring30Count + organization.expiring90Count,
        ),
      );
    }

    if (organization.overdueBuyerRequestCount > 0) {
      risks.push(buildRisk(organization, "overdue_buyer_request", "critical", organization.overdueBuyerRequestCount));
    }

    if (organization.linkedEvidenceCount === 0 && organization.answeredQuestions > 0) {
      risks.push(buildRisk(organization, "missing_evidence", "warning", 1));
    }

    if (organization.readinessPercent < 40) {
      risks.push(buildRisk(organization, "low_readiness", "critical", 1));
    } else if (organization.readinessPercent < 70) {
      risks.push(buildRisk(organization, "low_readiness", "warning", 1));
    }

    if (!organization.activeShareLink) {
      risks.push(buildRisk(organization, "no_active_share_link", "warning", 1));
    }

    if (organization.documentCount === 0) {
      risks.push(buildRisk(organization, "no_documents", "warning", 1));
    }

    if (organization.linkedEvidenceCount === 0) {
      risks.push(buildRisk(organization, "no_linked_evidence", "warning", 1));
    }
  }

  return {
    totals: {
      totalOrganizations: organizations.length,
      lowReadinessOrganizations: organizations.filter((item) => item.readinessPercent < 70).length,
      noDocumentsOrganizations: organizations.filter((item) => item.documentCount === 0).length,
      noLinkedEvidenceOrganizations: organizations.filter((item) => item.linkedEvidenceCount === 0).length,
      expiredCertificates: organizations.reduce((sum, item) => sum + item.expiredCertificateCount, 0),
      expiringWithin30Days: organizations.reduce((sum, item) => sum + item.expiring30Count, 0),
      expiringWithin90Days: organizations.reduce((sum, item) => sum + item.expiring90Count, 0),
      overdueBuyerRequests: organizations.reduce((sum, item) => sum + item.overdueBuyerRequestCount, 0),
      noActiveShareLinkOrganizations: organizations.filter((item) => !item.activeShareLink).length,
    },
    risks: risks.sort((a, b) => severityRank(a.severity) - severityRank(b.severity)),
  };
}

export async function updateAdminConciergeNote(
  request: Request,
  organizationId: string,
  input: {
    status?: unknown;
    priority?: unknown;
    internalNote?: unknown;
    nextFollowUpDate?: unknown;
    markReviewed?: unknown;
  },
) {
  const user = await requireAdminUser(request);
  const exists = await executeHasuraGraphql<{ organizations_by_pk: { id: string } | null }>(
    organizationExistsQuery,
    { id: organizationId },
    { useAdminSecret: true },
  );

  if (!exists.organizations_by_pk) {
    return null;
  }

  const reviewedAt = input.markReviewed === true ? new Date().toISOString() : undefined;
  const result = await executeHasuraGraphql<{
    insert_organization_concierge_notes_one: ConciergeRecord | null;
  }>(
    upsertConciergeNoteMutation,
    {
      object: {
        organization_id: organizationId,
        status: normalizeConciergeStatus(input.status),
        priority: normalizeConciergePriority(input.priority),
        internal_note: normalizeOptionalText(input.internalNote, 5000),
        next_follow_up_date: normalizeDate(input.nextFollowUpDate),
        ...(reviewedAt ? { reviewed_at: reviewedAt, reviewed_by_user_id: user.id } : {}),
        updated_by_user_id: user.id,
        updated_at: new Date().toISOString(),
      },
    },
    { useAdminSecret: true },
  );

  return result.insert_organization_concierge_notes_one
    ? normalizeConcierge(result.insert_organization_concierge_notes_one)
    : null;
}

function parseAdminAllowlist() {
  return new Set(
    (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function loadAdminContext() {
  return executeHasuraGraphql<AdminGraphqlData>(adminOverviewQuery, {}, { useAdminSecret: true });
}

function buildOrganizationSummaries(context: AdminGraphqlData): AdminOrganizationSummary[] {
  return context.organizations.map((organization) => {
    const data = getOrganizationData(context, organization.id);
    const readiness = calculateReadiness(data.answers, context.question_items);
    const certificateWarnings = calculateCertificateWarnings(data.documents);
    const overdueBuyerRequestCount = data.buyerRequests.filter((request) => isOverdue(request.due_date, request.status))
      .length;
    const activeShareLink = data.shareLinks.some((link) => isActiveShareLink(link));
    const missingActions = buildMissingActions(context, organization, data, readiness, certificateWarnings);
    const triageStatus = calculateTriageStatus({
      readinessPercent: readiness.readinessPercent,
      documentCount: data.documents.length,
      linkedEvidenceCount: data.linkedEvidenceCount,
      activeShareLink,
      certificateWarnings,
      overdueBuyerRequestCount,
      missingActionCount: missingActions.length,
    });

    return {
      id: organization.id,
      name: organization.name,
      createdAt: organization.created_at ?? null,
      updatedAt: organization.updated_at ?? null,
      readinessPercent: readiness.readinessPercent,
      answeredQuestions: readiness.answeredQuestions,
      totalQuestions: readiness.totalQuestions,
      documentCount: data.documents.length,
      linkedEvidenceCount: data.linkedEvidenceCount,
      buyerRequestCount: data.buyerRequests.length,
      activeShareLink,
      certificateWarningCount:
        certificateWarnings.expiredCount + certificateWarnings.expiring30Count + certificateWarnings.expiring90Count,
      expiredCertificateCount: certificateWarnings.expiredCount,
      expiring30Count: certificateWarnings.expiring30Count,
      expiring90Count: certificateWarnings.expiring90Count,
      overdueBuyerRequestCount,
      missingActionCount: missingActions.length,
      triageStatus,
      concierge: data.concierge ? normalizeConcierge(data.concierge) : null,
    };
  });
}

function buildOrganizationDetail(
  context: AdminGraphqlData,
  summary: AdminOrganizationSummary,
): AdminOrganizationDetail {
  const organization = context.organizations.find((item) => item.id === summary.id);
  const data = getOrganizationData(context, summary.id);
  const sections = buildSectionSummaries(context, data);
  const certificateWarnings = calculateCertificateWarnings(data.documents);
  const missingActions = organization
    ? buildMissingActions(context, organization, data, summary, certificateWarnings)
    : [];

  return {
    ...summary,
    sections,
    missingActions,
    buyerRequests: data.buyerRequests.map((request) => ({
      id: request.id,
      buyerName: request.buyer_name,
      requestTitle: request.request_title,
      status: request.status,
      dueDate: request.due_date ?? null,
      updatedAt: request.updated_at ?? null,
    })),
  };
}

function getOrganizationData(context: AdminGraphqlData, organizationId: string) {
  const answers = context.question_answers.filter((answer) => answer.organization_id === organizationId);
  const documents = context.documents.filter((document) => document.organization_id === organizationId);
  const buyerRequests = context.buyer_requests.filter((request) => request.organization_id === organizationId);
  const shareLinks = context.share_links.filter((link) => link.organization_id === organizationId);
  const answerIds = new Set(answers.map((answer) => answer.id));
  const linkedEvidenceCount = context.document_links.filter((link) => answerIds.has(link.question_answer_id)).length;
  const concierge = context.organization_concierge_notes.find((note) => note.organization_id === organizationId) ?? null;

  return {
    answers,
    documents,
    buyerRequests,
    shareLinks,
    linkedEvidenceCount,
    concierge,
  };
}

function calculateReadiness(answers: AnswerRecord[], questionItems: ItemRecord[]) {
  const answeredStatuses = new Set(["in_progress", "completed", "needs_evidence", "reviewed"]);
  const answerByQuestionItem = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const totalQuestions = questionItems.length;
  const answeredQuestions = questionItems.filter((item) =>
    answeredStatuses.has(answerByQuestionItem.get(item.id)?.status ?? "not_started"),
  ).length;

  return {
    totalQuestions,
    answeredQuestions,
    readinessPercent: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
  };
}

function buildSectionSummaries(context: AdminGraphqlData, data: ReturnType<typeof getOrganizationData>) {
  const answerByQuestionItem = new Map(data.answers.map((answer) => [answer.question_item_id, answer]));
  const answerIdsWithLinks = new Set(
    context.document_links
      .filter((link) => data.answers.some((answer) => answer.id === link.question_answer_id))
      .map((link) => link.question_answer_id),
  );

  return context.question_sections.map((section) => {
    const items = context.question_items.filter((item) => item.section_id === section.id);
    const answeredQuestions = items.filter((item) => {
      const status = answerByQuestionItem.get(item.id)?.status ?? "not_started";
      return ["in_progress", "completed", "needs_evidence", "reviewed"].includes(status);
    }).length;
    const evidenceLinkedCount = items.filter((item) => {
      const answer = answerByQuestionItem.get(item.id);
      return answer ? answerIdsWithLinks.has(answer.id) : false;
    }).length;
    const evidenceRequiredCount = items.filter((item) => item.evidence_required).length;

    return {
      code: section.code,
      label: section.title,
      answeredQuestions,
      totalQuestions: items.length,
      completionPercent: items.length > 0 ? Math.round((answeredQuestions / items.length) * 100) : 0,
      evidenceLinkedCount,
      evidenceRequiredCount,
    };
  });
}

function buildMissingActions(
  context: AdminGraphqlData,
  organization: OrganizationRecord,
  data: ReturnType<typeof getOrganizationData>,
  readiness: Pick<AdminOrganizationSummary, "readinessPercent" | "answeredQuestions" | "totalQuestions">,
  certificateWarnings: ReturnType<typeof calculateCertificateWarnings>,
): AdminMissingAction[] {
  const actions: AdminMissingAction[] = [];
  const sections = buildSectionSummaries(context, data);
  const lowSections = sections.filter((section) => section.totalQuestions > 0 && section.completionPercent < 80);

  for (const section of lowSections.slice(0, 4)) {
    actions.push({
      id: `${organization.id}-questionnaire-${section.code}`,
      type: "questionnaire",
      label: `Complete unanswered ${section.label} items.`,
      severity: section.completionPercent < 40 ? "critical" : "warning",
      sectionCode: section.code,
      sectionLabel: section.label,
      count: section.totalQuestions - section.answeredQuestions,
    });
  }

  const answeredWithNoEvidence = sections.filter(
    (section) => section.answeredQuestions > 0 && section.evidenceLinkedCount === 0,
  );

  for (const section of answeredWithNoEvidence.slice(0, 3)) {
    actions.push({
      id: `${organization.id}-evidence-${section.code}`,
      type: "evidence",
      label: `Link evidence for ${section.label}.`,
      severity: "warning",
      sectionCode: section.code,
      sectionLabel: section.label,
    });
  }

  if (data.documents.length === 0) {
    actions.push({
      id: `${organization.id}-documents`,
      type: "documents",
      label: "Upload evidence documents.",
      severity: "warning",
      count: 0,
    });
  }

  if (certificateWarnings.expiredCount > 0) {
    actions.push({
      id: `${organization.id}-certificates-expired`,
      type: "certificates",
      label: "Review expired certificates.",
      severity: "critical",
      count: certificateWarnings.expiredCount,
    });
  } else if (certificateWarnings.expiring30Count + certificateWarnings.expiring90Count > 0) {
    actions.push({
      id: `${organization.id}-certificates-expiring`,
      type: "certificates",
      label: "Review expiring certificates.",
      severity: "warning",
      count: certificateWarnings.expiring30Count + certificateWarnings.expiring90Count,
    });
  }

  if (!data.shareLinks.some((link) => isActiveShareLink(link)) && readiness.readinessPercent > 0) {
    actions.push({
      id: `${organization.id}-share-link`,
      type: "share_link",
      label: "Create or activate the public Supplier Passport link.",
      severity: "warning",
    });
  }

  const overdueBuyerRequests = data.buyerRequests.filter((request) => isOverdue(request.due_date, request.status));
  if (overdueBuyerRequests.length > 0) {
    actions.push({
      id: `${organization.id}-buyer-requests-overdue`,
      type: "buyer_requests",
      label: "Resolve overdue buyer requests.",
      severity: "critical",
      count: overdueBuyerRequests.length,
    });
  }

  return actions;
}

function calculateCertificateWarnings(documents: DocumentRecord[]) {
  const now = startOfToday();
  const in30 = addDays(now, 30);
  const in90 = addDays(now, 90);
  let expiredCount = 0;
  let expiring30Count = 0;
  let expiring90Count = 0;

  for (const document of documents) {
    if (document.document_type !== "certificate" || !document.expires_at) {
      continue;
    }

    const expiresAt = new Date(document.expires_at);
    if (Number.isNaN(expiresAt.getTime())) {
      continue;
    }

    if (expiresAt < now) {
      expiredCount += 1;
    } else if (expiresAt <= in30) {
      expiring30Count += 1;
    } else if (expiresAt <= in90) {
      expiring90Count += 1;
    }
  }

  return { expiredCount, expiring30Count, expiring90Count };
}

function calculateTriageStatus(input: {
  readinessPercent: number;
  documentCount: number;
  linkedEvidenceCount: number;
  activeShareLink: boolean;
  certificateWarnings: ReturnType<typeof calculateCertificateWarnings>;
  overdueBuyerRequestCount: number;
  missingActionCount: number;
}): AdminTriageStatus {
  if (
    input.certificateWarnings.expiredCount > 0 ||
    input.overdueBuyerRequestCount > 0 ||
    input.missingActionCount >= 5
  ) {
    return "at_risk";
  }

  if (input.readinessPercent >= 80 && input.activeShareLink && input.linkedEvidenceCount > 0) {
    return "demo_ready";
  }

  if (input.readinessPercent < 40 || input.documentCount === 0 || input.linkedEvidenceCount === 0) {
    return "needs_attention";
  }

  return "in_progress";
}

function buildRisk(
  organization: AdminOrganizationSummary,
  riskType: AdminRiskItem["riskType"],
  severity: AdminRiskSeverity,
  count: number,
): AdminRiskItem {
  return {
    id: `${organization.id}-${riskType}`,
    organizationId: organization.id,
    organizationName: organization.name,
    riskType,
    severity,
    date: null,
    readinessPercent: riskType === "low_readiness" ? organization.readinessPercent : null,
    count,
  };
}

function severityRank(severity: AdminRiskSeverity) {
  return severity === "critical" ? 0 : severity === "warning" ? 1 : 2;
}

function isActiveShareLink(link: ShareLinkRecord) {
  if (!link.is_active) {
    return false;
  }

  if (!link.expires_at) {
    return true;
  }

  const expiresAt = new Date(link.expires_at);
  return Number.isNaN(expiresAt.getTime()) || expiresAt > new Date();
}

function isOverdue(dueDate: string | null | undefined, status: string) {
  if (!dueDate || status === "closed") {
    return false;
  }

  const due = new Date(`${dueDate}T23:59:59.999Z`);
  return !Number.isNaN(due.getTime()) && due < new Date();
}

function normalizeConcierge(record: ConciergeRecord): AdminConciergeNote {
  return {
    status: normalizeConciergeStatus(record.status),
    priority: normalizeConciergePriority(record.priority),
    internalNote: record.internal_note ?? null,
    nextFollowUpDate: record.next_follow_up_date ?? null,
    reviewedAt: record.reviewed_at ?? null,
    reviewedByUserId: record.reviewed_by_user_id ?? null,
    updatedAt: record.updated_at ?? null,
  };
}

function normalizeConciergeStatus(value: unknown): ConciergeStatus {
  return typeof value === "string" &&
    ["not_started", "onboarding", "waiting_on_supplier", "ready_for_review", "demo_ready", "paused"].includes(value)
    ? (value as ConciergeStatus)
    : "not_started";
}

function normalizeConciergePriority(value: unknown): ConciergePriority {
  return typeof value === "string" && ["low", "normal", "high"].includes(value)
    ? (value as ConciergePriority)
    : "normal";
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
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

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
