import { getMessages, setRequestLocale } from "next-intl/server";
import { QuestionnairePageClient } from "@/components/questionnaire/questionnaire-page-client";
import {
  defaultQuestionnaireLabels,
  type QuestionnaireLabels,
} from "@/lib/workspace-labels";

type QuestionnairePageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ section?: string | string[] }>;
};

export default async function QuestionnairePage({ params, searchParams }: QuestionnairePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { questionnaire?: Partial<QuestionnaireLabels> };
  const source = messages.questionnaire ?? {};

  const labels: QuestionnaireLabels = {
    ...defaultQuestionnaireLabels,
    ...source,
    sections: { ...defaultQuestionnaireLabels.sections, ...source.sections },
    questionPrompts: {
      ...defaultQuestionnaireLabels.questionPrompts,
      ...source.questionPrompts,
    },
    questionOptions: {
      ...defaultQuestionnaireLabels.questionOptions,
      ...source.questionOptions,
    },
    contextualHelp: {
      ...defaultQuestionnaireLabels.contextualHelp,
      ...source.contextualHelp,
    },
    helperTexts: { ...defaultQuestionnaireLabels.helperTexts, ...source.helperTexts },
    statuses: { ...defaultQuestionnaireLabels.statuses, ...source.statuses },
    documentStatuses: {
      ...defaultQuestionnaireLabels.documentStatuses,
      ...source.documentStatuses,
    },
    documentTypes: { ...defaultQuestionnaireLabels.documentTypes, ...source.documentTypes },
  };

  return <QuestionnairePageClient labels={labels} initialSectionCode={readSectionParam(query)} />;
}

function readSectionParam(searchParams?: { section?: string | string[] }) {
  const value = searchParams?.section;
  const section = Array.isArray(value) ? value[0] : value;

  return typeof section === "string" && section.trim() ? section.trim() : undefined;
}
