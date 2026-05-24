"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Download, Link2, Sparkles } from "lucide-react";
import { ApprovedDocumentsTable } from "@/components/passport/approved-documents-table";
import { MissingDataChecklist } from "@/components/passport/missing-data-checklist";
import { PassportCompanySummary } from "@/components/passport/passport-company-summary";
import { PassportDisclaimer } from "@/components/passport/passport-disclaimer";
import { PassportReadinessSummary } from "@/components/passport/passport-readiness-summary";
import { PassportSectionCard } from "@/components/passport/passport-section-card";
import { ShareSettingsPreview } from "@/components/passport/share-settings-preview";
import { ContextualHelpCard } from "@/components/onboarding/contextual-help";
import { SectionCard } from "@/components/shared/section-card";
import { StateCard } from "@/components/shared/state-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  PassportApprovedDocument,
  PassportChecklistItem,
  PassportCompanyProfile,
  PassportReadinessModule,
  PassportSection,
  PassportShareSetting,
} from "@/lib/mock-data";
import {
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { markPassportChecklistProgress } from "@/lib/passport-checklist-progress";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";
import {
  calculatePassportReadinessScore,
  createCertificateExpiryItems,
  createMissingDataItems,
  createMissingEvidenceItems,
  createPassportReadinessModules,
  createPassportSectionSummaries,
} from "@/lib/passport-summary";
import { buildCompanyProfileSummary } from "@/lib/company-profile-summary";

type CurrentOrganizationPayload = {
  organization?: OrganizationRecord | null;
  error?: string;
};

type OrganizationRecord = {
  id: string;
  name: string;
  vat_id: string | null;
  industry: string | null;
  employee_count_range: string | null;
  headquarters_city: string | null;
  headquarters_country: string | null;
  countries_served: string[] | null;
  is_verified: boolean;
  logoUrl?: string | null;
  logoAltText?: string | null;
};

type QuestionnairePayload = {
  sections?: QuestionSectionRecord[];
  items?: QuestionItemRecord[];
  answers?: QuestionAnswerRecord[];
  documents?: EvidenceDocumentRecord[];
  documentLinks?: DocumentLinkRecord[];
};

type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
};

type QuestionItemRecord = {
  id: string;
  section_id: string;
  code: string;
  title: string;
  answer_type: string;
  evidence_required: boolean;
};

type QuestionAnswerRecord = {
  id: string;
  question_item_id: string;
  value: unknown;
  status: "not_started" | "in_progress" | "completed" | "needs_evidence" | "reviewed";
};

type EvidenceDocumentRecord = {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  expires_at?: string | null;
  linked_question_answer_ids?: string[];
};

type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
};

type ShareLinkPayload = {
  configured?: boolean;
  publicUrl?: string | null;
  shareUrl?: string;
  error?: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type CopyState = "idle" | "copying" | "copied" | "error";

type PassportPageClientProps = {
  labels?: PassportLabels;
};

export function PassportPageClient({
  labels = defaultPassportLabels,
}: PassportPageClientProps) {
  const locale = useLocale();
  const [companyProfile, setCompanyProfile] = useState<PassportCompanyProfile>(() =>
    createEmptyCompanyProfile(labels),
  );
  const [readiness, setReadiness] = useState<{ score: number; modules: PassportReadinessModule[] }>(
    () => createEmptyReadiness(),
  );
  const [sections, setSections] = useState<PassportSection[]>([]);
  const [approvedDocuments, setApprovedDocuments] = useState<PassportApprovedDocument[]>([]);
  const [missingDataChecklist, setMissingDataChecklist] = useState<PassportChecklistItem[]>([]);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestPassport() {
      const session = await getFreshBrowserNhostSession();

      if (!session?.accessToken) {
        return;
      }

      try {
        const [organizationResponse, questionnaireResponse] = await Promise.all([
          fetch("/api/organizations/current", {
            method: "POST",
            headers: { authorization: `Bearer ${session.accessToken}` },
          }),
          fetch("/api/questionnaire", {
            method: "GET",
            headers: { authorization: `Bearer ${session.accessToken}` },
          }),
        ]);
        const organizationPayload =
          (await organizationResponse.json()) as CurrentOrganizationPayload;
        const questionnairePayload =
          (await questionnaireResponse.json()) as QuestionnairePayload;

        if (cancelled) {
          return;
        }

        if (organizationResponse.ok && organizationPayload.organization) {
          const organization = organizationPayload.organization;
          const questionSections = questionnairePayload.sections ?? [];
          const questionItems = questionnairePayload.items ?? [];
          const questionAnswers = questionnairePayload.answers ?? [];
          const documents = attachQuestionLinksToDocuments(
            questionnairePayload.documents ?? [],
            questionnairePayload.documentLinks ?? [],
          );

          setCurrentOrganizationId(organization.id);
          markPassportChecklistProgress(organization.id, { passportViewed: true });
          setCompanyProfile(createCompanyProfile(organization, questionnairePayload, labels));
          setReadiness({
            score: calculatePassportReadinessScore(questionItems, questionAnswers),
            modules: createPassportReadinessModules(questionSections, questionItems, questionAnswers),
          });
          setSections(
            createPassportSectionSummaries(questionSections, questionItems, questionAnswers, documents),
          );
          setApprovedDocuments(createApprovedDocuments(documents));
          setMissingDataChecklist([
            ...createCertificateExpiryItems(documents, {
              expired: labels.certificateExpired,
              within30Days: labels.certificateExpiresWithin30Days,
              within90Days: labels.certificateExpiresWithin90Days,
            }),
            ...createMissingEvidenceItems(
              questionSections,
              questionItems,
              questionAnswers,
              documents,
              labels.evidenceMissingBySection,
            ),
            ...createMissingDataItems(questionSections, questionItems, questionAnswers),
          ].slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setMessage({ tone: "info", text: labels.draftStateText });
        }
      }
    }

    void loadLatestPassport();

    return () => {
      cancelled = true;
    };
  }, [labels]);

  const readinessView = useMemo(
    () => readiness,
    [readiness],
  );

  async function handleGeneratePassport() {
    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      setMessage({ tone: "info", text: labels.draftStateText });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      const [organizationResponse, questionnaireResponse] = await Promise.all([
        fetch("/api/organizations/current", {
          method: "POST",
          headers: { authorization: `Bearer ${session.accessToken}` },
        }),
        fetch("/api/questionnaire", {
          method: "GET",
          headers: { authorization: `Bearer ${session.accessToken}` },
        }),
      ]);

      const organizationPayload =
        (await organizationResponse.json()) as CurrentOrganizationPayload;
      const questionnairePayload =
        (await questionnaireResponse.json()) as QuestionnairePayload;

      if (!organizationResponse.ok || !organizationPayload.organization || !questionnaireResponse.ok) {
        throw new Error(labels.generateError);
      }

      const organization = organizationPayload.organization;
      const questionSections = questionnairePayload.sections ?? [];
      const questionItems = questionnairePayload.items ?? [];
      const questionAnswers = questionnairePayload.answers ?? [];
      const documents = attachQuestionLinksToDocuments(
        questionnairePayload.documents ?? [],
        questionnairePayload.documentLinks ?? [],
      );

      setCurrentOrganizationId(organization.id);
      markPassportChecklistProgress(organization.id, { passportViewed: true });
      setCompanyProfile(createCompanyProfile(organization, questionnairePayload, labels));
      setReadiness({
        score: calculatePassportReadinessScore(questionItems, questionAnswers),
        modules: createPassportReadinessModules(questionSections, questionItems, questionAnswers),
      });
      setSections(
        createPassportSectionSummaries(questionSections, questionItems, questionAnswers, documents),
      );
      setApprovedDocuments(createApprovedDocuments(documents));
      setMissingDataChecklist([
        ...createCertificateExpiryItems(documents, {
          expired: labels.certificateExpired,
          within30Days: labels.certificateExpiresWithin30Days,
          within90Days: labels.certificateExpiresWithin90Days,
        }),
        ...createMissingEvidenceItems(
          questionSections,
          questionItems,
          questionAnswers,
          documents,
          labels.evidenceMissingBySection,
        ),
        ...createMissingDataItems(questionSections, questionItems, questionAnswers),
      ].slice(0, 5));
      setMessage({ tone: "success", text: labels.generateSuccess });
    } catch {
      setMessage({ tone: "error", text: labels.generateError });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreateShareLink(values: ShareLinkFormValues) {
    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      setMessage({ tone: "info", text: labels.draftStateText });
      return;
    }

    setIsCreatingShare(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/passport/share-link?locale=${encodeURIComponent(locale)}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          action: "create",
          buyerName: values.buyerName,
          buyerEmail: values.buyerEmail,
          expiresAt: values.expiresAt,
          password: values.password,
          passwordProtected: values.passwordProtected,
          documentVisibility: values.documentVisibility,
        }),
      });
      const payload = (await response.json()) as ShareLinkPayload;
      const publicUrl = payload.publicUrl ?? payload.shareUrl ?? "";

      if (!response.ok || payload.configured === false || !publicUrl) {
        throw new Error(payload.error || labels.shareLinkError);
      }

      setShareUrl(publicUrl);
      setMessage({ tone: "success", text: labels.shareLinkSuccess });
    } catch {
      setMessage({ tone: "error", text: labels.shareLinkError });
    } finally {
      setIsCreatingShare(false);
    }
  }

  async function handleExportPdf() {
    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      setMessage({ tone: "error", text: labels.exportPdfError });
      return;
    }

    setIsExportingPdf(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/passport/export/pdf?locale=${encodeURIComponent(locale)}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(labels.exportPdfError);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = readFilenameFromContentDisposition(disposition) || "supplier-passport.pdf";
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      markPassportChecklistProgress(currentOrganizationId, { pdfDownloaded: true });
      setMessage({ tone: "success", text: labels.exportPdfSuccess });
    } catch {
      setMessage({ tone: "error", text: labels.exportPdfError });
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:flex">
          <Button
            className="h-11 rounded-xl px-5 shadow-soft"
            disabled={isGenerating}
            onClick={handleGeneratePassport}
          >
            <Sparkles data-icon="inline-start" />
            {isGenerating ? labels.generatingPassport : labels.generatePassport}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl bg-white px-5"
            onClick={() => setIsShareOpen(true)}
          >
            <Link2 data-icon="inline-start" />
            {labels.createShareLink}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl bg-white px-5"
            disabled={isExportingPdf}
            onClick={handleExportPdf}
            data-tour="passport-pdf"
          >
            <Download data-icon="inline-start" />
            {isExportingPdf ? labels.exportPdfGenerating : labels.exportPdf}
          </Button>
        </div>
      </div>

      {message ? (
        <StateCard title={message.text} description="" tone={message.tone === "error" ? "warning" : message.tone} />
      ) : (
        <StateCard title={labels.noPassportTitle} description={labels.noPassportText} tone="info" />
      )}

      <ContextualHelpCard
        title={labels.contextualHelp.title}
        text={`${labels.contextualHelp.text} ${labels.contextualHelp.disclaimer}`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-w-0 flex-col gap-6">
          <PassportCompanySummary profile={companyProfile} labels={labels} />
          <PassportReadinessSummary
            score={readinessView.score}
            modules={readinessView.modules}
            labels={labels}
          />
          <SectionCard
            title={labels.passportSections}
            description={labels.passportSectionsDescription}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {sections.map((section) => (
                <PassportSectionCard key={section.title} section={section} labels={labels} />
              ))}
            </div>
          </SectionCard>
          <ApprovedDocumentsTable documents={approvedDocuments} labels={labels} />
        </main>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-28 xl:self-start">
          <MissingDataChecklist items={missingDataChecklist} labels={labels} />
          <ShareSettingsPreview settings={createShareSettings()} labels={labels} />
          <PassportDisclaimer title={labels.notCertificationTitle} text={labels.notCertificationText} />
        </aside>
      </div>

      <CreateShareLinkDialog
        open={isShareOpen}
        isSaving={isCreatingShare}
        shareUrl={shareUrl}
        labels={labels}
        onOpenChange={setIsShareOpen}
        onSubmit={handleCreateShareLink}
      />
    </div>
  );
}

function createEmptyCompanyProfile(labels: PassportLabels): PassportCompanyProfile {
  return {
    name: labels.notProvided,
    verified: false,
    logoUrl: null,
    logoAltText: null,
    industries: [],
    countriesServed: labels.notProvided,
    employeeCount: labels.notProvided,
    headquarters: labels.notProvided,
    certifications: [],
  };
}

function createEmptyReadiness() {
  return {
    score: 0,
    modules: [
      { label: "Basic Information", value: 0 },
      { label: "Environment", value: 0 },
      { label: "Social", value: 0 },
      { label: "Governance", value: 0 },
    ],
  };
}

function createCompanyProfile(
  organization: OrganizationRecord,
  questionnaire: QuestionnairePayload,
  labels: PassportLabels,
): PassportCompanyProfile {
  const summary = buildCompanyProfileSummary({
    organization,
    answersByCode: mapAnswerValuesByQuestionCode(questionnaire),
  });

  return {
    name: summary.organizationName || labels.notProvided,
    verified: organization.is_verified,
    logoUrl: organization.logoUrl ?? summary.logoUrl ?? null,
    logoAltText: organization.logoAltText ?? summary.logoAltText ?? summary.organizationName ?? null,
    industries: summary.industry ? [summary.industry] : [],
    countriesServed: summary.countriesServed || labels.notProvided,
    employeeCount: summary.employeeCount || labels.notProvided,
    headquarters: summary.headquarters || labels.notProvided,
    certifications: summary.keyCertifications,
  };
}

function createApprovedDocuments(documents: EvidenceDocumentRecord[]): PassportApprovedDocument[] {
  return documents
    .filter((document) => document.status === "reviewed")
    .map((document) => ({
      id: document.id,
      name: document.file_name,
      category: document.document_type,
      status: "Available",
      linkedSections: [],
    }));
}

function attachQuestionLinksToDocuments(
  documents: EvidenceDocumentRecord[],
  documentLinks: DocumentLinkRecord[],
): EvidenceDocumentRecord[] {
  const answerIdsByDocument = documentLinks.reduce<Record<string, string[]>>((accumulator, link) => {
    accumulator[link.document_id] = [
      ...(accumulator[link.document_id] ?? []),
      link.question_answer_id,
    ];

    return accumulator;
  }, {});

  return documents.map((document) => ({
    ...document,
    linked_question_answer_ids: answerIdsByDocument[document.id] ?? [],
  }));
}

function createShareSettings(): PassportShareSetting[] {
  return [
    { label: "Access", value: "Read-only" },
    { label: "Security", value: "Password protected" },
    { label: "Expiry", value: "14 days" },
    { label: "Documents", value: "Summary only" },
    { label: "Internal notes", value: "Hidden" },
  ];
}

function mapAnswersByQuestionCode(questionnaire: QuestionnairePayload) {
  const itemsById = new Map((questionnaire.items ?? []).map((item) => [item.id, item]));
  const answersByCode = new Map<string, QuestionAnswerRecord>();

  for (const answer of questionnaire.answers ?? []) {
    const item = itemsById.get(answer.question_item_id);

    if (item) {
      answersByCode.set(item.code, answer);
    }
  }

  return answersByCode;
}

function mapAnswerValuesByQuestionCode(questionnaire: QuestionnairePayload) {
  const answersByCode = mapAnswersByQuestionCode(questionnaire);

  return new Map(
    Array.from(answersByCode.entries()).map(([code, answer]) => [code, answer.value]),
  );
}

type ShareLinkFormValues = {
  buyerName: string;
  buyerEmail: string;
  expiresAt: string;
  password: string;
  passwordProtected: boolean;
  documentVisibility: "approved_only" | "all_linked_documents";
};

function CreateShareLinkDialog({
  open,
  isSaving,
  shareUrl,
  labels,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  isSaving: boolean;
  shareUrl: string;
  labels: PassportLabels;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ShareLinkFormValues) => Promise<void>;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [documentVisibility, setDocumentVisibility] =
    useState<ShareLinkFormValues["documentVisibility"]>("approved_only");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      buyerName,
      buyerEmail,
      expiresAt,
      password: passwordProtected ? password : "",
      passwordProtected,
      documentVisibility,
    });
  }

  async function handleCopyShareUrl() {
    if (!shareUrl || copyState === "copying") {
      return;
    }

    setCopyState("copying");

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {labels.createShareLinkTitle}
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600">
              {labels.createShareLinkDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <InputWithLabel label={labels.buyerName} value={buyerName} onChange={setBuyerName} />
            <InputWithLabel label={labels.buyerEmail} type="email" value={buyerEmail} onChange={setBuyerEmail} />
            <InputWithLabel label={labels.expiryDate} type="date" value={expiresAt} onChange={setExpiresAt} />
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">{labels.documentVisibility}</label>
              <Select value={documentVisibility} onValueChange={(value) => setDocumentVisibility(value as ShareLinkFormValues["documentVisibility"])}>
                <SelectTrigger className="h-11 rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved_only">{labels.approvedOnly}</SelectItem>
                  <SelectItem value="all_linked_documents">{labels.allLinkedDocuments}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-slate-500">{labels.documentVisibilityHelp}</p>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Checkbox checked={passwordProtected} onCheckedChange={(checked) => setPasswordProtected(checked === true)} />
              {labels.passwordProtected}
            </label>
            {passwordProtected ? (
              <div className="grid gap-2">
                <InputWithLabel label={labels.password} type="password" value={password} onChange={setPassword} required />
                <p className="text-xs leading-5 text-slate-500">{labels.passwordHelp}</p>
              </div>
            ) : null}
            {shareUrl ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-900">{labels.generatedLink}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input readOnly value={shareUrl} className="bg-white" />
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    disabled={copyState === "copying"}
                    onClick={handleCopyShareUrl}
                  >
                    {copyState === "copying"
                      ? labels.copyingLink
                      : copyState === "copied"
                        ? labels.linkCopied
                        : labels.copyLink}
                  </Button>
                </div>
                {copyState === "error" ? (
                  <p className="mt-2 text-sm font-medium text-red-700">{labels.copyError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button type="button" variant="outline" className="bg-white" disabled={isSaving} onClick={() => onOpenChange(false)}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Link2 data-icon="inline-start" />
              {isSaving ? labels.creatingLink : labels.createLink}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InputWithLabel({
  label,
  value,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl bg-white"
        required={required}
      />
    </div>
  );
}

function readFilenameFromContentDisposition(value: string) {
  const match = /filename="([^"]+)"/.exec(value);

  return match?.[1] ?? null;
}
