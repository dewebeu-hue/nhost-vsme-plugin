export type PassportSummarySection = {
  id: string;
  code: string;
  title: string;
};

export type PassportSummaryQuestion = {
  id: string;
  section_id: string;
  code: string;
  title: string;
  evidence_required?: boolean;
};

export type PassportSummaryAnswer = {
  id?: string;
  question_item_id: string;
  value: unknown;
  status?: string | null;
};

export type PassportSummaryDocument = {
  status: string;
  document_type?: string | null;
  linked_question_answer_ids?: string[];
};

export type PassportReadinessModuleSummary = {
  label: string;
  value: number;
};

export type PassportSectionSummary = {
  title: string;
  completion: number;
  approvedAnswers: number;
  linkedDocuments: number;
  visibility: "Shared" | "Hidden";
};

export type PassportMissingDataItemSummary = {
  label: string;
  status: "warning" | "review" | "recommended" | "approved";
};

export const passportEvidenceTypesBySectionCode: Record<string, string[]> = {
  company_basics: ["report", "other"],
  employees: ["training", "report", "other"],
  energy: ["utility_bill", "report"],
  fuel: ["utility_bill", "report"],
  waste: ["waste_report", "report"],
  environmental_policies: ["policy", "report"],
  health_safety: ["safety", "training", "certificate"],
  certifications: ["certificate"],
  governance: ["policy", "report"],
  supplier_information: ["customer_questionnaire", "report", "other"],
};

const passportModuleGroups = [
  { label: "Basic Information", title: "Company overview", sectionCodes: ["company_basics"] },
  {
    label: "Environment",
    title: "Environment",
    sectionCodes: ["energy", "fuel", "waste", "environmental_policies", "certifications"],
  },
  { label: "Social", title: "Social", sectionCodes: ["employees", "health_safety"] },
  {
    label: "Governance",
    title: "Governance",
    sectionCodes: ["governance", "supplier_information"],
  },
] as const;

export function calculatePassportReadinessScore(
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
) {
  return calculatePercent(countAnsweredQuestions(questions, answers), questions.length);
}

export function createPassportReadinessModules(
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
): PassportReadinessModuleSummary[] {
  return passportModuleGroups.map((group) => {
    const scopedQuestions = getQuestionsForSectionCodes(group.sectionCodes, sections, questions);

    return {
      label: group.label,
      value: calculatePercent(countAnsweredQuestions(scopedQuestions, answers), scopedQuestions.length),
    };
  });
}

export function createPassportSectionSummaries(
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
  documents: PassportSummaryDocument[] = [],
): PassportSectionSummary[] {
  const reviewedDocuments = documents.filter((document) => isEvidenceDocumentAvailable(document));

  return [
    ...passportModuleGroups.map((group) => {
      const scopedQuestions = getQuestionsForSectionCodes(group.sectionCodes, sections, questions);
      const answeredCount = countAnsweredQuestions(scopedQuestions, answers);
      const linkedDocuments = countEvidenceDocumentsForSectionCodes(
        group.sectionCodes,
        sections,
        questions,
        answers,
        documents,
      );

      return {
        title: group.title,
        completion: calculatePercent(answeredCount, scopedQuestions.length),
        approvedAnswers: answeredCount,
        linkedDocuments,
        visibility: "Shared" as const,
      };
    }),
    {
      title: "Evidence summary",
      completion: calculatePercent(reviewedDocuments.length, documents.length),
      approvedAnswers: 0,
      linkedDocuments: reviewedDocuments.length,
      visibility: "Shared",
    },
  ];
}

export function createMissingDataItems(
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
  limit = 5,
): PassportMissingDataItemSummary[] {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));

  return questions
    .filter((question) => !isQuestionAnswered(answersByQuestion.get(question.id)))
    .sort((a, b) => Number(Boolean(b.evidence_required)) - Number(Boolean(a.evidence_required)))
    .slice(0, limit)
    .map((question) => {
      const section = sectionById.get(question.section_id);

      return {
        label: section ? `${section.title}: ${question.title}` : question.title,
        status: question.evidence_required ? "warning" : "recommended",
      };
    });
}

export function createMissingEvidenceItems(
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
  documents: PassportSummaryDocument[],
  labelsBySectionCode?: Record<string, string>,
  limit = 5,
): PassportMissingDataItemSummary[] {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));

  return sections
    .filter((section) => {
      const sectionQuestions = questions.filter((question) => question.section_id === section.id);
      const hasAnsweredQuestion = sectionQuestions.some((question) =>
        isQuestionAnswered(answersByQuestion.get(question.id)),
      );

      return (
        hasAnsweredQuestion &&
        countEvidenceDocumentsForSectionCodes([section.code], sections, questions, answers, documents) === 0
      );
    })
    .slice(0, limit)
    .map((section) => ({
      label: labelsBySectionCode?.[section.code] ?? `${section.title} evidence is missing`,
      status: "warning",
    }));
}

function getQuestionsForSectionCodes(
  sectionCodes: readonly string[],
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
) {
  const sectionIds = new Set(
    sections.filter((section) => sectionCodes.includes(section.code)).map((section) => section.id),
  );

  return questions.filter((question) => sectionIds.has(question.section_id));
}

function countEvidenceDocumentsForSectionCodes(
  sectionCodes: readonly string[],
  sections: PassportSummarySection[],
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
  documents: PassportSummaryDocument[],
) {
  const matchingTypes = new Set(
    sectionCodes.flatMap((sectionCode) => passportEvidenceTypesBySectionCode[sectionCode] ?? []),
  );
  const matchingSectionIds = new Set(
    sections.filter((section) => sectionCodes.includes(section.code)).map((section) => section.id),
  );
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const answerById = new Map(
    answers.flatMap((answer) => (answer.id ? [[answer.id, answer] as const] : [])),
  );

  return documents.filter(
    (document) =>
      isEvidenceDocumentAvailable(document) &&
      (hasLinkedEvidenceForSections(document, matchingSectionIds, questionById, answerById) ||
        (Boolean(document.document_type) && matchingTypes.has(String(document.document_type)))),
  ).length;
}

function isEvidenceDocumentAvailable(document: PassportSummaryDocument) {
  return ["reviewed", "linked", "uploaded", "needs_review", "expiring_soon"].includes(document.status);
}

function hasLinkedEvidenceForSections(
  document: PassportSummaryDocument,
  matchingSectionIds: Set<string>,
  questionById: Map<string, PassportSummaryQuestion>,
  answerById: Map<string, PassportSummaryAnswer>,
) {
  return (document.linked_question_answer_ids ?? []).some((answerId) => {
    const answer = answerById.get(answerId);
    const question = answer ? questionById.get(answer.question_item_id) : undefined;

    return Boolean(question && matchingSectionIds.has(question.section_id));
  });
}

function countAnsweredQuestions(
  questions: PassportSummaryQuestion[],
  answers: PassportSummaryAnswer[],
) {
  const answersByQuestion = new Map(answers.map((answer) => [answer.question_item_id, answer]));

  return questions.filter((question) => isQuestionAnswered(answersByQuestion.get(question.id))).length;
}

function isQuestionAnswered(answer: PassportSummaryAnswer | undefined) {
  if (!answer || answer.status === "not_started") {
    return false;
  }

  if (hasAnswerValue(answer.value)) {
    return true;
  }

  return answer.status === "completed" || answer.status === "reviewed";
}

function hasAnswerValue(value: unknown) {
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

function calculatePercent(answered: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((answered / total) * 100);
}
