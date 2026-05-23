import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";
import {
  passportEvidenceTypesBySectionCode,
  type PassportSummaryQuestion,
  type PassportSummarySection,
} from "@/lib/passport-summary";
import { createTextPdf } from "@/lib/pdf/simple-pdf";

type Locale = "en" | "hr" | "de";

type QuestionAnswer = {
  id: string;
  question_item_id: string;
  status: string | null;
};

type SafeCompanyAnswer = {
  question_item_id: string;
  value: unknown;
};

type EvidenceDocument = {
  id: string;
  document_type: string | null;
  status: string | null;
  expires_at: string | null;
};

type DocumentLink = {
  id: string;
  document_id: string;
  question_answer_id: string;
};

type SupplierPassport = {
  id: string;
  readiness_score: number;
  generated_at: string | null;
  updated_at: string;
};

type ExportDataResponse = {
  question_sections: PassportSummarySection[];
  question_items: PassportSummaryQuestion[];
  question_answers: QuestionAnswer[];
  documents: EvidenceDocument[];
  supplier_passports: SupplierPassport[];
};

type DocumentLinksResponse = {
  document_links: DocumentLink[];
};

type SafeCompanyAnswersResponse = {
  question_answers: SafeCompanyAnswer[];
};

const safeCompanyAnswerCodes = [
  "company_reporting_year",
  "company_period_start",
  "company_period_end",
  "company_legal_name",
  "company_country",
  "company_city",
  "company_main_activity",
  "company_reporting_boundary",
] as const;

const safeCompanyAnswerCodeSet = new Set<string>(safeCompanyAnswerCodes);

const exportDataQuery = `
  query GetPassportPdfExportData($organizationId: uuid!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      code
      title
      evidence_required
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      question_item_id
      status
    }
    documents(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      document_type
      status
      expires_at
    }
    supplier_passports(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ generated_at: desc_nulls_last }, { created_at: desc }]
      limit: 1
    ) {
      id
      readiness_score
      generated_at
      updated_at
    }
  }
`;

const safeCompanyAnswersQuery = `
  query GetPassportPdfSafeCompanyAnswers($organizationId: uuid!, $questionItemIds: [uuid!]) {
    question_answers(
      where: {
        organization_id: { _eq: $organizationId }
        question_item_id: { _in: $questionItemIds }
      }
      order_by: { updated_at: desc }
    ) {
      question_item_id
      value
    }
  }
`;

const documentLinksQuery = `
  query GetPassportPdfDocumentLinks($documentIds: [uuid!], $questionAnswerIds: [uuid!]) {
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
    }
  }
`;

export async function GET(request: Request) {
  if (!getNhostGraphqlUrl()) {
    return NextResponse.json({ error: "PDF export is not configured." }, { status: 503 });
  }

  try {
    const user = await requireCurrentUser(request);
    const organization = await getPrimaryOrganizationForUserWithAdmin(user.id);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    const locale = parseLocale(new URL(request.url).searchParams.get("locale"));
    const data = await executeHasuraGraphql<ExportDataResponse>(
      exportDataQuery,
      { organizationId: organization.id },
      { useAdminSecret: true },
    );
    const safeCompanyQuestionItemIds = data.question_items
      .filter((question) => safeCompanyAnswerCodeSet.has(question.code))
      .map((question) => question.id);
    const safeCompanyAnswers = safeCompanyQuestionItemIds.length
      ? await executeHasuraGraphql<SafeCompanyAnswersResponse>(
        safeCompanyAnswersQuery,
        { organizationId: organization.id, questionItemIds: safeCompanyQuestionItemIds },
        { useAdminSecret: true },
      )
      : { question_answers: [] };
    const documentIds = data.documents.map((document) => document.id);
    const questionAnswerIds = data.question_answers.map((answer) => answer.id);
    const links = documentIds.length && questionAnswerIds.length
      ? await executeHasuraGraphql<DocumentLinksResponse>(
        documentLinksQuery,
        { documentIds, questionAnswerIds },
        { useAdminSecret: true },
      )
      : { document_links: [] };
    const report = createReportModel({
      organization,
      data,
      safeCompanyAnswers: safeCompanyAnswers.question_answers,
      documentLinks: links.document_links,
      locale,
    });
    const pdf = createTextPdf(report.title, report.lines, { footerLabel: report.footerLabel });
    const filename = createFilename(organization.slug || organization.name);

    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to export a Supplier Passport PDF." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "We could not generate the PDF right now.", category: classifyExportError(error) },
      { status: 500 },
    );
  }
}

function createReportModel({
  organization,
  data,
  safeCompanyAnswers,
  documentLinks,
  locale,
}: {
  organization: { name: string; slug: string; industry?: string | null; headquarters_city?: string | null; headquarters_country?: string | null };
  data: ExportDataResponse;
  safeCompanyAnswers: SafeCompanyAnswer[];
  documentLinks: DocumentLink[];
  locale: Locale;
}) {
  const labels = pdfLabels[locale];
  const answersByQuestion = new Map(data.question_answers.map((answer) => [answer.question_item_id, answer]));
  const answersById = new Map(data.question_answers.map((answer) => [answer.id, answer]));
  const questionsById = new Map(data.question_items.map((question) => [question.id, question]));
  const linkedAnswerIds = new Set(documentLinks.map((link) => link.question_answer_id));
  const answeredTotal = data.question_items.filter((question) =>
    isAnswerComplete(answersByQuestion.get(question.id)),
  ).length;
  const totalQuestions = data.question_items.length;
  const readinessScore = calculatePercent(answeredTotal, totalQuestions);
  const documentsByCategory = countBy(data.documents, (document) => document.document_type || "other");
  const certificateSummary = summarizeCertificates(data.documents);
  const generatedAt = new Intl.DateTimeFormat(locale).format(new Date());
  const passport = data.supplier_passports[0];
  const safeCompanyAnswerMap = createSafeCompanyAnswerMap(safeCompanyAnswers, questionsById);
  const companyName = safeCompanyAnswerMap.company_legal_name || organization.name;
  const city = safeCompanyAnswerMap.company_city || organization.headquarters_city || "";
  const country = safeCompanyAnswerMap.company_country || organization.headquarters_country || "";
  const location = [city, country].filter(Boolean).join(", ");
  const reportingPeriod = [safeCompanyAnswerMap.company_period_start, safeCompanyAnswerMap.company_period_end]
    .filter(Boolean)
    .join(" - ");
  const sectionRows = data.question_sections.map((section) => {
    const sectionQuestions = data.question_items.filter((question) => question.section_id === section.id);
    const answered = sectionQuestions.filter((question) => isAnswerComplete(answersByQuestion.get(question.id))).length;
    const completion = calculatePercent(answered, sectionQuestions.length);
    const evidenceCount = countEvidenceForSection({
      section,
      documents: data.documents,
      documentLinks,
      answersById,
      questionsById,
    });

    return {
      section,
      answered,
      total: sectionQuestions.length,
      completion,
      evidenceCount,
      evidenceStatus: getEvidenceStatus(answered, evidenceCount, labels),
      status: getSectionStatus(completion, labels),
    };
  });
  const missingEvidenceRows = sectionRows.filter((row) => row.answered > 0 && row.evidenceCount === 0);
  const missingQuestionRows = createMissingQuestionRows({
    sections: data.question_sections,
    questions: data.question_items,
    answersByQuestion,
    labels,
    limit: Math.max(0, 10 - missingEvidenceRows.length),
  });

  return {
    title: `${labels.title} - ${organization.name}`,
    footerLabel: labels.title,
    lines: [
      { text: labels.title, variant: "title" as const },
      { text: companyName, variant: "subtitle" as const },
      { text: `${labels.vsmeAligned}: ${labels.draft}`, variant: "metric" as const },
      { text: `${labels.generated}: ${generatedAt} | ${labels.reportingYear}: ${safeCompanyAnswerMap.company_reporting_year || labels.notProvided}`, variant: "muted" as const },
      { text: passport ? `${labels.lastPassportUpdate}: ${formatDate(passport.generated_at ?? passport.updated_at, locale)}` : `${labels.lastPassportUpdate}: ${labels.notProvided}`, variant: "muted" as const },
      { text: "", variant: "rule" as const },
      { text: labels.readinessSummary, variant: "heading" as const },
      { text: `${labels.overallReadiness}: ${readinessScore}% (${getReadinessLabel(readinessScore, labels)})`, variant: "metric" as const },
      { text: `${labels.answeredQuestions}: ${answeredTotal}/${totalQuestions} | ${labels.uploadedDocuments}: ${data.documents.length} | ${labels.linkedEvidence}: ${linkedAnswerIds.size}`, indent: 10 },
      { text: `${labels.certificateWarnings}: ${certificateSummary.expired + certificateSummary.within30 + certificateSummary.within90}`, indent: 10 },
      { text: labels.scoreExplanation, variant: "note" as const },
      { text: "", variant: "rule" as const },
      { text: labels.disclaimerTitle, variant: "heading" as const },
      { text: labels.disclaimer, variant: "note" as const },
      { text: labels.buyerEvidenceNote, variant: "note" as const },
      { text: "", variant: "rule" as const },
      { text: labels.company, variant: "heading" as const },
      { text: `${labels.organization}: ${companyName}`, indent: 10 },
      { text: `${labels.industry}: ${safeCompanyAnswerMap.company_main_activity || organization.industry || labels.notProvided}`, indent: 10 },
      { text: `${labels.headquarters}: ${location || labels.notProvided}`, indent: 10 },
      { text: `${labels.reportingPeriod}: ${reportingPeriod || labels.notProvided}`, indent: 10 },
      { text: `${labels.reportingBoundary}: ${safeCompanyAnswerMap.company_reporting_boundary || labels.notProvided}`, indent: 10 },
      { text: "", variant: "rule" as const },
      { text: labels.sectionSummary, variant: "heading" as const },
      ...sectionRows.map((row) => ({
        text: `${translateSection(row.section.code, row.section.title, labels)} | ${getSectionMapping(row.section.code, labels)} | ${row.answered}/${row.total} (${row.completion}%) | ${row.status} | ${row.evidenceStatus}`,
        indent: 10,
      })),
      { text: "", variant: "rule" as const },
      { text: labels.evidenceSummary, variant: "heading" as const },
      { text: `${labels.uploadedDocuments}: ${data.documents.length} | ${labels.evidenceMissingCount}: ${missingEvidenceRows.length}`, variant: "metric" as const },
      ...Object.entries(documentsByCategory).map(([category, count]) => ({
        text: `${translateDocumentCategory(category, labels)}: ${count}`,
        indent: 10,
      })),
      ...(data.documents.length === 0 ? [{ text: labels.noEvidenceSummary, variant: "note" as const }] : []),
      { text: labels.privateEvidenceNote, variant: "note" as const },
      { text: "", variant: "rule" as const },
      { text: labels.certificateSummary, variant: "heading" as const },
      { text: `${labels.certificatesExpired}: ${certificateSummary.expired} | ${labels.certificatesWithin30}: ${certificateSummary.within30} | ${labels.certificatesWithin90}: ${certificateSummary.within90}`, variant: "metric" as const },
      ...(certificateSummary.expired + certificateSummary.within30 + certificateSummary.within90 === 0
        ? [{ text: labels.noExpiringCertificates }]
        : []),
      { text: "", variant: "rule" as const },
      { text: labels.missingData, variant: "heading" as const },
      ...(missingEvidenceRows.length || missingQuestionRows.length
        ? [
          ...missingEvidenceRows.slice(0, 10).map((row) => ({
            text: `${translateSection(row.section.code, row.section.title, labels)}: ${labels.evidenceMissing}`,
            indent: 10,
          })),
          ...missingQuestionRows,
        ]
        : [{ text: labels.noPriorityGaps, variant: "note" as const }]),
      { text: "", variant: "rule" as const },
      { text: labels.limitationsTitle, variant: "heading" as const },
      { text: labels.limitations, variant: "note" as const },
      { text: `${labels.footer}: ${generatedAt} | Supplier Passport | ${labels.footerDisclaimer}`, variant: "footer" as const },
    ],
  };
}

function isAnswerComplete(answer: QuestionAnswer | undefined) {
  return Boolean(answer && ["completed", "reviewed", "needs_evidence"].includes(answer.status || ""));
}

function calculatePercent(answered: number, total: number) {
  return total > 0 ? Math.round((answered / total) * 100) : 0;
}

function summarizeCertificates(documents: EvidenceDocument[]) {
  const result = { expired: 0, within30: 0, within90: 0 };

  for (const document of documents) {
    if (document.document_type !== "certificate" || !document.expires_at) {
      continue;
    }

    const days = getDaysUntilDate(document.expires_at);

    if (days === null) {
      continue;
    }

    if (days < 0) {
      result.expired += 1;
    } else if (days <= 30) {
      result.within30 += 1;
    } else if (days <= 90) {
      result.within90 += 1;
    }
  }

  return result;
}

function createSafeCompanyAnswerMap(
  answers: SafeCompanyAnswer[],
  questionsById: Map<string, PassportSummaryQuestion>,
) {
  return answers.reduce<Record<string, string>>((accumulator, answer) => {
    const code = questionsById.get(answer.question_item_id)?.code;
    const text = answerValueToText(answer.value);

    if (code && safeCompanyAnswerCodeSet.has(code) && text && !accumulator[code]) {
      accumulator[code] = text;
    }

    return accumulator;
  }, {});
}

function answerValueToText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(answerValueToText).filter(Boolean).join(", ");
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function countEvidenceForSection({
  section,
  documents,
  documentLinks,
  answersById,
  questionsById,
}: {
  section: PassportSummarySection;
  documents: EvidenceDocument[];
  documentLinks: DocumentLink[];
  answersById: Map<string, QuestionAnswer>;
  questionsById: Map<string, PassportSummaryQuestion>;
}) {
  const sectionEvidenceTypes = new Set(passportEvidenceTypesBySectionCode[section.code] ?? []);

  return documents.filter((document) => {
    const typeMatch = document.document_type ? sectionEvidenceTypes.has(document.document_type) : false;
    const linkedMatch = documentLinks.some((link) => {
      if (link.document_id !== document.id) {
        return false;
      }

      const answer = answersById.get(link.question_answer_id);
      const question = answer ? questionsById.get(answer.question_item_id) : undefined;

      return question?.section_id === section.id;
    });

    return typeMatch || linkedMatch;
  }).length;
}

function createMissingQuestionRows({
  sections,
  questions,
  answersByQuestion,
  labels,
  limit,
}: {
  sections: PassportSummarySection[];
  questions: PassportSummaryQuestion[];
  answersByQuestion: Map<string, QuestionAnswer>;
  labels: PdfLabels;
  limit: number;
}) {
  if (limit <= 0) {
    return [];
  }

  const sectionsById = new Map(sections.map((section) => [section.id, section]));

  return questions
    .filter((question) => !isAnswerComplete(answersByQuestion.get(question.id)))
    .sort((a, b) => Number(Boolean(b.evidence_required)) - Number(Boolean(a.evidence_required)))
    .slice(0, limit)
    .map((question) => {
      const section = sectionsById.get(question.section_id);
      const sectionLabel = section ? translateSection(section.code, section.title, labels) : labels.unknownSection;
      const reason = question.evidence_required ? labels.recommendedEvidence : labels.missingAnswer;

      return { text: `${sectionLabel}: ${question.title} - ${reason}`, indent: 10 };
    });
}

function getEvidenceStatus(answered: number, evidenceCount: number, labels: PdfLabels) {
  if (evidenceCount > 0) {
    return labels.evidenceAvailable;
  }

  if (answered > 0) {
    return labels.evidenceMissing;
  }

  return labels.evidenceRecommended;
}

function getSectionStatus(completion: number, labels: PdfLabels) {
  if (completion >= 100) {
    return labels.completed;
  }

  if (completion > 0) {
    return labels.inProgress;
  }

  return labels.notStarted;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    const key = getKey(item);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
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

function createFilename(slugOrName: string) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = slugOrName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "supplier";

  return `supplier-passport-${slug}-${date}.pdf`;
}

function parseLocale(value: string | null): Locale {
  return value === "hr" || value === "de" || value === "en" ? value : "en";
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

function classifyExportError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "env_missing";
  }

  if (message.includes("permission") || message.includes("unauthorized")) {
    return "permission_denied";
  }

  return "pdf_export_error";
}

function translateSection(code: string, fallback: string, labels: PdfLabels) {
  return (labels.sections as Record<string, string>)[code] ?? fallback;
}

function translateDocumentCategory(category: string, labels: PdfLabels) {
  return (labels.documentCategories as Record<string, string>)[category] ?? category.replace(/_/g, " ");
}

function getSectionMapping(code: string, labels: PdfLabels) {
  return (labels.sectionMappings as Record<string, string>)[code] ?? "VSME-aligned / Supplier Passport";
}

type PdfLabels = typeof pdfLabels.en;

const pdfLabels = {
  en: {
    title: "Supplier Passport draft",
    draft: "VSME-aligned readiness summary",
    generated: "Generated",
    vsmeAligned: "VSME-aligned",
    lastPassportUpdate: "Passport data timestamp",
    notProvided: "Not provided yet",
    reportingYear: "Reporting year",
    reportingPeriod: "Reporting period",
    reportingBoundary: "Reporting boundary",
    disclaimerTitle: "Important disclaimer",
    disclaimer:
      "Supplier Passport is a VSME-aligned supplier readiness summary based on supplier-provided information and evidence metadata. It is not an audit opinion, legal certification, or assurance report.",
    buyerEvidenceNote: "Buyers may request supporting evidence separately.",
    company: "Company",
    organization: "Organization",
    industry: "Industry",
    headquarters: "Headquarters",
    readinessSummary: "Readiness summary",
    overallReadiness: "Overall readiness",
    scoreExplanation: "This score reflects completed questionnaire items and available evidence metadata. It is a readiness indicator, not an audit result.",
    answeredQuestions: "Answered questions",
    linkedEvidence: "Linked evidence items",
    sectionSummary: "Section summary",
    evidenceAvailable: "evidence available",
    evidenceMissing: "evidence missing",
    evidenceRecommended: "evidence recommended",
    evidenceSummary: "Evidence summary",
    noEvidenceSummary: "No evidence summary available yet.",
    uploadedDocuments: "Uploaded documents",
    evidenceMissingCount: "Sections with recommended missing evidence",
    privateEvidenceNote: "Private evidence files are not embedded in this PDF and are not downloadable from it unless shared separately.",
    certificateSummary: "Certificate expiry summary",
    certificateWarnings: "Certificate expiry warnings",
    certificatesExpired: "Expired certificates",
    certificatesWithin30: "Certificates expiring within 30 days",
    certificatesWithin90: "Certificates expiring within 90 days",
    noExpiringCertificates: "No expiring certificates were identified from available expiry dates.",
    missingData: "Missing or recommended data",
    recommendedEvidence: "recommended evidence",
    missingAnswer: "missing answer",
    noPriorityGaps: "No priority missing data items were identified from the current questionnaire state.",
    footer: "Generated",
    footerDisclaimer: "Supplier-provided readiness draft, not an assurance report",
    unknownSection: "Unknown section",
    limitationsTitle: "Notes and limitations",
    limitations:
      "This draft is based on data available at generation time. Buyers may request supporting evidence separately. This PDF does not include private document URLs, storage identifiers, raw sensitive answers, or user/member data.",
    notStarted: "Not started",
    completed: "Completed",
    needsAttention: "Needs attention",
    inProgress: "In progress",
    buyerReadyDraft: "Buyer-ready draft",
    strongReadiness: "Strong readiness",
    sections: {
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
    },
    sectionMappings: {
      company_basics: "VSME B1 / Supplier identity",
      employees: "VSME B8-B10",
      energy: "VSME B3",
      fuel: "VSME B3 / transport energy detail",
      waste: "VSME B7",
      environmental_policies: "VSME B2, B4-B6",
      health_safety: "VSME B9",
      certifications: "Supplier Passport evidence",
      governance: "VSME B11 / governance readiness",
      supplier_information: "Supplier Passport value-chain readiness",
    },
    documentCategories: {
      certificate: "Certifications",
      utility_bill: "Energy / utility documents",
      policy: "Policies",
      waste_report: "Waste documentation",
      safety: "Health and safety",
      customer_questionnaire: "Supplier information",
      other: "Other",
      report: "Reports",
      training: "Training",
    },
  },
  hr: {
    title: "Supplier Passport nacrt",
    draft: "Sažetak spremnosti usklađen s VSME okvirom",
    generated: "Generirano",
    vsmeAligned: "Usklađeno s VSME okvirom",
    lastPassportUpdate: "Vremenska oznaka Passport podataka",
    notProvided: "Još nije uneseno",
    reportingYear: "Izvještajna godina",
    reportingPeriod: "Izvještajno razdoblje",
    reportingBoundary: "Granica izvještavanja",
    disclaimerTitle: "Važna napomena",
    disclaimer:
      "Supplier Passport je sažetak spremnosti dobavljača usklađen s VSME okvirom, temeljen na podacima i metapodacima dokazne dokumentacije koje je dostavio dobavljač. Nije revizijsko mišljenje, pravni certifikat niti izvješće s neovisnim uvjerenjem.",
    buyerEvidenceNote: "Kupci mogu zasebno zatražiti dokaznu dokumentaciju.",
    company: "Tvrtka",
    organization: "Organizacija",
    industry: "Djelatnost",
    headquarters: "Sjedište",
    readinessSummary: "Sažetak spremnosti",
    overallReadiness: "Ukupna spremnost",
    scoreExplanation: "Ovaj rezultat odražava ispunjene stavke upitnika i dostupne metapodatke dokazne dokumentacije. To je pokazatelj spremnosti, a ne rezultat revizije.",
    answeredQuestions: "Ispunjene stavke",
    linkedEvidence: "Povezani dokazi",
    sectionSummary: "Sažetak sekcija",
    evidenceAvailable: "dokazna dokumentacija dostupna",
    evidenceMissing: "nedostaje dokazna dokumentacija",
    evidenceRecommended: "preporučuje se dokazna dokumentacija",
    evidenceSummary: "Sažetak dokazne dokumentacije",
    noEvidenceSummary: "Sažetak dokazne dokumentacije još nije dostupan.",
    uploadedDocuments: "Učitanih dokumenata",
    evidenceMissingCount: "Sekcije s preporučenom dokaznom dokumentacijom koja nedostaje",
    privateEvidenceNote: "Privatni dokazni dokumenti nisu ugrađeni u ovaj PDF i nisu dostupni za preuzimanje iz njega, osim ako se zasebno podijele.",
    certificateSummary: "Sažetak isteka certifikata",
    certificateWarnings: "Upozorenja o isteku certifikata",
    certificatesExpired: "Istekli certifikati",
    certificatesWithin30: "Certifikati koji istjecu unutar 30 dana",
    certificatesWithin90: "Certifikati koji istjecu unutar 90 dana",
    noExpiringCertificates: "Nisu pronađeni certifikati koji uskoro istječu prema dostupnim datumima isteka.",
    missingData: "Nedostajući ili preporučeni podaci",
    recommendedEvidence: "preporučena dokazna dokumentacija",
    missingAnswer: "nedostaje odgovor",
    noPriorityGaps: "Nisu pronadene prioritetne stavke koje nedostaju u trenutnom stanju upitnika.",
    footer: "Generirano",
    footerDisclaimer: "Nacrt spremnosti temeljen na podacima dobavljača, nije izvješće s neovisnim uvjerenjem",
    unknownSection: "Nepoznata sekcija",
    limitationsTitle: "Napomene i ograničenja",
    limitations:
      "Ovaj nacrt temelji se na podacima dostupnima u trenutku generiranja. Kupci mogu zasebno zatražiti dokaznu dokumentaciju. PDF ne uključuje privatne URL-ove dokumenata, identifikatore pohrane, osjetljive sirove odgovore ni podatke o korisnicima/članovima.",
    notStarted: "Nije započeto",
    completed: "Dovršeno",
    needsAttention: "Potrebna dorada",
    inProgress: "U tijeku",
    buyerReadyDraft: "Nacrt spreman za kupce",
    strongReadiness: "Visoka spremnost",
    sections: {
      company_basics: "Osnovni podaci",
      employees: "Zaposlenici",
      energy: "Energija",
      fuel: "Gorivo",
      waste: "Otpad",
      environmental_policies: "Okolišne politike",
      health_safety: "Zdravlje i sigurnost",
      certifications: "Certifikati",
      governance: "Upravljanje",
      supplier_information: "Podaci o dobavljačima",
    },
    sectionMappings: {
      company_basics: "VSME B1 / Identitet dobavljača",
      employees: "VSME B8-B10",
      energy: "VSME B3",
      fuel: "VSME B3 / detalji energije za transport",
      waste: "VSME B7",
      environmental_policies: "VSME B2, B4-B6",
      health_safety: "VSME B9",
      certifications: "Supplier Passport dokazi",
      governance: "VSME B11 / spremnost upravljanja",
      supplier_information: "Supplier Passport spremnost lanca vrijednosti",
    },
    documentCategories: {
      certificate: "Certifikati",
      utility_bill: "Energetski dokumenti",
      policy: "Politike",
      waste_report: "Dokumentacija o otpadu",
      safety: "Zdravlje i sigurnost",
      customer_questionnaire: "Podaci o dobavljačima",
      other: "Ostalo",
      report: "Izvješća",
      training: "Edukacije",
    },
  },
  de: {
    title: "Supplier Passport Entwurf",
    draft: "VSME-orientierte Bereitschaftszusammenfassung",
    generated: "Erstellt",
    vsmeAligned: "VSME-orientiert",
    lastPassportUpdate: "Zeitpunkt der Passport-Daten",
    notProvided: "Noch nicht angegeben",
    reportingYear: "Berichtsjahr",
    reportingPeriod: "Berichtszeitraum",
    reportingBoundary: "Berichtsgrenze",
    disclaimerTitle: "Wichtiger Hinweis",
    disclaimer:
      "Der Supplier Passport ist eine VSME-orientierte Zusammenfassung der Lieferantenbereitschaft auf Basis von Lieferantenangaben und Nachweis-Metadaten. Er ist kein Prufungsurteil, keine rechtliche Zertifizierung und kein Assurance-Bericht.",
    buyerEvidenceNote: "Kaufer konnen unterstutzende Nachweise separat anfordern.",
    company: "Unternehmen",
    organization: "Organisation",
    industry: "Branche",
    headquarters: "Sitz",
    readinessSummary: "Zusammenfassung der Bereitschaft",
    overallReadiness: "Gesamtbereitschaft",
    scoreExplanation: "Dieser Wert basiert auf ausgefullten Fragebogenpunkten und verfugbaren Nachweis-Metadaten. Er ist ein Bereitschaftsindikator, kein Prufungsergebnis.",
    answeredQuestions: "Ausgefullte Punkte",
    linkedEvidence: "Verknupfte Nachweise",
    sectionSummary: "Abschnittsubersicht",
    evidenceAvailable: "Nachweise verfugbar",
    evidenceMissing: "Nachweise fehlen",
    evidenceRecommended: "Nachweise empfohlen",
    evidenceSummary: "Nachweiszusammenfassung",
    noEvidenceSummary: "Noch keine Nachweiszusammenfassung verfugbar.",
    uploadedDocuments: "Hochgeladene Dokumente",
    evidenceMissingCount: "Abschnitte mit empfohlenen fehlenden Nachweisen",
    privateEvidenceNote: "Private Nachweisdateien sind nicht in dieses PDF eingebettet und konnen daraus nicht heruntergeladen werden, sofern sie nicht separat geteilt werden.",
    certificateSummary: "Zusammenfassung der Zertifikatslaufzeiten",
    certificateWarnings: "Warnungen zu Zertifikatslaufzeiten",
    certificatesExpired: "Abgelaufene Zertifikate",
    certificatesWithin30: "Zertifikate, die innerhalb von 30 Tagen ablaufen",
    certificatesWithin90: "Zertifikate, die innerhalb von 90 Tagen ablaufen",
    noExpiringCertificates: "Aus den verfugbaren Ablaufdaten wurden keine bald ablaufenden Zertifikate erkannt.",
    missingData: "Fehlende oder empfohlene Angaben",
    recommendedEvidence: "empfohlene Nachweise",
    missingAnswer: "fehlende Antwort",
    noPriorityGaps: "Im aktuellen Fragebogenstatus wurden keine priorisierten fehlenden Angaben erkannt.",
    footer: "Erstellt am",
    footerDisclaimer: "Lieferantenbasierter Bereitschaftsentwurf, kein Assurance-Bericht",
    unknownSection: "Unbekannter Abschnitt",
    limitationsTitle: "Hinweise und Einschrankungen",
    limitations:
      "Dieser Entwurf basiert auf den zum Erstellungszeitpunkt verfugbaren Daten. Kaufer konnen unterstutzende Nachweise separat anfordern. Dieses PDF enthalt keine privaten Dokument-URLs, Speicher-IDs, sensiblen Rohantworten oder Benutzer-/Mitgliedsdaten.",
    notStarted: "Nicht begonnen",
    completed: "Abgeschlossen",
    needsAttention: "Handlungsbedarf",
    inProgress: "In Bearbeitung",
    buyerReadyDraft: "Kauferbereiter Entwurf",
    strongReadiness: "Hohe Bereitschaft",
    sections: {
      company_basics: "Unternehmensdaten",
      employees: "Beschaftigte",
      energy: "Energie",
      fuel: "Kraftstoffe",
      waste: "Abfall",
      environmental_policies: "Umweltpolitik",
      health_safety: "Gesundheit und Sicherheit",
      certifications: "Zertifikate",
      governance: "Governance",
      supplier_information: "Lieferantendaten",
    },
    sectionMappings: {
      company_basics: "VSME B1 / Lieferantenidentitat",
      employees: "VSME B8-B10",
      energy: "VSME B3",
      fuel: "VSME B3 / Detail zu Transportenergie",
      waste: "VSME B7",
      environmental_policies: "VSME B2, B4-B6",
      health_safety: "VSME B9",
      certifications: "Supplier Passport Nachweise",
      governance: "VSME B11 / Governance-Bereitschaft",
      supplier_information: "Supplier Passport Wertschopfungsbereitschaft",
    },
    documentCategories: {
      certificate: "Zertifikate",
      utility_bill: "Energie- / Versorgungsdokumente",
      policy: "Richtlinien",
      waste_report: "Abfalldokumentation",
      safety: "Gesundheit und Sicherheit",
      customer_questionnaire: "Lieferantendaten",
      other: "Sonstiges",
      report: "Berichte",
      training: "Schulungen",
    },
  },
} satisfies Record<Locale, {
  title: string;
  draft: string;
  generated: string;
  vsmeAligned: string;
  lastPassportUpdate: string;
  notProvided: string;
  reportingYear: string;
  reportingPeriod: string;
  reportingBoundary: string;
  disclaimerTitle: string;
  disclaimer: string;
  buyerEvidenceNote: string;
  company: string;
  organization: string;
  industry: string;
  headquarters: string;
  readinessSummary: string;
  overallReadiness: string;
  scoreExplanation: string;
  answeredQuestions: string;
  linkedEvidence: string;
  sectionSummary: string;
  evidenceAvailable: string;
  evidenceMissing: string;
  evidenceRecommended: string;
  evidenceSummary: string;
  noEvidenceSummary: string;
  uploadedDocuments: string;
  evidenceMissingCount: string;
  privateEvidenceNote: string;
  certificateSummary: string;
  certificateWarnings: string;
  certificatesExpired: string;
  certificatesWithin30: string;
  certificatesWithin90: string;
  noExpiringCertificates: string;
  missingData: string;
  recommendedEvidence: string;
  missingAnswer: string;
  noPriorityGaps: string;
  footer: string;
  footerDisclaimer: string;
  unknownSection: string;
  limitationsTitle: string;
  limitations: string;
  notStarted: string;
  completed: string;
  needsAttention: string;
  inProgress: string;
  buyerReadyDraft: string;
  strongReadiness: string;
  sections: Record<string, string>;
  sectionMappings: Record<string, string>;
  documentCategories: Record<string, string>;
}>;

function getReadinessLabel(score: number, labels: PdfLabels) {
  if (score >= 90) {
    return labels.strongReadiness;
  }

  if (score >= 70) {
    return labels.buyerReadyDraft;
  }

  if (score >= 40) {
    return labels.inProgress;
  }

  return labels.needsAttention;
}
