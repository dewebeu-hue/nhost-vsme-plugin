"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { MoreHorizontal, Send, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { AttachEvidenceDialog } from "@/components/questionnaire/attach-evidence-dialog";
import { QuestionnaireHelperPanel } from "@/components/questionnaire/questionnaire-helper-panel";
import { QuestionnaireQuestionCard } from "@/components/questionnaire/questionnaire-question-card";
import { QuestionnaireSectionList } from "@/components/questionnaire/questionnaire-section-list";
import {
  questionnaireEnergyQuestions,
  questionnaireOverviewMock,
  questionnaireSectionProgress,
  type QuestionnaireAnswerStatus,
  type QuestionnaireEnergyQuestion,
  type QuestionnaireSectionProgress,
  type EvidenceRoomDocument,
  type EvidenceRoomStatus,
} from "@/lib/mock-data";
import { getBrowserNhostClient } from "@/lib/nhost/client";
import type { QuestionAnswerStatus } from "@/lib/types";
import {
  defaultQuestionnaireLabels,
  formatLabel,
  type QuestionnaireLabels,
} from "@/lib/workspace-labels";

type GraphqlJson =
  | string
  | number
  | boolean
  | null
  | GraphqlJson[]
  | { [key: string]: GraphqlJson };

type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
  question_items_aggregate?: {
    aggregate?: {
      count: number;
    } | null;
  } | null;
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
  question_item?: {
    id: string;
    section_id: string;
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

type QuestionnairePayload = {
  configured?: boolean;
  organization?: { id: string; name: string } | null;
  activeSectionCode?: string;
  sections?: QuestionSectionRecord[];
  questions?: QuestionItemRecord[];
  answers?: QuestionAnswerRecord[];
  documents?: LiveDocument[];
  documentLinks?: DocumentLinkRecord[];
  error?: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type AnswerValue = string | number | string[] | boolean | null;

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
  | "other";

type LiveDocument = {
  id: string;
  organization_id: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  document_type: LiveDocumentType;
  status: LiveDocumentStatus;
  expires_at: string | null;
  created_at: string;
};

type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
  document: LiveDocument | null;
};

type ActiveSectionState = {
  name: string;
  subtitle: string;
  completion: number;
  completedQuestions: number;
  totalQuestions: number;
};

type QuestionnairePageClientProps = {
  labels?: QuestionnaireLabels;
};

const activeSectionCode = "energy";
const completedStatuses: QuestionAnswerStatus[] = ["completed", "reviewed"];
const documentStatusLabels: Record<LiveDocumentStatus, EvidenceRoomStatus> = {
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
  waste_report: "Report",
  safety: "Safety",
  customer_questionnaire: "Questionnaire",
  other: "Other",
};

export function QuestionnairePageClient({
  labels = defaultQuestionnaireLabels,
}: QuestionnairePageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [sections, setSections] = useState<QuestionnaireSectionProgress[]>(
    questionnaireSectionProgress,
  );
  const [activeSection, setActiveSection] = useState<ActiveSectionState>({
    name: labels.sectionEnergyTitle,
    subtitle: labels.sectionEnergyDescription,
    completion: questionnaireOverviewMock.activeSection.completion,
    completedQuestions: questionnaireOverviewMock.activeSection.completedQuestions,
    totalQuestions: questionnaireOverviewMock.activeSection.totalQuestions,
  });
  const [questions, setQuestions] = useState<QuestionnaireEnergyQuestion[]>(
    questionnaireEnergyQuestions,
  );
  const [liveQuestions, setLiveQuestions] = useState<QuestionItemRecord[]>([]);
  const [organizationDocuments, setOrganizationDocuments] = useState<EvidenceRoomDocument[]>([]);
  const [documentLinks, setDocumentLinks] = useState<DocumentLinkRecord[]>([]);
  const [questionToAttach, setQuestionToAttach] =
    useState<QuestionnaireEnergyQuestion | null>(null);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [answerValues, setAnswerValues] = useState<Record<string, AnswerValue>>(
    () => valuesFromMockQuestions(questionnaireEnergyQuestions),
  );
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestionnaire() {
      const nhost = getBrowserNhostClient();
      const session = nhost?.getUserSession();

      if (!nhost || !session?.user?.id) {
        setIsLoading(false);
        setMessage({
          tone: "info",
          text: labels.mockModeMessage,
        });
        return;
      }

      try {
        const response = await fetch("/api/questionnaire", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            sectionCode: activeSectionCode,
          }),
        });

        const payload = (await response.json()) as QuestionnairePayload;

        if (cancelled) {
          return;
        }

        if (!response.ok || payload.configured === false || !payload.organization) {
          if (response.status === 404) {
            router.push(`/${locale}/onboarding`);
            return;
          }

          setMessage({
            tone: payload.configured === false ? "info" : "error",
            text:
              payload.error ??
              labels.loadFallbackError,
          });
          return;
        }

        const nextValues = valuesFromAnswers(payload.questions ?? [], payload.answers ?? []);
        const nextDocumentLinks = payload.documentLinks ?? [];
        const nextDocuments = (payload.documents ?? []).map(mapLiveDocument);
        const nextQuestions = mapLiveQuestions(
          payload.questions ?? [],
          payload.answers ?? [],
          nextValues,
          nextDocumentLinks,
          labels,
        );
        const nextSections = mapLiveSections(payload.sections ?? [], payload.answers ?? []);
        const currentSection = payload.sections?.find(
          (section) => section.code === activeSectionCode,
        );
        const currentProgress = nextSections.find(
          (section) => section.id === activeSectionCode,
        );

        if (!nextQuestions.length || !currentSection) {
          setMessage({
            tone: "info",
            text: labels.seedFallbackMessage,
          });
          return;
        }

        setOrganizationId(payload.organization.id);
        setLiveMode(true);
        setSections(nextSections);
        setQuestions(nextQuestions);
        setLiveQuestions(payload.questions ?? []);
        setOrganizationDocuments(nextDocuments);
        setDocumentLinks(nextDocumentLinks);
        setAnswerValues(nextValues);
        setActiveSection({
          name: labels.sections[currentSection.title] ?? currentSection.title,
          subtitle:
            currentSection.description ??
            labels.sectionEnergyDescription,
          completion: calculatePercent(
            currentProgress?.completed ?? 0,
            currentProgress?.total ?? nextQuestions.length,
          ),
          completedQuestions: currentProgress?.completed ?? 0,
          totalQuestions: currentProgress?.total ?? nextQuestions.length,
        });
        setMessage(null);
      } catch (error) {
        console.error("Questionnaire GraphQL load failed", error);
        if (!cancelled) {
          setMessage({
            tone: "error",
            text: labels.loadFallbackError,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadQuestionnaire();

    return () => {
      cancelled = true;
    };
  }, [labels, locale, router]);

  const overall = useMemo(() => {
    const completed = sections.reduce((sum, section) => sum + section.completed, 0);
    const total = sections.reduce((sum, section) => sum + section.total, 0);

    if (!liveMode || total === 0) {
      return {
        completion: questionnaireOverviewMock.completion,
        completedQuestions: questionnaireOverviewMock.completedQuestions,
        totalQuestions: questionnaireOverviewMock.totalQuestions,
      };
    }

    return {
      completion: calculatePercent(completed, total),
      completedQuestions: completed,
      totalQuestions: total,
    };
  }, [liveMode, sections]);

  function handleValueChange(questionId: string, value: AnswerValue) {
    const nextValues = { ...answerValues, [questionId]: value };
    setAnswerValues(nextValues);
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? applyValueToQuestion(question, value, inferDisplayStatus(question, value))
          : question,
      ),
    );
  }

  async function handleSave() {
    if (!liveMode || !organizationId) {
      setMessage({
        tone: "success",
        text: labels.mockSaveMessage,
      });
      return;
    }

    const nhost = getBrowserNhostClient();
    const session = nhost?.getUserSession();

    if (!session?.user?.id) {
      setMessage({
        tone: "error",
        text: labels.saveSignInError,
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/questionnaire/save", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          organizationId,
          answers: liveQuestions.map((question) => {
            const value = answerValues[question.id] ?? "";
            const displayQuestion = questions.find((item) => item.id === question.id);

            return {
              questionItemId: question.id,
              value: serializeAnswerValue(question, value),
              status: inferGraphqlStatus(
                question,
                value,
                displayQuestion?.linkedDocuments?.length ?? 0,
              ),
            };
          }),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage({
          tone: response.status === 503 ? "info" : "error",
          text: payload.error ?? labels.saveError,
        });
        return;
      }

      setMessage({ tone: "success", text: labels.saveSuccess });
    } catch (error) {
      console.error("Questionnaire save failed", error);
      setMessage({
        tone: "error",
        text: labels.saveError,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAttachEvidence(documentIds: string[]) {
    if (!questionToAttach || documentIds.length === 0) {
      return;
    }

    if (liveMode && !questionToAttach.answerId) {
      setMessage({ tone: "info", text: labels.attachSaveFirstMessage });
      return;
    }

    if (!liveMode || !organizationId) {
      const attachedDocuments = mockEvidenceDocuments().filter((document) =>
        documentIds.includes(document.id),
      );
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
            question.id === questionToAttach.id
            ? {
                ...question,
                linkedDocuments: [
                  ...(question.linkedDocuments ?? []),
                  ...attachedDocuments.map((document) => ({
                    id: document.id,
                    fileName: document.fileName,
                    documentType: document.type,
                    status: document.status,
                  })),
                ],
              }
            : question,
        ),
      );
      setIsAttachDialogOpen(false);
      setMessage({ tone: "success", text: labels.attachMockSuccess });
      return;
    }

    const nhost = getBrowserNhostClient();
    const session = nhost?.getUserSession();

    if (!session?.user?.id) {
      setMessage({ tone: "error", text: labels.attachSignInError });
      return;
    }

    setIsAttaching(true);
    setMessage(null);

    try {
      let latestLinks = documentLinks;

      for (const documentId of documentIds) {
        const document = organizationDocuments.find((item) => item.id === documentId);
        const response = await fetch("/api/document-links", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            action: "link",
            userId: session.user.id,
            organizationId,
            documentId,
            questionAnswerIds: [questionToAttach.answerId],
            currentDocumentStatus: document?.status,
          }),
        });
        const payload = (await response.json()) as { links?: DocumentLinkRecord[]; error?: string };

        if (!response.ok || !payload.links) {
          setMessage({
            tone: response.status === 503 ? "info" : "error",
            text: payload.error ?? labels.attachError,
          });
          return;
        }

        latestLinks = payload.links;
      }

      setDocumentLinks(latestLinks);
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          question.id === questionToAttach.id
            ? {
                ...question,
                status: question.status === "Needs evidence" ? "Completed" : question.status,
                linkedDocuments: linkedDocumentsForAnswer(
                  questionToAttach.answerId ?? "",
                  latestLinks,
                ),
              }
            : question,
        ),
      );
      setIsAttachDialogOpen(false);
      setMessage({ tone: "success", text: labels.attachSuccess });
    } catch (error) {
      console.error("Attach evidence failed", error);
      setMessage({
        tone: "error",
        text: labels.attachError,
      });
    } finally {
      setIsAttaching(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {labels.title}
            </h1>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
            >
              {labels.draft}
            </Badge>
          </div>
          <p className="mt-2 text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Send data-icon="inline-start" />
            {labels.shareProgress}
          </Button>
          <Button
            className="shadow-lg shadow-blue-600/15"
            disabled={isSaving}
            onClick={handleSave}
          >
            <Save data-icon="inline-start" />
            {isSaving ? labels.saving : labels.saveAndContinue}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <MoreHorizontal />
              <span className="sr-only">{labels.moreActions}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>Export draft</DropdownMenuItem>
                <DropdownMenuItem>Assign section owner</DropdownMenuItem>
                <DropdownMenuItem>Reset section</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {message ? <QuestionnaireMessage message={message} /> : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <QuestionnaireSectionList
          completion={overall.completion}
          completedQuestions={overall.completedQuestions}
          totalQuestions={overall.totalQuestions}
          sections={sections}
          labels={labels}
        />

        <main className="flex min-w-0 flex-col gap-5">
          <section className="supplier-surface rounded-2xl border-0 p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  {labels.activeSection}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {activeSection.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {activeSection.subtitle}
                </p>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 md:w-64">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {labels.sectionCompletion}
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                      {activeSection.completion}%
                    </p>
                  </div>
                  <p className="pb-1 text-sm font-semibold text-slate-500">
                    {activeSection.completedQuestions} / {activeSection.totalQuestions}
                  </p>
                </div>
                <Progress value={activeSection.completion} className="mt-4 h-2" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {formatLabel(labels.questionsCompletedShort, {
                    completed: activeSection.completedQuestions,
                    total: activeSection.totalQuestions,
                  })}
                </p>
              </div>
            </div>
          </section>

          {isLoading ? (
            <QuestionnaireSkeleton />
          ) : (
            <div className="flex flex-col gap-4">
              {questions.map((question, index) => (
                <QuestionnaireQuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onValueChange={handleValueChange}
                  onAttachEvidence={(selectedQuestion) => {
                    setQuestionToAttach(selectedQuestion);
                    setIsAttachDialogOpen(true);
                  }}
                  labels={labels}
                />
              ))}
            </div>
          )}

          <footer className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <Button variant="outline">
              <ArrowLeft data-icon="inline-start" />
              {labels.previousSection}
            </Button>
            <Button
              className="shadow-lg shadow-blue-600/15"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? labels.saving : labels.saveAndContinue}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </footer>
        </main>

        <QuestionnaireHelperPanel
          tipsTitle={labels.tipsTitle}
          guidance={labels.helperTexts.energyTip ?? questionnaireOverviewMock.helper.guidance}
          learnMoreLabel={labels.learnMoreEnergy}
          evidenceRecommendationsTitle={labels.evidenceRecommendationsTitle}
          uploadEvidenceLabel={labels.uploadEvidence}
          relatedDocumentsTitle={labels.relatedDocumentsTitle}
          needHelpTitle={labels.needHelpTitle}
          needHelpText={labels.needHelpText}
          contactSupportLabel={labels.contactSupport}
          evidenceRecommendations={labels.evidenceRecommendations}
          relatedDocuments={labels.relatedDocuments}
        />
      </div>

      <AttachEvidenceDialog
        open={isAttachDialogOpen}
        documents={organizationDocuments.length ? organizationDocuments : mockEvidenceDocuments()}
        linkedDocumentIds={questionToAttach?.linkedDocuments?.map((document) => document.id) ?? []}
        isSaving={isAttaching}
        labels={labels}
        onOpenChange={setIsAttachDialogOpen}
        onAttach={handleAttachEvidence}
      />
    </div>
  );
}

function QuestionnaireMessage({ message }: { message: MessageState }) {
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

function QuestionnaireSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex gap-3 p-5">
            <div className="size-8 rounded-full bg-slate-100" />
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded-full bg-slate-100" />
              <div className="mt-5 h-12 w-full max-w-md rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function mapLiveQuestions(
  questionItems: QuestionItemRecord[],
  answers: QuestionAnswerRecord[],
  values: Record<string, AnswerValue>,
  documentLinks: DocumentLinkRecord[],
  labels: QuestionnaireLabels,
): QuestionnaireEnergyQuestion[] {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));

  return questionItems.map((item) => {
    const answer = answersByQuestion.get(item.id);
    const value = values[item.id] ?? defaultValueForQuestion(item);
    const linkedDocuments = answer ? linkedDocumentsForAnswer(answer.id, documentLinks) : [];
    const status = toDisplayStatus(
      answer?.status ?? inferGraphqlStatus(item, value, linkedDocuments.length),
    );
    const evidenceFields = {
      answerId: answer?.id,
      evidenceRequired: item.evidence_required,
      linkedDocuments,
    };
    const prompt = getQuestionLabel(item, labels);

    if (item.answer_type === "select") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "select",
        value: typeof value === "string" ? value : "",
        options: optionsFromJson(item.options),
      };
    }

    if (item.answer_type === "boolean") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "yes-no",
        value: value === false ? "No" : "Yes",
      };
    }

    if (item.answer_type === "date") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "date",
        value: typeof value === "string" ? value : "",
      };
    }

    if (item.answer_type === "multi_select") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "chips",
        values: Array.isArray(value) ? value.filter(isString) : [],
        options: optionsFromJson(item.options),
      };
    }

    if (item.answer_type === "textarea") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "textarea",
        value: typeof value === "string" ? value : "",
      };
    }

    return {
      ...evidenceFields,
      id: item.id,
      prompt,
      status,
      type: "input",
      value: value === null ? "" : String(value),
      unit: item.unit ?? "",
    };
  });
}

function mapLiveSections(
  sectionRecords: QuestionSectionRecord[],
  answers: QuestionAnswerRecord[],
): QuestionnaireSectionProgress[] {
  return sectionRecords.map((section) => {
    const total = section.question_items_aggregate?.aggregate?.count ?? 0;
    const completed = answers.filter(
      (answer) =>
        answer.question_item?.section_id === section.id &&
        completedStatuses.includes(answer.status),
    ).length;

    return {
      id: section.code,
      name: section.title,
      completed,
      total,
      isActive: section.code === activeSectionCode,
    };
  });
}

function valuesFromAnswers(
  questions: QuestionItemRecord[],
  answers: QuestionAnswerRecord[],
): Record<string, AnswerValue> {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));

  return Object.fromEntries(
    questions.map((question) => {
      const answerValue = answersByQuestion.get(question.id)?.value;
      return [question.id, normalizeAnswerValue(question, answerValue)];
    }),
  );
}

function valuesFromMockQuestions(
  questions: QuestionnaireEnergyQuestion[],
): Record<string, AnswerValue> {
  return Object.fromEntries(
    questions.map((question) => {
      if (question.type === "chips") {
        return [question.id, question.values];
      }

      if (question.type === "yes-no") {
        return [question.id, question.value === "Yes"];
      }

      return [question.id, question.value];
    }),
  );
}

function applyValueToQuestion(
  question: QuestionnaireEnergyQuestion,
  value: AnswerValue,
  status: QuestionnaireAnswerStatus,
): QuestionnaireEnergyQuestion {
  if (question.type === "chips") {
    return { ...question, status, values: Array.isArray(value) ? value.filter(isString) : [] };
  }

  if (question.type === "yes-no") {
    return { ...question, status, value: value === false ? "No" : "Yes" };
  }

  return { ...question, status, value: typeof value === "string" ? value : String(value) };
}

function normalizeAnswerValue(
  question: QuestionItemRecord,
  value: GraphqlJson | undefined,
): AnswerValue {
  if (value === undefined || value === null) {
    return defaultValueForQuestion(question);
  }

  if (question.answer_type === "boolean") {
    return typeof value === "boolean" ? value : null;
  }

  if (question.answer_type === "multi_select") {
    return Array.isArray(value) ? value.filter(isString) : [];
  }

  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function defaultValueForQuestion(question: QuestionItemRecord): AnswerValue {
  if (question.answer_type === "multi_select") {
    return [];
  }

  return question.answer_type === "boolean" ? null : "";
}

function inferDisplayStatus(
  question: QuestionnaireEnergyQuestion,
  value: AnswerValue,
): QuestionnaireAnswerStatus {
  if (isEmptyValue(value)) {
    return "Not started";
  }

  if (question.evidenceRequired && !question.linkedDocuments?.length) {
    return "Needs evidence";
  }

  return "Completed";
}

function inferGraphqlStatus(
  question: QuestionItemRecord,
  value: AnswerValue,
  linkedDocumentCount = 0,
): QuestionAnswerStatus {
  if (isEmptyValue(value)) {
    return "not_started";
  }

  if (question.evidence_required && linkedDocumentCount === 0) {
    return "needs_evidence";
  }

  return "completed";
}

function serializeAnswerValue(question: QuestionItemRecord, value: AnswerValue): GraphqlJson {
  if (isEmptyValue(value)) {
    return null;
  }

  if (question.answer_type === "number") {
    const numericValue =
      typeof value === "number" ? value : Number(String(value).replace(",", "."));
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  if (question.answer_type === "boolean") {
    return Boolean(value);
  }

  if (question.answer_type === "multi_select") {
    return Array.isArray(value) ? value.filter(isString) : [];
  }

  return typeof value === "string" ? value : String(value);
}

function toDisplayStatus(status: QuestionAnswerStatus): QuestionnaireAnswerStatus {
  const labels: Record<QuestionAnswerStatus, QuestionnaireAnswerStatus> = {
    not_started: "Not started",
    in_progress: "In progress",
    completed: "Completed",
    needs_evidence: "Needs evidence",
    reviewed: "Reviewed",
  };

  return labels[status];
}

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function optionsFromJson(value: GraphqlJson): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isEmptyValue(value: AnswerValue) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value === "" || value === null;
}

const questionCodeLabelKeys: Record<string, string> = {
  energy_total_consumption: "energy-total-consumption",
  energy_consumption_intensity: "energy-intensity",
  energy_primary_source: "energy-primary-source",
  energy_onsite_renewable: "energy-renewable-onsite",
  energy_renewable_percentage: "energy-renewable-percentage",
  energy_last_audit: "energy-audit-date",
  energy_efficiency_measures: "energy-efficiency-measures",
  energy_additional_notes: "energy-additional-notes",
};

function getQuestionLabel(item: QuestionItemRecord, labels: QuestionnaireLabels) {
  return (
    labels.questionPrompts[item.code] ??
    labels.questionPrompts[questionCodeLabelKeys[item.code]] ??
    item.title
  );
}

function linkedDocumentsForAnswer(answerId: string, links: DocumentLinkRecord[]) {
  return links
    .filter((link) => link.question_answer_id === answerId && link.document)
    .map((link) => {
      const document = link.document as LiveDocument;

      return {
        id: document.id,
        fileName: document.file_name,
        documentType: documentTypeLabels[document.document_type] ?? "Other",
        status: documentStatusLabels[document.status] ?? "Uploaded",
      };
    });
}

function mapLiveDocument(document: LiveDocument): EvidenceRoomDocument {
  return {
    id: document.id,
    title: createDocumentTitle(document.file_name),
    fileName: document.file_name,
    fileSize: formatFileSize(document.file_size_bytes),
    type: documentTypeLabels[document.document_type] ?? "Other",
    linkedTo: [],
    uploaded: formatDate(document.created_at),
    uploadedBy: "Workspace user",
    status: documentStatusLabels[document.status] ?? "Uploaded",
  };
}

function mockEvidenceDocuments(): EvidenceRoomDocument[] {
  return [
    {
      id: "iso-14001-certificate",
      title: "ISO 14001 Certificate",
      fileName: "iso_14001_2024.pdf",
      fileSize: "2.4 MB",
      type: "Certificate",
      linkedTo: ["ENV-1.1"],
      uploaded: "May 12, 2024",
      uploadedBy: "Anna Muller",
      status: "Reviewed",
    },
    {
      id: "energy-bill-march-2026",
      title: "Energy Bill March 2026",
      fileName: "energy_bill_mar_2026.xlsx",
      fileSize: "512 KB",
      type: "Utility Bill",
      linkedTo: ["ENV-2.1"],
      uploaded: "May 10, 2024",
      uploadedBy: "Anna Muller",
      status: "Linked",
    },
  ];
}

function createDocumentTitle(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFileSize(size: number | null) {
  if (!size || size <= 0) {
    return "Unknown size";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
