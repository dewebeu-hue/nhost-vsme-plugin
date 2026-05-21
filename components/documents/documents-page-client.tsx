"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { UploadCloud } from "lucide-react";
import { DocumentsMetricCards } from "@/components/documents/documents-metric-cards";
import { DocumentsToolbar } from "@/components/documents/documents-toolbar";
import { EvidenceDataRoom } from "@/components/documents/evidence-data-room";
import {
  LinkAnswerDialog,
  type LinkableAnswer,
} from "@/components/documents/link-answer-dialog";
import {
  UploadDocumentDialog,
  type UploadDocumentValues,
} from "@/components/documents/upload-document-dialog";
import { ContextualHelpCard, TerminologyTooltip } from "@/components/onboarding/contextual-help";
import { Button } from "@/components/ui/button";
import {
  linkDocumentToQuestionItems,
  normalizeQuestionItemIds,
  resolveEvidenceDocumentId,
} from "@/lib/document-linking-client";
import {
  evidenceRoomDocuments,
  evidenceRoomFilters,
  evidenceRoomLinkedQuestions,
  evidenceRoomMetrics,
  evidenceRoomSelectedDocumentId,
  type EvidenceRoomDocument,
  type EvidenceRoomLinkedQuestion,
  type EvidenceRoomMetric,
  type EvidenceRoomStatus,
  type QuestionnaireAnswerStatus,
} from "@/lib/mock-data";
import {
  forceRefreshBrowserNhostSession,
  getBrowserNhostClient,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

type LiveDocumentStatus =
  | "uploaded"
  | "linked"
  | "reviewed"
  | "expiring_soon"
  | "needs_review";

type LiveDocumentType =
  | "certificate"
  | "utility_bill"
  | "policy"
  | "waste_report"
  | "safety"
  | "customer_questionnaire"
  | "other"
  | "report"
  | "training";

type LiveDocument = {
  id: string;
  organization_id: string;
  uploaded_by: string | null;
  file_id: string | null;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  document_type: LiveDocumentType;
  status: LiveDocumentStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentsPayload = {
  configured?: boolean;
  organization?: { id: string; name: string } | null;
  category?: string;
  documents?: LiveDocument[];
  documentLinks?: DocumentLinkRecord[];
  answers?: QuestionAnswerRecord[];
  questions?: QuestionItemRecord[];
  error?: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type QuestionAnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  status: "not_started" | "in_progress" | "completed" | "needs_evidence" | "reviewed";
  question_item?: {
    id: string;
    code: string;
    title?: string;
    evidence_required?: boolean;
    question_section?: {
      id: string;
      code: string;
      title: string;
    } | null;
  } | null;
};

type QuestionItemRecord = {
  id: string;
  code: string;
  title: string;
  evidence_required: boolean;
  section_id: string;
  question_section?: {
    id: string;
    code: string;
    title: string;
  } | null;
};

type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
  question_answer: QuestionAnswerRecord | null;
};

type DocumentsPageClientProps = {
  labels?: DocumentsLabels;
};

const statusLabels: Record<LiveDocumentStatus, EvidenceRoomStatus> = {
  uploaded: "Uploaded",
  linked: "Linked",
  reviewed: "Reviewed",
  expiring_soon: "Expiring soon",
  needs_review: "Needs review",
};

const documentTypeLabels: Record<LiveDocumentType, EvidenceRoomDocument["type"]> = {
  certificate: "Certificate",
  utility_bill: "Utility Bill",
  policy: "Policy",
  waste_report: "Waste Report",
  safety: "Safety",
  customer_questionnaire: "Questionnaire",
  other: "Other",
  report: "Report",
  training: "Training",
};

export function DocumentsPageClient({
  labels = defaultDocumentsLabels,
}: DocumentsPageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<EvidenceRoomDocument[]>(evidenceRoomDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState(evidenceRoomSelectedDocumentId);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [documentLinks, setDocumentLinks] = useState<DocumentLinkRecord[]>([]);
  const [linkableAnswers, setLinkableAnswers] = useState<LinkableAnswer[]>(
    createMockLinkableAnswers(),
  );
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [documentToLink, setDocumentToLink] = useState<EvidenceRoomDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(
    evidenceRoomFilters.types[0],
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(
    evidenceRoomFilters.statuses[0],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      const nhost = getBrowserNhostClient();
      const session = await getFreshBrowserNhostSession();

      if (!nhost || !session?.user?.id) {
        setIsLoading(false);
        setMessage({
          tone: nhost ? "error" : "info",
          text: nhost ? labels.linkSignInError : labels.mockModeMessage,
        });
        if (nhost) {
          setLiveMode(true);
          setDocuments([]);
          setSelectedDocumentId("");
        }
        return;
      }

      try {
        let response = await fetch("/api/documents", {
          method: "GET",
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (response.status === 401) {
          const refreshedSession = await forceRefreshBrowserNhostSession();

          if (refreshedSession?.accessToken) {
            response = await fetch("/api/documents", {
              method: "GET",
              headers: {
                authorization: `Bearer ${refreshedSession.accessToken}`,
              },
            });
          }
        }
        const payload = (await response.json()) as DocumentsPayload;

        if (cancelled) {
          return;
        }

        if (!response.ok || payload.configured === false || !payload.organization) {
          if (response.status === 404 || payload.category === "membership_not_found") {
            router.push(`/${locale}/onboarding`);
            return;
          }

          if (response.status === 401 || payload.category === "token_expired") {
            setMessage({
              tone: "error",
              text: labels.linkSignInError,
            });
            setDocuments([]);
            setSelectedDocumentId("");
            setLiveMode(true);
            router.push(`/${locale}/login`);
            return;
          }

          setMessage({
            tone: "error",
            text: payload.error ?? labels.liveUnavailableMessage,
          });
          setDocuments([]);
          setSelectedDocumentId("");
          setLiveMode(true);
          return;
        }

        const nextDocuments = (payload.documents ?? []).map((document) =>
          mapLiveDocument(document, labels, locale),
        );

        if (!nextDocuments.length) {
          setMessage({
            tone: "info",
            text: labels.emptyLiveMessage,
          });
          setOrganizationId(payload.organization.id);
          setLiveMode(true);
          setDocuments([]);
          setSelectedDocumentId("");
          setDocumentLinks(payload.documentLinks ?? []);
          setLinkableAnswers(mapLinkableAnswers(payload.questions ?? [], payload.answers ?? []));
          return;
        }

        setOrganizationId(payload.organization.id);
        setLiveMode(true);
        setDocuments(nextDocuments);
        setDocumentLinks(payload.documentLinks ?? []);
        setLinkableAnswers(mapLinkableAnswers(payload.questions ?? [], payload.answers ?? []));
        setSelectedDocumentId(nextDocuments[0]?.id ?? "");
        setMessage(null);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Documents load failed", error);
        }
        if (!cancelled) {
          setDocuments([]);
          setSelectedDocumentId("");
          setLiveMode(true);
          setMessage({
            tone: "error",
            text: labels.liveUnavailableMessage,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [labels, locale, router]);

  const metrics = useMemo(
    () => (liveMode ? createLiveMetrics(documents, labels) : evidenceRoomMetrics),
    [documents, labels, liveMode],
  );
  const linkedQuestionsByDocument = useMemo(
    () => createLinkedQuestionsByDocument(documentLinks),
    [documentLinks],
  );
  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [
            document.title,
            document.fileName,
            document.type,
            document.status,
            document.linkedTo.join(" "),
            document.linkedExtra ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesType =
          selectedTypeFilter === evidenceRoomFilters.types[0] || document.type === selectedTypeFilter;
        const matchesStatus =
          selectedStatusFilter === evidenceRoomFilters.statuses[0] ||
          document.status === selectedStatusFilter;

        return matchesSearch && matchesType && matchesStatus;
      }),
    [documents, searchQuery, selectedStatusFilter, selectedTypeFilter],
  );
  const visibleSelectedDocumentId = filteredDocuments.some(
    (document) => document.id === selectedDocumentId,
  )
    ? selectedDocumentId
    : filteredDocuments[0]?.id ?? "";

  async function handleUpload(values: UploadDocumentValues) {
    const session = await getFreshBrowserNhostSession();

    if (!liveMode || !organizationId || !session?.user?.id) {
      setMessage({
        tone: liveMode ? "error" : "info",
        text: liveMode ? labels.linkSignInError : labels.uploadMockMessage,
      });
      setIsUploadOpen(false);
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      formData.set("documentType", values.documentType);
      formData.set("file", values.file);

      if (values.expiresAt) {
        formData.set("expiresAt", values.expiresAt);
      }

      if (values.note) {
        formData.set("note", values.note);
      }

      let response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        const refreshedSession = await forceRefreshBrowserNhostSession();

        if (refreshedSession?.accessToken) {
          response = await fetch("/api/documents/upload", {
            method: "POST",
            headers: {
              authorization: `Bearer ${refreshedSession.accessToken}`,
            },
            body: formData,
          });
        }
      }
      const payload = (await response.json()) as {
        document?: LiveDocument;
        error?: string;
        category?: string;
        stage?: string;
        storageStatus?: number;
      };

      if (!response.ok || !payload.document) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[documents] upload failed", {
            category: payload.category,
            stage: payload.stage,
            storageStatus: payload.storageStatus,
          });
        }

        setMessage({
          tone: "error",
          text: labels.uploadError,
        });
        return;
      }

      const uploadedDocument = mapLiveDocument(payload.document, labels, locale);

      setDocuments((currentDocuments) => [uploadedDocument, ...currentDocuments]);
      setSelectedDocumentId(uploadedDocument.id);
      setIsUploadOpen(false);
      setMessage({ tone: "success", text: labels.uploadSuccess });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Document upload failed", error);
      }
      setMessage({
        tone: "error",
        text: labels.uploadError,
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLinkAnswers(questionItemIds: string[]) {
    if (questionItemIds.length === 0) {
      setMessage({ tone: "error", text: labels.linkSelectQuestion });
      return false;
    }

    if (!documentToLink) {
      setMessage({ tone: "error", text: labels.linkMissingDocumentId });
      return false;
    }

    const documentId = resolveEvidenceDocumentId(documentToLink);
    const normalizedQuestionItemIds = normalizeQuestionItemIds(questionItemIds);

    if (!documentId || normalizedQuestionItemIds.length === 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[documents] evidence link blocked before request", {
          flow: "documents_page",
          hasDocumentId: Boolean(documentId),
          selectedQuestionItemCount: normalizedQuestionItemIds.length,
          firstSelectedQuestionItemIdPresent: Boolean(normalizedQuestionItemIds[0]),
        });
      }

      setMessage({ tone: "error", text: labels.linkError });
      return false;
    }

    if (!liveMode || !organizationId) {
      setDocumentLinks((currentLinks) => [
        ...normalizedQuestionItemIds.map((questionItemId) => {
          const answer = linkableAnswers.find((item) => item.id === questionItemId);

          return {
            id: `mock-link-${documentId}-${questionItemId}`,
            document_id: documentId,
            question_answer_id: answer?.answerId ?? questionItemId,
            question_answer: answer
              ? {
                  id: answer.answerId ?? answer.id,
                  organization_id: "mock-org",
                  question_item_id: answer.id,
                  status: toBackendStatus(answer.status),
                  question_item: {
                    id: answer.id,
                    code: answer.code,
                    title: answer.title,
                    evidence_required: true,
                    question_section: {
                      id: answer.section,
                      code: answer.section.toLowerCase(),
                      title: answer.section,
                    },
                  },
                }
              : null,
          };
        }),
        ...currentLinks,
      ]);
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId && document.status === "Uploaded"
            ? { ...document, status: "Linked" }
            : document,
        ),
      );
      setIsLinkDialogOpen(false);
      setMessage({ tone: "success", text: labels.linkMockSuccess });
      return true;
    }

    const session = await getFreshBrowserNhostSession();

    if (!session?.user?.id) {
      setMessage({ tone: "error", text: labels.linkSignInError });
      return false;
    }

    setIsLinking(true);
    setMessage(null);

    try {
      if (process.env.NODE_ENV !== "production") {
        console.info("[documents] evidence link request", {
          flow: "documents_page",
          hasDocumentId: Boolean(documentId),
          selectedQuestionItemCount: normalizedQuestionItemIds.length,
          firstSelectedQuestionItemIdPresent: Boolean(normalizedQuestionItemIds[0]),
        });
      }

      const { response, payload } = await linkDocumentToQuestionItems<DocumentLinkRecord>({
        accessToken: session.accessToken,
        documentId,
        questionItemIds: normalizedQuestionItemIds,
      });

      if (!response.ok || !payload.links) {
        setMessage({
          tone: response.status === 503 ? "info" : "error",
          text: labels.linkError,
        });
        return false;
      }

      setDocumentLinks(payload.links);
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId && document.status === "Uploaded"
            ? { ...document, status: "Linked" }
            : document,
        ),
      );
      setIsLinkDialogOpen(false);
      setMessage({ tone: "success", text: labels.linkSuccess });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Document link failed", error);
      }
      setMessage({
        tone: "error",
        text: labels.linkError,
      });
      return false;
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <div data-tour="documents-page" className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>{labels.breadcrumbRoot}</span>
            <span aria-hidden="true" className="text-slate-300">
              &gt;
            </span>
            <span className="text-slate-900">{labels.breadcrumbCurrent}</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <UploadDocumentDialog
            open={isUploadOpen}
            isUploading={isUploading}
            onOpenChange={setIsUploadOpen}
            onUpload={handleUpload}
            trigger={
              <button
                data-tour="documents-upload"
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20"
              >
                <UploadCloud aria-hidden="true" className="size-4" />
                {labels.uploadDocuments}
              </button>
            }
            labels={labels}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl bg-white px-5"
            disabled
            title={labels.createFolderUnavailable}
          >
            {labels.createFolderUnavailable}
          </Button>
        </div>
      </div>

      {message ? <DocumentsMessage message={message} /> : null}

      <ContextualHelpCard
        title={labels.contextualHelp.title}
        text={labels.contextualHelp.text}
      />

      <section className="flex flex-wrap gap-3">
        <HelpChip label={labels.contextualHelp.documentTypeLabel}>
          <TerminologyTooltip
            label={labels.contextualHelp.documentTypeLabel}
            text={labels.contextualHelp.documentTypeText}
          />
        </HelpChip>
        <HelpChip label={labels.contextualHelp.linkedToAnswerLabel}>
          <TerminologyTooltip
            label={labels.contextualHelp.linkedToAnswerLabel}
            text={labels.contextualHelp.linkedToAnswerText}
          />
        </HelpChip>
        <HelpChip label={labels.contextualHelp.expiringSoonLabel}>
          <TerminologyTooltip
            label={labels.contextualHelp.expiringSoonLabel}
            text={labels.contextualHelp.expiringSoonText}
          />
        </HelpChip>
      </section>

      <DocumentsMetricCards metrics={metrics} labels={labels} />
      <DocumentsToolbar
        filters={evidenceRoomFilters}
        searchQuery={searchQuery}
        selectedType={selectedTypeFilter}
        selectedStatus={selectedStatusFilter}
        onSearchQueryChange={setSearchQuery}
        onTypeChange={setSelectedTypeFilter}
        onStatusChange={setSelectedStatusFilter}
        labels={labels}
      />
      {isLoading ? (
        <DocumentsSkeleton />
      ) : (
        <div data-tour="documents-link-evidence">
          <EvidenceDataRoom
            key={visibleSelectedDocumentId}
            documents={filteredDocuments}
            initialSelectedDocumentId={visibleSelectedDocumentId}
            linkedQuestions={liveMode ? [] : evidenceRoomLinkedQuestions}
            linkedQuestionsByDocument={linkedQuestionsByDocument}
            onLinkToAnswer={(document) => {
              const documentId = resolveEvidenceDocumentId(document);

              if (!documentId) {
                if (process.env.NODE_ENV !== "production") {
                  console.warn("[documents] evidence link dialog blocked", {
                    flow: "documents_page",
                    hasDocumentId: false,
                    dialogOpen: false,
                  });
                }

                setMessage({ tone: "error", text: labels.linkMissingDocumentId });
                return;
              }

              setDocumentToLink({ ...document, id: documentId });
              setSelectedDocumentId(documentId);
              setIsLinkDialogOpen(true);
            }}
            labels={labels}
          />
        </div>
      )}

      <LinkAnswerDialog
        open={isLinkDialogOpen}
        documentId={resolveEvidenceDocumentId(documentToLink)}
        answers={linkableAnswers}
        linkedAnswerIds={
          documentToLink
            ? documentLinks
                .filter((link) => link.document_id === resolveEvidenceDocumentId(documentToLink))
                .map((link) => link.question_answer?.question_item?.id ?? link.question_answer_id)
            : []
        }
        isSaving={isLinking}
        labels={labels}
        onOpenChange={setIsLinkDialogOpen}
        onLink={handleLinkAnswers}
      />

    </div>
  );
}

function DocumentsMessage({ message }: { message: MessageState }) {
  const styles = {
    info: "border-blue-100 bg-blue-50 text-blue-800",
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    error: "border-amber-100 bg-amber-50 text-amber-800",
  } satisfies Record<MessageState["tone"], string>;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[message.tone]}`}>
      {message.text}
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
      <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
    </div>
  );
}

function HelpChip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-950/5">
      {label}
      {children}
    </span>
  );
}

function mapLiveDocument(
  document: LiveDocument,
  labels: DocumentsLabels,
  locale: string,
): EvidenceRoomDocument {
  const expiryState = getCertificateExpiryState(document.document_type, document.expires_at);

  return {
    id: document.id,
    title: createDocumentTitle(document.file_name),
    fileName: document.file_name,
    fileSize: formatFileSize(document.file_size_bytes, labels),
    type: documentTypeLabels[document.document_type] ?? "Other",
    linkedTo: [labels.notLinked],
    uploaded: formatDate(document.created_at, locale, labels),
    uploadedBy: labels.workspaceUser,
    status: expiryState?.status ?? statusLabels[document.status],
    previewUrl: undefined,
    mimeType: document.mime_type ?? undefined,
    expiresAt: document.expires_at,
  };
}

function createDocumentTitle(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");

  return withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createLiveMetrics(
  documents: EvidenceRoomDocument[],
  labels: DocumentsLabels,
): EvidenceRoomMetric[] {
  const linked = documents.filter(
    (document) => document.status === "Linked" || document.status === "Reviewed",
  ).length;
  const needsReview = documents.filter((document) => document.status === "Needs review").length;
  const expiringSoon = documents.filter(
    (document) => document.status === "Expiring soon" || document.status === "Expired",
  ).length;
  const linkedPercent = documents.length ? Math.round((linked / documents.length) * 100) : 0;

  return [
    {
      label: labels.totalDocuments,
      value: String(documents.length),
      detail: labels.liveEvidenceFiles,
    },
    {
      label: labels.linkedToAnswers,
      value: String(linked),
      detail: labels.percentOfTotal.replace("{percent}", String(linkedPercent)),
    },
    {
      label: labels.needsReview,
      value: String(needsReview),
      detail: labels.awaitingValidation,
    },
    {
      label: labels.expiringSoon,
      value: String(expiringSoon),
      detail: labels.next90Days,
    },
  ];
}

function getCertificateExpiryState(
  documentType: LiveDocumentType,
  expiresAt: string | null,
): { status: EvidenceRoomStatus; daysUntilExpiry: number } | null {
  if (documentType !== "certificate" || !expiresAt) {
    return null;
  }

  const daysUntilExpiry = getDaysUntilDate(expiresAt);

  if (daysUntilExpiry === null) {
    return null;
  }

  if (daysUntilExpiry < 0) {
    return { status: "Expired", daysUntilExpiry };
  }

  if (daysUntilExpiry <= 90) {
    return { status: "Expiring soon", daysUntilExpiry };
  }

  return null;
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

function formatFileSize(size: number | null, labels: DocumentsLabels) {
  if (!size || size <= 0) {
    return labels.unknownSize;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string, locale: string, labels: DocumentsLabels) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return labels.recently;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function mapLinkableAnswers(
  questions: QuestionItemRecord[],
  answers: QuestionAnswerRecord[],
): LinkableAnswer[] {
  const answersByQuestionItem = new Map(answers.map((answer) => [answer.question_item_id, answer]));

  return questions.map((question) => {
    const answer = answersByQuestionItem.get(question.id);

    return {
      id: question.id,
      answerId: answer?.id,
      code: question.code,
      title: question.title ?? "Untitled answer",
      section: question.question_section?.title ?? "Questionnaire",
      status: toDisplayStatus(answer?.status ?? "not_started"),
    };
  });
}

function createLinkedQuestionsByDocument(
  links: DocumentLinkRecord[],
): Record<string, EvidenceRoomLinkedQuestion[]> {
  return links.reduce<Record<string, EvidenceRoomLinkedQuestion[]>>((accumulator, link) => {
    const answer = link.question_answer;
    const item = answer?.question_item;

    if (!answer || !item) {
      return accumulator;
    }

    const current = accumulator[link.document_id] ?? [];
    accumulator[link.document_id] = [
      ...current,
      {
        code: item.code,
        question: item.title ?? "Linked questionnaire answer",
        status: "Answered",
      },
    ];

    return accumulator;
  }, {});
}

function createMockLinkableAnswers(): LinkableAnswer[] {
  return [
    { id: "mock-answer-env-1-1", code: "ENV-1.1", title: "Does your company have an environmental management policy?", section: "Environment", status: "Completed" },
    { id: "mock-answer-env-1-2", code: "ENV-1.2", title: "Provide your ISO 14001 certification.", section: "Environment", status: "Completed" },
    { id: "mock-answer-env-2-1", code: "ENV-2.1", title: "What was your total energy consumption from all sources?", section: "Energy", status: "Needs evidence" },
    { id: "mock-answer-soc-2-1", code: "SOC-2.1", title: "Provide health and safety training records.", section: "Social", status: "In progress" },
    { id: "mock-answer-gov-1-1", code: "GOV-1.1", title: "Does the organization maintain a code of conduct?", section: "Governance", status: "Reviewed" },
  ];
}

function toDisplayStatus(
  status: QuestionAnswerRecord["status"],
): QuestionnaireAnswerStatus {
  const labels: Record<QuestionAnswerRecord["status"], QuestionnaireAnswerStatus> = {
    not_started: "Not started",
    in_progress: "In progress",
    completed: "Completed",
    needs_evidence: "Needs evidence",
    reviewed: "Reviewed",
  };

  return labels[status];
}

function toBackendStatus(status: QuestionnaireAnswerStatus): QuestionAnswerRecord["status"] {
  const labels: Record<QuestionnaireAnswerStatus, QuestionAnswerRecord["status"]> = {
    "Not started": "not_started",
    "In progress": "in_progress",
    Completed: "completed",
    "Needs evidence": "needs_evidence",
    Reviewed: "reviewed",
  };

  return labels[status];
}
