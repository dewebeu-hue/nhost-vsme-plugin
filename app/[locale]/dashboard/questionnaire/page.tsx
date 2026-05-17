import { getMessages, setRequestLocale } from "next-intl/server";
import { QuestionnairePageClient } from "@/components/questionnaire/questionnaire-page-client";
import {
  defaultQuestionnaireLabels,
  type QuestionnaireLabels,
} from "@/lib/workspace-labels";

type QuestionnairePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { locale } = await params;
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
    helperTexts: { ...defaultQuestionnaireLabels.helperTexts, ...source.helperTexts },
    statuses: { ...defaultQuestionnaireLabels.statuses, ...source.statuses },
    documentStatuses: {
      ...defaultQuestionnaireLabels.documentStatuses,
      ...source.documentStatuses,
    },
    documentTypes: { ...defaultQuestionnaireLabels.documentTypes, ...source.documentTypes },
  };

  return <QuestionnairePageClient labels={labels} />;
}
