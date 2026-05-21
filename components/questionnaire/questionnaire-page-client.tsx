"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Send, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  forceRefreshBrowserNhostSession,
  getBrowserNhostClient,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import {
  linkDocumentToQuestionItems,
  normalizeQuestionItemIds,
  resolveEvidenceDocumentId,
} from "@/lib/document-linking-client";
import { calculateSectionCompletion } from "@/lib/questionnaire-completion";
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
  category?: string;
  sections?: QuestionSectionRecord[];
  items?: QuestionItemRecord[];
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
  | "report"
  | "training"
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
  question_answer?: {
    id: string;
    question_item_id: string;
    question_item?: {
      id: string;
    } | null;
  } | null;
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
  initialSectionCode?: string;
};

const defaultActiveSectionCode = "company_basics";
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
  waste_report: "Waste Report",
  safety: "Safety",
  customer_questionnaire: "Questionnaire",
  report: "Report",
  training: "Training",
  other: "Other",
};

export function QuestionnairePageClient({
  labels = defaultQuestionnaireLabels,
  initialSectionCode,
}: QuestionnairePageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedSectionCode, setSelectedSectionCode] = useState(
    () => normalizeSectionCode(initialSectionCode) ?? "",
  );
  const [sections, setSections] = useState<QuestionnaireSectionProgress[]>(
    questionnaireSectionProgress,
  );
  const [liveSections, setLiveSections] = useState<QuestionSectionRecord[]>([]);
  const [activeSection, setActiveSection] = useState<ActiveSectionState>({
    name: labels.sections["Company Basics"] ?? "Company Basics",
    subtitle: labels.startFirstSection,
    completion: questionnaireOverviewMock.activeSection.completion,
    completedQuestions: questionnaireOverviewMock.activeSection.completedQuestions,
    totalQuestions: questionnaireOverviewMock.activeSection.totalQuestions,
  });
  const [questions, setQuestions] = useState<QuestionnaireEnergyQuestion[]>(
    questionnaireEnergyQuestions,
  );
  const [liveQuestions, setLiveQuestions] = useState<QuestionItemRecord[]>([]);
  const [liveAnswers, setLiveAnswers] = useState<QuestionAnswerRecord[]>([]);
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
      const session = await getFreshBrowserNhostSession();

      if (!nhost || !session?.user?.id) {
        if (nhost) {
          setQuestions([]);
          setSections([]);
        }
        setIsLoading(false);
        setMessage({
          tone: nhost ? "error" : "info",
          text: nhost ? labels.saveSignInError : labels.mockModeMessage,
        });
        return;
      }

      try {
        let response = await fetch(createQuestionnaireUrl(selectedSectionCode), {
          method: "GET",
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (response.status === 401) {
          const refreshedSession = await forceRefreshBrowserNhostSession();

          if (refreshedSession?.accessToken) {
            response = await fetch(createQuestionnaireUrl(selectedSectionCode), {
              method: "GET",
              headers: {
                authorization: `Bearer ${refreshedSession.accessToken}`,
              },
            });
          }
        }

        const payload = (await response.json()) as QuestionnairePayload;

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
              text: labels.saveSignInError,
            });
            router.push(`/${locale}/login`);
            return;
          }

          setMessage({
            tone: "error",
            text: payload.error ?? labels.loadFallbackError,
          });
          setQuestions([]);
          setSections([]);
          return;
        }

        const allLiveItems = payload.items ?? payload.questions ?? [];
        const activeLiveItems = payload.questions ?? allLiveItems;
        const nextValues = valuesFromAnswers(allLiveItems, payload.answers ?? []);
        const nextDocumentLinks = payload.documentLinks ?? [];
        const nextDocuments = (payload.documents ?? []).map(mapLiveDocument);
        const nextQuestions = mapLiveQuestions(
          activeLiveItems,
          payload.answers ?? [],
          nextValues,
          nextDocumentLinks,
          labels,
        );
        const activePayloadSectionCode =
          payload.activeSectionCode || selectedSectionCode || defaultActiveSectionCode;
        const nextSections = mapLiveSections(
          payload.sections ?? [],
          allLiveItems,
          payload.answers ?? [],
          activePayloadSectionCode,
        );
        const currentSection = payload.sections?.find(
          (section) => section.code === activePayloadSectionCode,
        );
        const currentProgress = nextSections.find(
          (section) => section.id === activePayloadSectionCode,
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
        if (activePayloadSectionCode !== selectedSectionCode) {
          setSelectedSectionCode(activePayloadSectionCode);
        }
        setLiveSections(payload.sections ?? []);
        setSections(nextSections);
        setQuestions(nextQuestions);
        setLiveQuestions(allLiveItems);
        setLiveAnswers(payload.answers ?? []);
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
        setMessage(
          (payload.answers ?? []).length
            ? null
            : { tone: "info", text: `${labels.noAnswersSaved} ${labels.startFirstSection}` },
        );
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Questionnaire live load failed", error);
        }
        if (!cancelled) {
          setQuestions([]);
          setSections([]);
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
  }, [labels, locale, router, selectedSectionCode]);

  const overall = useMemo(() => {
    const completed = sections.reduce((sum, section) => sum + section.completed, 0);
    const total = sections.reduce((sum, section) => sum + section.total, 0);

    if (!liveMode) {
      return {
        completion: questionnaireOverviewMock.completion,
        completedQuestions: questionnaireOverviewMock.completedQuestions,
        totalQuestions: questionnaireOverviewMock.totalQuestions,
      };
    }

    if (total === 0) {
      return {
        completion: 0,
        completedQuestions: 0,
        totalQuestions: 0,
      };
    }

    return {
      completion: calculatePercent(completed, total),
      completedQuestions: completed,
      totalQuestions: total,
    };
  }, [liveMode, sections]);
  const currentSectionIndex = sections.findIndex((section) => section.id === selectedSectionCode);
  const previousSectionCode =
    currentSectionIndex > 0 ? sections[currentSectionIndex - 1]?.id : undefined;
  const nextSectionCode =
    currentSectionIndex >= 0 && currentSectionIndex < sections.length - 1
      ? sections[currentSectionIndex + 1]?.id
      : undefined;

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
      return true;
    }

    const session = await getFreshBrowserNhostSession();

    if (!session?.user?.id) {
      setMessage({
        tone: "error",
        text: labels.saveSignInError,
      });
      return false;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      let response = await fetch("/api/questionnaire", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
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

      if (response.status === 401) {
        const refreshedSession = await forceRefreshBrowserNhostSession();

        if (refreshedSession?.accessToken) {
          response = await fetch("/api/questionnaire", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${refreshedSession.accessToken}`,
            },
            body: JSON.stringify({
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
        }
      }

      const payload = (await response.json()) as {
        saved?: QuestionAnswerRecord[];
        error?: string;
      };

      if (!response.ok) {
        setMessage({
          tone: response.status === 503 ? "info" : "error",
          text: payload.error ?? labels.saveError,
        });
        return false;
      }

      if (payload.saved?.length) {
        const nextAnswers = mergeAnswers(liveAnswers, payload.saved);
        const nextSections = mapLiveSections(
          liveSections,
          liveQuestions,
          nextAnswers,
          selectedSectionCode,
        );
        const currentProgress = nextSections.find((section) => section.id === selectedSectionCode);
        const activeLiveItems = liveQuestions.filter((question) =>
          liveSections.some(
            (section) => section.code === selectedSectionCode && section.id === question.section_id,
          ),
        );
        const nextQuestions = mapLiveQuestions(
          activeLiveItems,
          nextAnswers,
          answerValues,
          documentLinks,
          labels,
        );

        if (process.env.NODE_ENV !== "production") {
          console.info("[questionnaire-completion]", {
            completion_total_questions: liveQuestions.length,
            completion_answered_questions: nextSections.reduce(
              (sum, section) => sum + section.completed,
              0,
            ),
            section_code: selectedSectionCode,
            section_total: currentProgress?.total ?? 0,
            section_answered: currentProgress?.completed ?? 0,
          });
        }

        setLiveAnswers(nextAnswers);
        setSections(nextSections);
        setQuestions(nextQuestions);
        setActiveSection((current) => ({
          ...current,
          completion: calculatePercent(
            currentProgress?.completed ?? 0,
            currentProgress?.total ?? activeLiveItems.length,
          ),
          completedQuestions: currentProgress?.completed ?? 0,
          totalQuestions: currentProgress?.total ?? activeLiveItems.length,
        }));
      }

      setMessage({ tone: "success", text: labels.saveSuccess });
      return true;
    } catch (error) {
      console.error("Questionnaire save failed", error);
      setMessage({
        tone: "error",
        text: labels.saveError,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAttachEvidence(documentIds: string[]) {
    if (!questionToAttach || documentIds.length === 0) {
      setMessage({ tone: "error", text: labels.attachSelectDocumentFirst });
      return false;
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
      return true;
    }

    const selectedDocumentIds = documentIds
      .map((documentId) =>
        resolveEvidenceDocumentId(
          organizationDocuments.find((document) => document.id === documentId) ?? {
            id: documentId,
          },
        ),
      )
      .filter(Boolean);
    const questionItemIds = normalizeQuestionItemIds([questionToAttach.id]);

    if (
      !selectedDocumentIds.length ||
      selectedDocumentIds.length !== documentIds.length ||
      !questionItemIds.length
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[questionnaire] attach evidence blocked before request", {
          flow: "questionnaire_page",
          hasDocumentId:
            selectedDocumentIds.length > 0 && selectedDocumentIds.length === documentIds.length,
          questionItemCount: questionItemIds.length,
        });
      }

      setMessage({ tone: "error", text: labels.attachSelectDocumentFirst });
      return false;
    }

    const session = await getFreshBrowserNhostSession();

    if (!session?.user?.id) {
      setMessage({ tone: "error", text: labels.attachSignInError });
      return false;
    }

    setIsAttaching(true);
    setMessage(null);

    try {
      let latestLinks = documentLinks;

      for (const documentId of selectedDocumentIds) {
        if (process.env.NODE_ENV !== "production") {
          console.info("[questionnaire] attach evidence request", {
            flow: "questionnaire_page",
            hasDocumentId: Boolean(documentId),
            questionItemCount: questionItemIds.length,
          });
        }

        const { response, payload } = await linkDocumentToQuestionItems<DocumentLinkRecord>({
          accessToken: session.accessToken,
          documentId,
          questionItemIds,
        });

        if (!response.ok || !payload.links) {
          setMessage({
            tone: response.status === 503 ? "info" : "error",
            text: payload.error ?? labels.attachError,
          });
          return false;
        }

        latestLinks = payload.links;
      }

      setDocumentLinks(latestLinks);
      const attachedQuestionAnswerId =
        questionToAttach.answerId ??
        latestLinks.find(
          (link) => link.question_answer?.question_item_id === questionToAttach.id,
        )?.question_answer_id ??
        "";
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          question.id === questionToAttach.id
            ? {
                ...question,
                answerId: attachedQuestionAnswerId || question.answerId,
                status: question.status === "Needs evidence" ? "Completed" : question.status,
                linkedDocuments: linkedDocumentsForAnswer(
                  attachedQuestionAnswerId,
                  latestLinks,
                ),
              }
            : question,
        ),
      );
      setIsAttachDialogOpen(false);
      setMessage({ tone: "success", text: labels.attachSuccess });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Attach evidence failed", error);
      }
      setMessage({
        tone: "error",
        text: labels.attachError,
      });
      return false;
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
          <Button variant="outline" render={<Link href={`/${locale}/dashboard/share`} />}>
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
        </div>
      </header>

      {message ? <QuestionnaireMessage message={message} /> : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <QuestionnaireSectionList
          completion={overall.completion}
          completedQuestions={overall.completedQuestions}
          totalQuestions={overall.totalQuestions}
          sections={sections}
          onSelectSection={setSelectedSectionCode}
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
                    const hasQuestionItemId =
                      normalizeQuestionItemIds([selectedQuestion.id]).length === 1;

                    if (!hasQuestionItemId) {
                      if (process.env.NODE_ENV !== "production") {
                        console.warn("[questionnaire] attach evidence blocked", {
                          flow: "questionnaire_page",
                          action: "question_card_attach",
                          hasQuestionItemId: false,
                        });
                      }

                      setMessage({ tone: "error", text: labels.attachError });
                      return;
                    }

                    if (liveMode && organizationDocuments.length === 0) {
                      setMessage({ tone: "info", text: labels.attachSelectDocumentFirst });
                      return;
                    }

                    setQuestionToAttach(selectedQuestion);
                    setIsAttachDialogOpen(true);
                  }}
                  labels={labels}
                />
              ))}
            </div>
          )}

          <footer className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={!previousSectionCode}
              onClick={() => {
                if (previousSectionCode) {
                  setSelectedSectionCode(previousSectionCode);
                }
              }}
            >
              <ArrowLeft data-icon="inline-start" />
              {labels.previousSection}
            </Button>
            <Button
              className="shadow-lg shadow-blue-600/15"
              disabled={isSaving}
              onClick={async () => {
                const saved = await handleSave();

                if (saved && nextSectionCode) {
                  setSelectedSectionCode(nextSectionCode);
                }
              }}
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
          relatedDocumentsUnavailable={labels.relatedDocumentsUnavailable}
          needHelpTitle={labels.needHelpTitle}
          needHelpText={labels.needHelpText}
          contactSupportLabel={labels.contactSupport}
          evidenceRecommendations={labels.evidenceRecommendations}
          relatedDocuments={labels.relatedDocuments}
          onUploadEvidence={() => {
            router.push(`/${locale}/dashboard/documents`);
          }}
        />
      </div>

      <AttachEvidenceDialog
        open={isAttachDialogOpen}
        documents={
          liveMode
            ? organizationDocuments
            : organizationDocuments.length
              ? organizationDocuments
              : mockEvidenceDocuments()
        }
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
        value: value === true ? "Yes" : value === false ? "No" : "",
      };
    }

    if (item.answer_type === "date") {
      return {
        ...evidenceFields,
        id: item.id,
        prompt,
        status,
        type: "date",
        value: typeof value === "string" ? normalizeDateInputValue(value) : "",
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
  questionItems: QuestionItemRecord[],
  answers: QuestionAnswerRecord[],
  activeSectionCode: string,
): QuestionnaireSectionProgress[] {
  return sectionRecords.map((section) => {
    const completion = calculateSectionCompletion(section, questionItems, answers);

    if (process.env.NODE_ENV !== "production") {
      console.info("[questionnaire-completion]", {
        section_code: section.code,
        section_total: completion.totalCount,
        section_answered: completion.answeredCount,
      });
    }

    return {
      id: section.code,
      name: section.title,
      completed: completion.answeredCount,
      total: completion.totalCount,
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

function mergeAnswers(
  currentAnswers: QuestionAnswerRecord[],
  savedAnswers: QuestionAnswerRecord[],
) {
  const answersByQuestion = new Map(
    currentAnswers.map((answer) => [answer.question_item_id, answer]),
  );

  for (const answer of savedAnswers) {
    answersByQuestion.set(answer.question_item_id, answer);
  }

  return Array.from(answersByQuestion.values());
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

  if (question.type === "date") {
    return {
      ...question,
      status,
      value: typeof value === "string" ? normalizeDateInputValue(value) : "",
    };
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

  if (question.answer_type === "date") {
    return typeof value === "string" ? normalizeDateInputValue(value) : "";
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

  if (question.answer_type === "date") {
    return typeof value === "string" ? normalizeDateInputValue(value) || null : null;
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

function normalizeSectionCode(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return /^[a-z0-9_ -]+$/i.test(trimmed) ? trimmed : null;
}

function createQuestionnaireUrl(sectionCode: string) {
  const normalizedSectionCode = normalizeSectionCode(sectionCode);

  if (!normalizedSectionCode) {
    return "/api/questionnaire";
  }

  return `/api/questionnaire?sectionCode=${encodeURIComponent(normalizedSectionCode)}`;
}

function normalizeDateInputValue(value: string) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isValidCalendarDate(trimmed) ? trimmed : "";
  }

  const dayMonthYear = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);

  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear;
    if (!day || !month || !year) {
      return "";
    }

    const normalized = `${year}-${month}-${day}`;

    return isValidCalendarDate(normalized) ? normalized : "";
  }

  return "";
}

function isValidCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
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
      id: "environmental-policy-evidence",
      title: "Environmental Policy Evidence",
      fileName: "environmental_policy_evidence.pdf",
      fileSize: "2.4 MB",
      type: "Certificate",
      linkedTo: ["ENV-1.1"],
      uploaded: "May 12, 2024",
      uploadedBy: "Workspace user",
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
      uploadedBy: "Workspace user",
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
