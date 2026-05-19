import type { GraphqlJson } from "@/lib/data/questionnaire";

export type CompletionAnswer = {
  question_item_id: string;
  value: GraphqlJson | undefined;
  status?: string | null;
};

export type CompletionQuestion = {
  id: string;
  section_id: string;
};

export type CompletionSection = {
  id: string;
};

export type CompletionResult = {
  answeredCount: number;
  totalCount: number;
  percent: number;
};

export function hasAnswerValue(answer: Pick<CompletionAnswer, "value"> | null | undefined) {
  if (!answer) {
    return false;
  }

  const { value } = answer;

  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

export function isQuestionAnswered(answer: CompletionAnswer | null | undefined) {
  if (!answer) {
    return false;
  }

  if (answer.status === "not_started") {
    return false;
  }

  if (hasAnswerValue(answer)) {
    return true;
  }

  return answer.status === "completed" || answer.status === "reviewed" || answer.status === "evidence_attached";
}

export function calculateSectionCompletion(
  section: CompletionSection,
  questions: CompletionQuestion[],
  answers: CompletionAnswer[],
): CompletionResult {
  const sectionQuestions = questions.filter((question) => question.section_id === section.id);
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const answeredCount = sectionQuestions.filter((question) =>
    isQuestionAnswered(answersByQuestion.get(question.id)),
  ).length;

  return {
    answeredCount,
    totalCount: sectionQuestions.length,
    percent: calculatePercent(answeredCount, sectionQuestions.length),
  };
}

export function calculateOverallCompletion(
  sections: CompletionSection[],
  questions: CompletionQuestion[],
  answers: CompletionAnswer[],
): CompletionResult {
  const sectionIds = new Set(sections.map((section) => section.id));
  const scopedQuestions = questions.filter((question) => sectionIds.has(question.section_id));
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const answeredCount = scopedQuestions.filter((question) =>
    isQuestionAnswered(answersByQuestion.get(question.id)),
  ).length;

  return {
    answeredCount,
    totalCount: scopedQuestions.length,
    percent: calculatePercent(answeredCount, scopedQuestions.length),
  };
}

function calculatePercent(answeredCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return 0;
  }

  return Math.round((answeredCount / totalCount) * 100);
}
