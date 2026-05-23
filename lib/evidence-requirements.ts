export type EvidenceRequirementQuestion = {
  answer_type?: string | null;
  type?: string | null;
  evidence_required?: boolean | null;
  evidenceRequired?: boolean | null;
};

export function doesAnswerRequireEvidence(
  question: EvidenceRequirementQuestion,
  value: unknown,
) {
  if (!hasEvidenceRequiredFlag(question) || isAnswerValueEmpty(value)) {
    return false;
  }

  if (isBooleanQuestion(question)) {
    return isPositiveBooleanAnswer(value);
  }

  return true;
}

export function isAnswerValueEmpty(value: unknown) {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return false;
}

function hasEvidenceRequiredFlag(question: EvidenceRequirementQuestion) {
  return Boolean(question.evidence_required ?? question.evidenceRequired);
}

function isBooleanQuestion(question: EvidenceRequirementQuestion) {
  return question.answer_type === "boolean" || question.type === "yes-no";
}

function isPositiveBooleanAnswer(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["yes", "true", "da", "1"].includes(value.trim().toLowerCase());
  }

  return false;
}
