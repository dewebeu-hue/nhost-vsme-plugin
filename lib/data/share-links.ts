import "server-only";

import { createAPIClient } from "@nhost/nhost-js/storage";
import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import {
  INSERT_SHARE_LINK,
  INSERT_SHARE_LINK_ACCESS,
  UPDATE_SHARE_LINK,
  UPDATE_SUPPLIER_PASSPORT,
} from "@/lib/graphql/mutations";
import {
  GET_PUBLIC_SHARE_DOCUMENTS,
  GET_PUBLIC_SHARE_DOCUMENT_LINKS,
  GET_PUBLIC_SHARE_DOCUMENT_ACCESS,
  GET_PUBLIC_SHARE_ORGANIZATION,
  GET_PUBLIC_SHARE_PASSPORT,
  GET_PUBLIC_SHARE_QUESTIONNAIRE,
  GET_SHARE_LINK_BY_TOKEN,
} from "@/lib/graphql/queries";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import {
  getNhostAdminSecret,
  getNhostGraphqlUrl,
  getNhostStorageUrl,
  getShareLinkCookieSecret,
} from "@/lib/nhost/config";
import { createPublicOrganizationLogoDisplayUrl } from "@/lib/data/organization-logo";
import { activeShareLinks, publicSharePassport } from "@/lib/mock-data";
import type { SupplierPassportRecord } from "@/lib/data/passports";
import {
  passportEvidenceTypesBySectionCode,
  type PassportSummaryQuestion,
  type PassportSummarySection,
} from "@/lib/passport-summary";

export type ShareLinkRecord = {
  id: string;
  passport_id: string;
  organization_id: string;
  token: string;
  buyer_name: string | null;
  buyer_email: string | null;
  password_hash: string | null;
  expires_at: string | null;
  is_active: boolean;
  document_visibility: "approved_only" | "all_linked_documents";
  created_by: string | null;
  created_at: string;
};

export type CreateShareLinkInput = {
  passportId: string;
  organizationId: string;
  createdBy: string;
  buyerName?: string;
  buyerEmail?: string;
  expiresAt?: string;
  password?: string;
  documentVisibility: "approved_only" | "all_linked_documents";
  locale?: string;
};

export type ShareVerificationResult =
  | { ok: true; shareLink: ShareLinkRecord; cookieName: string; cookieValue: string; maxAge: number }
  | { ok: false; reason: "not_found" | "inactive" | "expired" | "not_protected" | "incorrect" };

type ShareLinkByTokenResponse = {
  share_links: ShareLinkRecord[];
};

type InsertShareLinkResponse = {
  insert_share_links_one: ShareLinkRecord | null;
};

type UpdateShareLinkResponse = {
  update_share_links_by_pk: ShareLinkRecord | null;
};

type PublicOrganizationResponse = {
  organizations_by_pk: {
    id: string;
    name: string;
    slug: string;
    industry: string | null;
    employee_count_range: string | null;
    headquarters_city: string | null;
    headquarters_country: string | null;
    countries_served: string[] | null;
    logo_file_id: string | null;
    logo_uploaded_at: string | null;
    logo_alt_text: string | null;
    is_verified: boolean;
  } | null;
  company_profiles: Array<{
    legal_name: string | null;
    trade_name: string | null;
    industries: string[] | null;
    certifications: string[] | null;
    employee_count_range: string | null;
    countries_served: string[] | null;
  }>;
};

type PublicPassportResponse = {
  supplier_passports_by_pk: SupplierPassportRecord | null;
};

type PublicDocumentsResponse = {
  documents: PublicDocumentRecord[];
};

type PublicDocumentLinksResponse = {
  document_links: Array<{ id: string; document_id: string; question_answer_id: string }>;
};

type PublicQuestionnaireResponse = {
  question_sections: PassportSummarySection[];
  question_items: PassportSummaryQuestion[];
  question_answers: PublicQuestionnaireAnswer[];
};

type PublicQuestionnaireAnswer = {
  id?: string;
  question_item_id: string;
  status?: string | null;
};

type PublicDocumentRecord = {
  id: string;
  file_name: string;
  mime_type: string | null;
  document_type: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  document_links?: Array<{ id: string; question_answer_id: string }>;
};

type PublicDocumentAccessRecord = PublicDocumentRecord & {
  organization_id: string;
  file_id: string | null;
  document_links: Array<{ id: string; question_answer_id: string }>;
};

type PublicDocumentAccessResponse = {
  documents_by_pk: PublicDocumentAccessRecord | null;
};

type PublicDocumentSummaryRecord = Pick<
  PublicDocumentRecord,
  "document_type" | "status" | "expires_at"
> & {
  linked_question_answer_ids: string[];
};

export type SharedDocumentAccessResult =
  | {
      ok: true;
      shareLink: ShareLinkRecord;
      document: PublicDocumentAccessRecord;
    }
  | {
      ok: false;
      reason:
        | "not_found"
        | "inactive"
        | "expired"
        | "password_required"
        | "not_allowed"
        | "missing_file";
    };

export function isShareLinksBackendConfigured() {
  return Boolean(getNhostGraphqlUrl());
}

export async function getActiveShareLinks() {
  return {
    shareLinks: activeShareLinks,
    source: "mock" as const,
  };
}

export async function getShareLinkByToken(token: string) {
  const data = await executeHasuraGraphql<ShareLinkByTokenResponse>(
    GET_SHARE_LINK_BY_TOKEN,
    { token },
    { useAdminSecret: true },
  );

  return data.share_links[0] ?? null;
}

export async function getPublicShareByToken(
  token: string,
  options: { verificationCookieValue?: string } = {},
) {
  if (!isShareLinksBackendConfigured()) {
    if (token === "acme-manufacturing") {
      return {
        state: "ok" as const,
        share: publicSharePassport,
        source: "mock" as const,
      };
    }

    return null;
  }

  const shareLink = await getShareLinkByToken(token);

  if (!shareLink) {
    return null;
  }

  if (!shareLink.is_active) {
    return { state: "inactive" as const, source: "live" as const };
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at).getTime() <= Date.now()) {
    return { state: "expired" as const, source: "live" as const };
  }

  if (
    shareLink.password_hash &&
    !isValidShareVerificationCookie(token, shareLink, options.verificationCookieValue)
  ) {
    return { state: "password" as const, source: "live" as const };
  }

  const [organizationData, passportData, documentsData, questionnaireData] = await Promise.all([
    executeHasuraGraphql<PublicOrganizationResponse>(
      GET_PUBLIC_SHARE_ORGANIZATION,
      { organizationId: shareLink.organization_id },
      { useAdminSecret: true },
    ),
    executeHasuraGraphql<PublicPassportResponse>(
      GET_PUBLIC_SHARE_PASSPORT,
      { passportId: shareLink.passport_id },
      { useAdminSecret: true },
    ),
    executeHasuraGraphql<PublicDocumentsResponse>(
      GET_PUBLIC_SHARE_DOCUMENTS,
      {
        organizationId: shareLink.organization_id,
        statuses:
          shareLink.document_visibility === "all_linked_documents"
            ? ["reviewed", "linked"]
            : ["reviewed"],
      },
      { useAdminSecret: true },
    ),
    executeHasuraGraphql<PublicQuestionnaireResponse>(
      GET_PUBLIC_SHARE_QUESTIONNAIRE,
      { organizationId: shareLink.organization_id },
      { useAdminSecret: true },
    ),
  ]);
  const documentsWithLinks = await loadPublicShareDocumentsWithLinks(
    documentsData.documents,
    questionnaireData.question_answers,
  );

  const organization = organizationData.organizations_by_pk;
  const passport = passportData.supplier_passports_by_pk;

  if (!organization || !passport) {
    return null;
  }

  return {
    state: "ok" as const,
    share: mapPublicShare(
      shareLink,
      organizationData,
      passport,
      documentsWithLinks,
      questionnaireData,
    ),
    source: "live" as const,
  };
}

async function loadPublicShareDocumentsWithLinks(
  documents: PublicDocumentRecord[],
  answers: PublicQuestionnaireAnswer[],
) {
  const documentIds = documents.map((document) => document.id);
  const questionAnswerIds = answers
    .map((answer) => answer.id)
    .filter((answerId): answerId is string => Boolean(answerId));

  if (!documentIds.length || !questionAnswerIds.length) {
    return documents.map((document) => ({ ...document, document_links: [] }));
  }

  const linksData = await executeHasuraGraphql<PublicDocumentLinksResponse>(
    GET_PUBLIC_SHARE_DOCUMENT_LINKS,
    { documentIds, questionAnswerIds },
    { useAdminSecret: true },
  );
  const linksByDocument = new Map<string, PublicDocumentRecord["document_links"]>();

  for (const link of linksData.document_links) {
    const current = linksByDocument.get(link.document_id) ?? [];
    linksByDocument.set(link.document_id, [
      ...current,
      { id: link.id, question_answer_id: link.question_answer_id },
    ]);
  }

  return documents.map((document) => ({
    ...document,
    document_links: linksByDocument.get(document.id) ?? [],
  }));
}

export async function createShareLink(input: CreateShareLinkInput, accessToken?: string) {
  if (!accessToken) {
    throw new Error("Authentication is required to create a share link.");
  }

  const token = createShareToken();
  const data = await executeHasuraGraphql<InsertShareLinkResponse>(
    INSERT_SHARE_LINK,
    {
      object: {
        passport_id: input.passportId,
        organization_id: input.organizationId,
        token,
        buyer_name: input.buyerName || null,
        buyer_email: input.buyerEmail || null,
        password_hash: input.password ? hashPassword(input.password) : null,
        expires_at: input.expiresAt || null,
        document_visibility: input.documentVisibility,
        created_by: input.createdBy,
      },
    },
    { accessToken },
  );

  if (!data.insert_share_links_one) {
    throw new Error("Share link could not be created.");
  }

  await executeHasuraGraphql<UpdateShareLinkResponse>(
    UPDATE_SHARE_LINK,
    {
      shareLinkId: data.insert_share_links_one.id,
      set: { is_active: true },
    },
    { accessToken },
  ).catch(() => null);

  await executeHasuraGraphql(
    UPDATE_SUPPLIER_PASSPORT,
    {
      passportId: input.passportId,
      set: { status: "shared" },
    },
    { accessToken },
  ).catch(() => null);

  return {
    shareLink: data.insert_share_links_one,
    shareUrl: `/${input.locale ?? "en"}/share/${data.insert_share_links_one.token}`,
  };
}

export async function verifyShareLinkPassword(
  token: string,
  password: string,
): Promise<ShareVerificationResult> {
  const shareLink = await getShareLinkByToken(token);

  if (!shareLink) {
    return { ok: false, reason: "not_found" };
  }

  if (!shareLink.is_active) {
    return { ok: false, reason: "inactive" };
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (!shareLink.password_hash) {
    return { ok: false, reason: "not_protected" };
  }

  if (!verifyPassword(password, shareLink.password_hash)) {
    return { ok: false, reason: "incorrect" };
  }

  const maxAge = 60 * 60 * 2;
  const expiresAt = Date.now() + maxAge * 1000;

  return {
    ok: true,
    shareLink,
    cookieName: getShareVerificationCookieName(token),
    cookieValue: createShareVerificationCookieValue(token, shareLink, expiresAt),
    maxAge,
  };
}

export async function canAccessSharedDocument(input: {
  token: string;
  documentId: string;
  verificationCookieValue?: string;
}): Promise<SharedDocumentAccessResult> {
  const shareLink = await getShareLinkByToken(input.token);

  if (!shareLink) {
    return { ok: false, reason: "not_found" };
  }

  if (!shareLink.is_active) {
    return { ok: false, reason: "inactive" };
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (
    shareLink.password_hash &&
    !isValidShareVerificationCookie(input.token, shareLink, input.verificationCookieValue)
  ) {
    return { ok: false, reason: "password_required" };
  }

  const data = await executeHasuraGraphql<PublicDocumentAccessResponse>(
    GET_PUBLIC_SHARE_DOCUMENT_ACCESS,
    {
      documentId: input.documentId,
      organizationId: shareLink.organization_id,
    },
    { useAdminSecret: true },
  );
  const document = data.documents_by_pk;

  if (!document || document.organization_id !== shareLink.organization_id) {
    return { ok: false, reason: "not_found" };
  }

  if (!document.file_id) {
    return { ok: false, reason: "missing_file" };
  }

  if (!isDocumentBuyerVisible(shareLink, document)) {
    return { ok: false, reason: "not_allowed" };
  }

  return { ok: true, shareLink, document };
}

export async function getSharedDocumentFile(document: PublicDocumentAccessRecord) {
  const storageUrl = getNhostStorageUrl();
  const adminSecret = getNhostAdminSecret();

  if (!storageUrl || !adminSecret || !document.file_id) {
    throw new Error("Controlled document access is not configured.");
  }

  const storage = createAPIClient(storageUrl);

  return storage.getFile(document.file_id, undefined, {
    headers: {
      "x-hasura-admin-secret": adminSecret,
    },
  });
}

export async function revokeShareLink(shareLinkId: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error("Authentication is required to revoke a share link.");
  }

  const data = await executeHasuraGraphql<UpdateShareLinkResponse>(
    UPDATE_SHARE_LINK,
    { shareLinkId, set: { is_active: false } },
    { accessToken },
  );

  if (!data.update_share_links_by_pk) {
    throw new Error("Share link could not be revoked.");
  }

  return data.update_share_links_by_pk;
}

export async function recordShareLinkAccess(input: {
  shareLinkId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await executeHasuraGraphql(
    INSERT_SHARE_LINK_ACCESS,
    {
      object: {
        share_link_id: input.shareLinkId,
        ip_address: input.ipAddress || null,
        user_agent: input.userAgent || null,
      },
    },
    { useAdminSecret: true },
  ).catch(() => null);
}

function mapPublicShare(
  shareLink: ShareLinkRecord,
  data: PublicOrganizationResponse,
  passport: SupplierPassportRecord,
  documents: PublicDocumentRecord[],
  questionnaire: PublicQuestionnaireResponse,
): typeof publicSharePassport {
  const organization = data.organizations_by_pk;
  const profile = data.company_profiles[0];
  const companyName =
    profile?.trade_name ||
    profile?.legal_name ||
    organization?.name ||
    "Supplier";
  const industries = profile?.industries?.length
    ? profile.industries
    : organization?.industry
      ? [organization.industry]
      : [];
  const countries = profile?.countries_served?.length
    ? profile.countries_served
      : organization?.countries_served ?? [];
  const headquarters = [
    organization?.headquarters_city,
    organization?.headquarters_country,
  ]
    .filter(Boolean)
    .join(", ");
  const readinessScore = calculatePublicReadinessScore(
    questionnaire.question_items,
    questionnaire.question_answers,
  );
  const detailedSections = createPublicPassportSectionSummaries(
    questionnaire.question_sections,
    questionnaire.question_items,
    questionnaire.question_answers,
    mapPublicDocumentsForSummary(documents),
  );

  return {
    token: "",
    company: {
      name: companyName,
      verified: organization?.is_verified ?? false,
      logoUrl: organization?.logo_file_id
        ? createPublicOrganizationLogoDisplayUrl(shareLink.token, organization.logo_uploaded_at)
        : null,
      logoAltText: organization?.logo_alt_text || companyName,
      industries,
      countriesServed: countries.length ? countries.join(", ") : "Not provided",
      employeeCount:
        profile?.employee_count_range ||
        organization?.employee_count_range ||
        "Not provided",
      headquarters: headquarters || "Not provided",
      certifications: profile?.certifications ?? [],
    },
    readinessScore,
    certificateStatus: getPublicCertificateStatus(documents),
    lastUpdated: formatDate(passport.generated_at ?? passport.updated_at),
    sharedWith: shareLink.buyer_name || "Buyer",
    sharedOn: formatDate(shareLink.created_at),
    expiresOn: shareLink.expires_at ? formatDate(shareLink.expires_at) : "No expiry",
    statusChips: [
      "Read-only",
      ...(shareLink.password_hash ? ["Password protected"] : []),
      ...(shareLink.expires_at ? [`Expires: ${formatDate(shareLink.expires_at)}`] : []),
    ],
    heroText: `${companyName} has shared their VSME / ESG profile with you. This information is provided securely and is read-only.`,
    sections: detailedSections.map((section) => ({
      title: section.title,
      description: getPublicSectionDescription(section.title),
      metricLabel: section.title === "Evidence summary" ? "Evidence files" : "Completion",
      metricValue:
        section.title === "Evidence summary"
          ? String(section.linkedDocuments)
          : `${section.completion}%`,
      actionLabel:
        section.title === "Evidence summary"
          ? "Evidence documents are available on request"
          : section.linkedDocuments > 0
            ? "Evidence available"
            : "Evidence recommended",
    })),
    documents: [],
    details: [
      { label: "Shared on", value: formatDate(shareLink.created_at) },
      { label: "Shared with", value: shareLink.buyer_name || "Buyer" },
      { label: "Access", value: "Read-only" },
      { label: "Security", value: shareLink.password_hash ? "Password protected" : "Read-only" },
      { label: "Expires", value: shareLink.expires_at ? formatDate(shareLink.expires_at) : "No expiry" },
    ],
    footerDisclaimer: publicSharePassport.footerDisclaimer,
  } as typeof publicSharePassport;
}

function createPublicPassportSectionSummaries(
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PublicQuestionnaireAnswer[],
  documents: PublicDocumentSummaryRecord[],
) {
  const answerByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const answerById = new Map(
    answers.flatMap((answer) => (answer.id ? [[answer.id, answer] as const] : [])),
  );
  const questionById = new Map(questions.map((question) => [question.id, question]));

  return [
    ...sections.map((section) => {
      const sectionQuestions = questions.filter((question) => question.section_id === section.id);
      const answeredCount = sectionQuestions.filter((question) =>
        isPublicAnswerComplete(answerByQuestion.get(question.id)),
      ).length;
      const sectionEvidenceTypes = new Set(passportEvidenceTypesBySectionCode[section.code] ?? []);
      const linkedDocuments = documents.filter((document) => {
        const linkedToSection = (document.linked_question_answer_ids ?? []).some((answerId) => {
          const answer = answerById.get(answerId);
          const question = answer ? questionById.get(answer.question_item_id) : undefined;

          return question?.section_id === section.id;
        });

        return (
          isPublicEvidenceAvailable(document.status) &&
          (linkedToSection ||
            (Boolean(document.document_type) && sectionEvidenceTypes.has(String(document.document_type))))
        );
      }).length;

      return {
        title: getPublicSectionTitle(section.code, section.title),
        completion: calculatePublicPercent(answeredCount, sectionQuestions.length),
        approvedAnswers: answeredCount,
        linkedDocuments,
        visibility: "Shared" as const,
      };
    }),
    {
      title: "Evidence summary",
      completion: calculatePublicPercent(
        documents.filter((document) => isPublicEvidenceAvailable(document.status)).length,
        documents.length,
      ),
      approvedAnswers: 0,
      linkedDocuments: documents.filter((document) => isPublicEvidenceAvailable(document.status)).length,
      visibility: "Shared" as const,
    },
  ];
}

function getPublicSectionTitle(code: string, fallback: string) {
  const titles: Record<string, string> = {
    company_basics: "Company basics",
    employees: "Employees",
    energy: "Energy",
    fuel: "Fuel",
    waste: "Waste",
    environmental_policies: "Environmental policies",
    health_safety: "Health and safety",
    certifications: "Certifications",
    governance: "Governance",
    supplier_information: "Supplier information",
  };

  return titles[code] ?? fallback;
}

function isPublicAnswerComplete(answer: PublicQuestionnaireAnswer | undefined) {
  if (!answer || answer.status === "not_started") {
    return false;
  }

  if (answer.status === "completed" || answer.status === "reviewed" || answer.status === "needs_evidence") {
    return true;
  }

  return false;
}

function isPublicEvidenceAvailable(status: string) {
  return ["reviewed", "linked", "uploaded", "needs_review", "expiring_soon"].includes(status);
}

function calculatePublicReadinessScore(
  questions: PassportSummaryQuestion[],
  answers: PublicQuestionnaireAnswer[],
) {
  const answerByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const completedCount = questions.filter((question) =>
    isPublicAnswerComplete(answerByQuestion.get(question.id)),
  ).length;

  return calculatePublicPercent(completedCount, questions.length);
}

function getPublicCertificateStatus(documents: PublicDocumentRecord[]) {
  const certificateDocuments = documents.filter((document) => document.document_type === "certificate");

  if (!certificateDocuments.length) {
    return "none" as const;
  }

  let hasExpiringSoon = false;

  for (const document of certificateDocuments) {
    if (!document.expires_at) {
      continue;
    }

    const daysUntilExpiry = getDaysUntilDate(document.expires_at);

    if (daysUntilExpiry === null) {
      continue;
    }

    if (daysUntilExpiry < 0) {
      return "expired" as const;
    }

    if (daysUntilExpiry <= 90) {
      hasExpiringSoon = true;
    }
  }

  return hasExpiringSoon ? "expires_soon" as const : "available" as const;
}

function calculatePublicPercent(answered: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((answered / total) * 100);
}

function mapPublicDocumentsForSummary(documents: PublicDocumentRecord[]) {
  return documents.map((document) => ({
    document_type: document.document_type,
    status: document.status,
    expires_at: document.expires_at,
    linked_question_answer_ids: (document.document_links ?? []).map(
      (link) => link.question_answer_id,
    ),
  }));
}

function getPublicSectionDescription(title: string) {
  const descriptions: Record<string, string> = {
    "Company overview": "Supplier identity and reporting basis.",
    Environment: "VSME-aligned environmental and evidence readiness.",
    Social: "Workforce, health, safety, and training readiness.",
    Governance: "Governance, ethics, and supplier due-diligence readiness.",
    "Evidence summary": "Buyer-safe evidence availability summary.",
  };

  return descriptions[title] ?? "Buyer-safe Supplier Passport summary.";
}

function getDaysUntilDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);

  return Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}

function isDocumentBuyerVisible(
  shareLink: ShareLinkRecord,
  document: Pick<PublicDocumentRecord, "status" | "expires_at" | "document_links">,
) {
  if (document.expires_at && new Date(document.expires_at).getTime() <= Date.now()) {
    return false;
  }

  if (shareLink.document_visibility === "approved_only") {
    return document.status === "reviewed";
  }

  return (
    (document.status === "linked" || document.status === "reviewed") &&
    (document.document_links?.length ?? 0) > 0
  );
}

function createShareToken() {
  return randomBytes(18).toString("base64url");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");

  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, salt, expectedHash] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !Number.isFinite(iterations) || !salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");

  return safeEqual(actualHash, expectedHash);
}

export function getShareVerificationCookieName(token: string) {
  return `supplier_passport_share_verified_${hashToken(token).slice(0, 24)}`;
}

function createShareVerificationCookieValue(
  token: string,
  shareLink: ShareLinkRecord,
  expiresAt: number,
) {
  const payload = `v1.${shareLink.id}.${expiresAt}`;
  const signature = signShareVerificationPayload(token, payload);

  return `${payload}.${signature}`;
}

export function isValidShareVerificationCookie(
  token: string,
  shareLink: ShareLinkRecord,
  cookieValue?: string,
) {
  if (!cookieValue) {
    return false;
  }

  const parts = cookieValue.split(".");

  if (parts.length !== 4 || parts[0] !== "v1") {
    return false;
  }

  const [, shareLinkId, expiresAtValue, signature] = parts;
  const expiresAt = Number(expiresAtValue);

  if (shareLinkId !== shareLink.id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  try {
    const payload = `v1.${shareLinkId}.${expiresAtValue}`;
    const expectedSignature = signShareVerificationPayload(token, payload);

    return Boolean(signature && expectedSignature) && safeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

function signShareVerificationPayload(token: string, payload: string) {
  const secret = getShareVerificationSecret();

  if (!secret) {
    throw new Error("Share verification signing secret is not configured.");
  }

  return createHmac("sha256", secret).update(`${token}.${payload}`).digest("base64url");
}

function getShareVerificationSecret() {
  return getShareLinkCookieSecret();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
