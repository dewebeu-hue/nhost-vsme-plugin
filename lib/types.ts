export type QuestionAnswerStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_evidence"
  | "reviewed";

export type DocumentStatus =
  | "uploaded"
  | "linked"
  | "reviewed"
  | "expiring_soon"
  | "needs_review";

export type PlanName = "Starter" | "Growth" | "Enterprise";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "contributor" | "viewer";
  title: string;
  avatarUrl?: string;
  organizationId: string;
};

export type Organization = {
  id: string;
  name: string;
  legalName: string;
  country: string;
  city: string;
  industry: string;
  employeeCount: number;
  verified: boolean;
  plan: PlanName;
  renewalDate: string;
  readinessScore: number;
  vatId: string;
  website: string;
};

export type ReadinessModule = {
  id: string;
  title: string;
  description: string;
  status: QuestionAnswerStatus;
  completion: number;
  completedQuestions: number;
  totalQuestions: number;
  owner: string;
  dueDate: string;
};

export type MissingDataSummary = {
  id: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "high";
  moduleId: string;
};

export type BuyerRequest = {
  id: string;
  buyerName: string;
  buyerCompany: string;
  requestedBy: string;
  topic: string;
  status: QuestionAnswerStatus;
  dueDate: string;
  priority: "low" | "medium" | "high";
  message: string;
};

export type UploadedDocument = {
  id: string;
  name: string;
  category: string;
  status: DocumentStatus;
  owner: string;
  uploadedAt: string;
  size: string;
  linkedQuestionIds: string[];
  expiryDate?: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  status: QuestionAnswerStatus;
  assigneeId: string;
  dueDate: string;
  moduleId?: string;
  relatedDocumentId?: string;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "questionnaire" | "document" | "share" | "review" | "admin";
};

export type ReadinessTimelinePoint = {
  label: string;
  score: number;
  completedModules: number;
};

export type QuestionnaireSection = {
  id: string;
  title: string;
  description: string;
  status: QuestionAnswerStatus;
  progress: number;
  moduleId: string;
  questionIds: string[];
};

export type QuestionnaireQuestion = {
  id: string;
  sectionId: string;
  prompt: string;
  helpText: string;
  status: QuestionAnswerStatus;
  answerType: "text" | "textarea" | "select" | "number" | "date" | "boolean";
  answer?: string;
  options?: string[];
  requiredEvidence: boolean;
  linkedDocumentIds: string[];
};

export type EvidenceDocument = UploadedDocument & {
  evidenceType: "policy" | "certificate" | "report" | "register" | "invoice" | "other";
  approvedForPassport: boolean;
  reviewedBy?: string;
};

export type PassportShare = {
  id: string;
  buyerCompany: string;
  buyerContact: string;
  status: QuestionAnswerStatus;
  accessLevel: "summary" | "evidence" | "full";
  createdAt: string;
  expiresAt: string;
  url: string;
  lastViewedAt?: string;
};

export type AdminOrganization = {
  id: string;
  name: string;
  country: string;
  plan: PlanName;
  verified: boolean;
  readinessScore: number;
  openReviews: number;
  renewalDate: string;
};

export type AdminReview = {
  id: string;
  organizationId: string;
  reviewer: string;
  status: QuestionAnswerStatus;
  topic: string;
  submittedAt: string;
  dueDate: string;
};

export type AdminNote = {
  id: string;
  organizationId: string;
  author: string;
  createdAt: string;
  note: string;
  visibility: "internal" | "customer_visible";
};
