import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ActivityItem,
  AdminNote,
  AdminOrganization,
  AdminReview,
  BuyerRequest,
  EvidenceDocument,
  MissingDataSummary,
  Organization,
  PassportShare,
  QuestionAnswerStatus,
  QuestionnaireQuestion,
  QuestionnaireSection,
  ReadinessModule,
  ReadinessTimelinePoint,
  TaskItem,
  UploadedDocument,
  User,
} from "@/lib/types";

export type Metric = {
  title: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
  tone: "blue" | "teal" | "green" | "amber" | "purple";
};

export const currentUser: User = {
  id: "user-elena-markovic",
  name: "Elena Markovic",
  email: "elena.markovic@acme-manufacturing.example",
  role: "owner",
  title: "Compliance Lead",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
  organizationId: "org-acme-manufacturing",
};

export const currentOrganization: Organization = {
  id: "org-acme-manufacturing",
  name: "Acme Manufacturing GmbH",
  legalName: "Acme Manufacturing GmbH",
  country: "Germany",
  city: "Munich",
  industry: "Industrial components manufacturing",
  employeeCount: 126,
  verified: true,
  plan: "Starter",
  renewalDate: "2025-05-12",
  readinessScore: 72,
  vatId: "DE123456789",
  website: "https://acme-manufacturing.example",
};

export const readinessScore = {
  value: currentOrganization.readinessScore,
  label: "VSME readiness",
  summary: "Core company profile is verified; evidence gaps remain in workforce and climate disclosures.",
  updatedAt: "2026-05-14T09:20:00.000Z",
} as const;

export const vsmeModules: ReadinessModule[] = [
  {
    id: "module-company",
    title: "Company profile",
    description: "Legal identity, business model, ownership, and operating footprint.",
    status: "reviewed",
    completion: 100,
    completedQuestions: 8,
    totalQuestions: 8,
    owner: "Elena Markovic",
    dueDate: "2026-05-05",
  },
  {
    id: "module-environment",
    title: "Environment",
    description: "Energy, emissions, water, waste, and environmental policies.",
    status: "in_progress",
    completion: 68,
    completedQuestions: 13,
    totalQuestions: 19,
    owner: "Jonas Weber",
    dueDate: "2026-05-24",
  },
  {
    id: "module-social",
    title: "Social and workforce",
    description: "Employee data, training, health and safety, and worker representation.",
    status: "needs_evidence",
    completion: 54,
    completedQuestions: 7,
    totalQuestions: 13,
    owner: "Marta Klein",
    dueDate: "2026-05-28",
  },
  {
    id: "module-governance",
    title: "Governance",
    description: "Code of conduct, compliance controls, and responsible procurement.",
    status: "completed",
    completion: 86,
    completedQuestions: 12,
    totalQuestions: 14,
    owner: "Elena Markovic",
    dueDate: "2026-05-18",
  },
];

export const missingDataSummary: MissingDataSummary[] = [
  {
    id: "missing-scope-2",
    label: "Scope 2 energy evidence",
    count: 2,
    severity: "high",
    moduleId: "module-environment",
  },
  {
    id: "missing-training",
    label: "Workforce training records",
    count: 3,
    severity: "medium",
    moduleId: "module-social",
  },
  {
    id: "missing-procurement",
    label: "Supplier screening policy",
    count: 1,
    severity: "medium",
    moduleId: "module-governance",
  },
];

export const buyerRequests: BuyerRequest[] = [
  {
    id: "buyer-request-1001",
    buyerName: "Sofia Laurent",
    buyerCompany: "NordHaus Retail Group",
    requestedBy: "sofia.laurent@nordhaus.example",
    topic: "Updated electricity consumption evidence",
    status: "needs_evidence",
    dueDate: "2026-05-22",
    priority: "high",
    message:
      "Please attach the latest utility statement or energy management export for the Munich facility.",
  },
  {
    id: "buyer-request-1002",
    buyerName: "Matteo Ricci",
    buyerCompany: "Alpine Mobility AG",
    requestedBy: "matteo.ricci@alpinemobility.example",
    topic: "Health and safety incident rate",
    status: "in_progress",
    dueDate: "2026-05-27",
    priority: "medium",
    message:
      "The procurement team needs the 2025 incident rate and supporting register before supplier onboarding.",
  },
  {
    id: "buyer-request-1003",
    buyerName: "Hannah De Vries",
    buyerCompany: "EuroBuild Components",
    requestedBy: "hannah.devries@eurobuild.example",
    topic: "Governance review confirmation",
    status: "reviewed",
    dueDate: "2026-05-16",
    priority: "low",
    message: "Governance evidence has been reviewed and accepted for the current sourcing cycle.",
  },
];

export const recentUploads: UploadedDocument[] = [
  {
    id: "upload-2048",
    name: "Electricity invoices Q1 2026.pdf",
    category: "Environment",
    status: "linked",
    owner: "Jonas Weber",
    uploadedAt: "2026-05-14T08:45:00.000Z",
    size: "2.4 MB",
    linkedQuestionIds: ["q-env-energy-consumption"],
  },
  {
    id: "upload-2049",
    name: "Code of conduct 2026.pdf",
    category: "Governance",
    status: "reviewed",
    owner: "Elena Markovic",
    uploadedAt: "2026-05-12T14:10:00.000Z",
    size: "840 KB",
    linkedQuestionIds: ["q-gov-code-conduct"],
  },
  {
    id: "upload-2050",
    name: "Safety training attendance.xlsx",
    category: "Social",
    status: "needs_review",
    owner: "Marta Klein",
    uploadedAt: "2026-05-10T11:25:00.000Z",
    size: "410 KB",
    linkedQuestionIds: ["q-social-training"],
  },
];

export const tasks: TaskItem[] = [
  {
    id: "task-301",
    title: "Confirm renewable electricity percentage",
    description: "Add supporting data for purchased electricity and renewable certificates.",
    status: "needs_evidence",
    assigneeId: "user-elena-markovic",
    dueDate: "2026-05-22",
    moduleId: "module-environment",
    relatedDocumentId: "upload-2048",
  },
  {
    id: "task-302",
    title: "Review workforce training register",
    description: "Check whether the uploaded register covers all production sites.",
    status: "in_progress",
    assigneeId: "user-elena-markovic",
    dueDate: "2026-05-24",
    moduleId: "module-social",
    relatedDocumentId: "upload-2050",
  },
  {
    id: "task-303",
    title: "Publish buyer passport link",
    description: "Share the reviewed profile with NordHaus Retail Group.",
    status: "not_started",
    assigneeId: "user-elena-markovic",
    dueDate: "2026-05-26",
  },
];

export const readinessTimeline: ReadinessTimelinePoint[] = [
  { label: "Jan", score: 38, completedModules: 0 },
  { label: "Feb", score: 45, completedModules: 0 },
  { label: "Mar", score: 53, completedModules: 1 },
  { label: "Apr", score: 61, completedModules: 1 },
  { label: "May", score: 72, completedModules: 2 },
  { label: "Jun", score: 78, completedModules: 2 },
];

export const activeShareLinks: PassportShare[] = [
  {
    id: "share-901",
    buyerCompany: "NordHaus Retail Group",
    buyerContact: "Sofia Laurent",
    status: "in_progress",
    accessLevel: "evidence",
    createdAt: "2026-05-12T09:00:00.000Z",
    expiresAt: "2026-05-28T23:59:59.000Z",
    url: "https://supplier-passport.example/p/acme-manufacturing/nordhaus",
    lastViewedAt: "2026-05-15T16:35:00.000Z",
  },
  {
    id: "share-902",
    buyerCompany: "Alpine Mobility AG",
    buyerContact: "Matteo Ricci",
    status: "not_started",
    accessLevel: "summary",
    createdAt: "2026-05-08T10:30:00.000Z",
    expiresAt: "2026-05-24T23:59:59.000Z",
    url: "https://supplier-passport.example/p/acme-manufacturing/alpine",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "activity-701",
    actor: "Elena Markovic",
    action: "approved",
    target: "Company profile module",
    timestamp: "2026-05-15T14:20:00.000Z",
    type: "review",
  },
  {
    id: "activity-702",
    actor: "Jonas Weber",
    action: "uploaded",
    target: "Electricity invoices Q1 2026.pdf",
    timestamp: "2026-05-14T08:45:00.000Z",
    type: "document",
  },
  {
    id: "activity-703",
    actor: "Sofia Laurent",
    action: "requested",
    target: "Updated electricity consumption evidence",
    timestamp: "2026-05-13T12:10:00.000Z",
    type: "share",
  },
];

export const questionnaireSections: QuestionnaireSection[] = [
  {
    id: "section-company-basics",
    title: "Company basics",
    description: "Confirm business identity, operating sites, and revenue band.",
    status: "reviewed",
    progress: 100,
    moduleId: "module-company",
    questionIds: ["q-company-legal-name", "q-company-sites"],
  },
  {
    id: "section-environment-energy",
    title: "Energy and emissions",
    description: "Capture energy use, emissions boundaries, and supporting evidence.",
    status: "needs_evidence",
    progress: 62,
    moduleId: "module-environment",
    questionIds: ["q-env-energy-consumption", "q-env-renewable-share"],
  },
  {
    id: "section-social-workforce",
    title: "Workforce practices",
    description: "Track workforce composition, training, safety, and worker voice.",
    status: "in_progress",
    progress: 54,
    moduleId: "module-social",
    questionIds: ["q-social-training", "q-social-safety-rate"],
  },
  {
    id: "section-governance-controls",
    title: "Governance controls",
    description: "Document policies, procurement controls, and compliance ownership.",
    status: "completed",
    progress: 86,
    moduleId: "module-governance",
    questionIds: ["q-gov-code-conduct", "q-gov-supplier-screening"],
  },
];

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: "q-company-legal-name",
    sectionId: "section-company-basics",
    prompt: "What is the organization's registered legal name?",
    helpText: "Use the name shown on registration and VAT documents.",
    status: "reviewed",
    answerType: "text",
    answer: "Acme Manufacturing GmbH",
    requiredEvidence: false,
    linkedDocumentIds: [],
  },
  {
    id: "q-company-sites",
    sectionId: "section-company-basics",
    prompt: "How many operating sites are included in this passport?",
    helpText: "Include production, warehouse, and administrative locations.",
    status: "completed",
    answerType: "number",
    answer: "3",
    requiredEvidence: false,
    linkedDocumentIds: [],
  },
  {
    id: "q-env-energy-consumption",
    sectionId: "section-environment-energy",
    prompt: "What was total purchased electricity consumption for the last reporting year?",
    helpText: "Use kWh from invoices, metering exports, or energy management systems.",
    status: "needs_evidence",
    answerType: "number",
    answer: "842000",
    requiredEvidence: true,
    linkedDocumentIds: ["doc-energy-summary", "upload-2048"],
  },
  {
    id: "q-env-renewable-share",
    sectionId: "section-environment-energy",
    prompt: "What percentage of purchased electricity came from renewable sources?",
    helpText: "Attach certificates or supplier declarations if available.",
    status: "in_progress",
    answerType: "number",
    answer: "38",
    requiredEvidence: true,
    linkedDocumentIds: [],
  },
  {
    id: "q-social-training",
    sectionId: "section-social-workforce",
    prompt: "Which mandatory workforce training programs were completed this year?",
    helpText: "Include safety, ethics, anti-harassment, and role-specific training.",
    status: "needs_evidence",
    answerType: "textarea",
    answer: "Safety onboarding, machine operation refreshers, and code of conduct training.",
    requiredEvidence: true,
    linkedDocumentIds: ["upload-2050"],
  },
  {
    id: "q-social-safety-rate",
    sectionId: "section-social-workforce",
    prompt: "What was the reportable health and safety incident rate?",
    helpText: "Use the same method reported internally to management.",
    status: "not_started",
    answerType: "number",
    requiredEvidence: true,
    linkedDocumentIds: [],
  },
  {
    id: "q-gov-code-conduct",
    sectionId: "section-governance-controls",
    prompt: "Does the organization maintain a code of conduct?",
    helpText: "Attach the latest approved policy document.",
    status: "reviewed",
    answerType: "boolean",
    answer: "Yes",
    requiredEvidence: true,
    linkedDocumentIds: ["doc-code-conduct", "upload-2049"],
  },
  {
    id: "q-gov-supplier-screening",
    sectionId: "section-governance-controls",
    prompt: "How are critical suppliers screened for ESG or compliance risks?",
    helpText: "Summarize the screening process and attach any policy or checklist.",
    status: "in_progress",
    answerType: "textarea",
    answer: "Critical suppliers are reviewed during onboarding and annually for high-risk categories.",
    requiredEvidence: true,
    linkedDocumentIds: [],
  },
];

export const documents: EvidenceDocument[] = [
  {
    id: "doc-energy-summary",
    name: "Energy consumption summary 2025.pdf",
    category: "Environment",
    status: "linked",
    owner: "Operations",
    uploadedAt: "2026-05-09T10:15:00.000Z",
    size: "1.8 MB",
    linkedQuestionIds: ["q-env-energy-consumption"],
    evidenceType: "report",
    approvedForPassport: true,
    reviewedBy: "Elena Markovic",
  },
  {
    id: "doc-code-conduct",
    name: "Supplier code of conduct.pdf",
    category: "Governance",
    status: "reviewed",
    owner: "Procurement",
    uploadedAt: "2026-05-07T15:40:00.000Z",
    size: "760 KB",
    linkedQuestionIds: ["q-gov-code-conduct"],
    evidenceType: "policy",
    approvedForPassport: true,
    reviewedBy: "Elena Markovic",
  },
  {
    id: "doc-iso-9001",
    name: "ISO 9001 certificate.pdf",
    category: "Governance",
    status: "expiring_soon",
    owner: "Quality",
    uploadedAt: "2026-04-25T09:30:00.000Z",
    size: "520 KB",
    linkedQuestionIds: [],
    expiryDate: "2026-06-30",
    evidenceType: "certificate",
    approvedForPassport: true,
    reviewedBy: "Elena Markovic",
  },
  {
    id: "doc-training-register",
    name: "Workforce training register.xlsx",
    category: "Social",
    status: "needs_review",
    owner: "People",
    uploadedAt: "2026-05-10T11:25:00.000Z",
    size: "410 KB",
    linkedQuestionIds: ["q-social-training"],
    evidenceType: "register",
    approvedForPassport: false,
  },
];

export const approvedPassportDocuments = documents.filter(
  (document) => document.approvedForPassport,
);

export const adminOrganizations: AdminOrganization[] = [
  {
    id: "org-acme-manufacturing",
    name: "Acme Manufacturing GmbH",
    country: "Germany",
    plan: "Starter",
    verified: true,
    readinessScore: 72,
    openReviews: 2,
    renewalDate: "2025-05-12",
  },
  {
    id: "org-nova-textiles",
    name: "Nova Textiles Sp. z o.o.",
    country: "Poland",
    plan: "Growth",
    verified: true,
    readinessScore: 81,
    openReviews: 1,
    renewalDate: "2026-02-18",
  },
  {
    id: "org-luma-packaging",
    name: "Luma Packaging BV",
    country: "Netherlands",
    plan: "Starter",
    verified: false,
    readinessScore: 43,
    openReviews: 5,
    renewalDate: "2026-01-09",
  },
];

export const adminReviews: AdminReview[] = [
  {
    id: "admin-review-501",
    organizationId: "org-acme-manufacturing",
    reviewer: "Klara Hoffmann",
    status: "in_progress",
    topic: "Environment evidence quality",
    submittedAt: "2026-05-13T10:00:00.000Z",
    dueDate: "2026-05-20",
  },
  {
    id: "admin-review-502",
    organizationId: "org-acme-manufacturing",
    reviewer: "Klara Hoffmann",
    status: "needs_evidence",
    topic: "Social module completeness",
    submittedAt: "2026-05-11T13:30:00.000Z",
    dueDate: "2026-05-21",
  },
  {
    id: "admin-review-503",
    organizationId: "org-nova-textiles",
    reviewer: "Tobias Meyer",
    status: "reviewed",
    topic: "Governance policy review",
    submittedAt: "2026-05-06T09:15:00.000Z",
    dueDate: "2026-05-16",
  },
];

export const adminNotes: AdminNote[] = [
  {
    id: "admin-note-801",
    organizationId: "org-acme-manufacturing",
    author: "Klara Hoffmann",
    createdAt: "2026-05-14T15:20:00.000Z",
    note: "Starter account is a strong candidate for Growth once buyer sharing is active.",
    visibility: "internal",
  },
  {
    id: "admin-note-802",
    organizationId: "org-acme-manufacturing",
    author: "Tobias Meyer",
    createdAt: "2026-05-12T12:05:00.000Z",
    note: "Ask for updated ISO certificate before the next passport refresh.",
    visibility: "customer_visible",
  },
];

const statusLabelMap: Record<QuestionAnswerStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  needs_evidence: "Needs evidence",
  reviewed: "Reviewed",
};

export const readinessMetrics: Metric[] = [
  {
    title: "Readiness score",
    value: `${readinessScore.value}%`,
    helper: readinessScore.label,
    trend: "+11% this quarter",
    icon: TrendingUp,
    tone: "blue",
  },
  {
    title: "Evidence uploaded",
    value: String(documents.length + recentUploads.length),
    helper: "Documents mapped to ESG topics",
    trend: `${documents.filter((document) => document.status === "needs_review").length} pending review`,
    icon: FileCheck2,
    tone: "teal",
  },
  {
    title: "Buyer-ready topics",
    value: `${vsmeModules.filter((module) => module.status === "completed" || module.status === "reviewed").length}/${vsmeModules.length}`,
    helper: "Modules ready for sharing",
    trend: `${missingDataSummary.length} gaps remaining`,
    icon: ShieldCheck,
    tone: "green",
  },
];

export const evidenceDocuments = documents.map((document) => ({
  id: document.id,
  name: document.name,
  category: document.category,
  status: document.status,
  owner: document.owner,
  updatedAt: new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(document.uploadedAt)),
}));

export const activityFeed = [
  {
    title: "Profile reviewed",
    detail: "Company overview and sector data passed review.",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    title: "Evidence request",
    detail: buyerRequests[0]?.message ?? "Buyer requested additional evidence.",
    icon: AlertCircle,
    tone: "amber",
  },
  {
    title: "Passport link expires",
    detail: "Secure access window closes on May 28, 2026.",
    icon: Clock3,
    tone: "blue",
  },
] satisfies Array<{
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber";
}>;

export { statusLabelMap };

export type DashboardModuleCompletion = {
  name: "Basic Information" | "Environment" | "Social" | "Governance";
  completed: number;
  total: number;
  percent: number;
};

export type DashboardMissingDataItem = {
  area: "Environment" | "Social" | "Governance";
  items: number;
};

export type DashboardBuyerRequest = {
  buyer: string;
  module: "VSME Basic" | "VSME Comprehensive";
  status: "In progress" | "Requested" | "Not started";
  dueDate: string;
};

export type DashboardUpload = {
  name: string;
  category: "Environment" | "Social" | "Governance";
  uploadedAt: string;
};

export type DashboardTask = {
  title: string;
  category: "Environment" | "Governance";
  due: string;
  completed: boolean;
};

export type DashboardShareLink = {
  buyer: string;
  module: "VSME Basic" | "VSME Comprehensive";
  status: "Active";
  expires: string;
};

export type DashboardActivity = {
  text: string;
};

export const dashboardOverview = {
  userName: "Anna",
  readiness: 72,
  readinessLabel: "Good progress",
  lastUpdated: "May 12, 2024",
  improvementText: "Your readiness has improved by 12% in the last 30 days.",
  chartRange: "30 days selected",
} as const;

export const dashboardModuleCompletion: DashboardModuleCompletion[] = [
  { name: "Basic Information", completed: 10, total: 10, percent: 100 },
  { name: "Environment", completed: 13, total: 20, percent: 65 },
  { name: "Social", completed: 12, total: 20, percent: 60 },
  { name: "Governance", completed: 10, total: 14, percent: 71 },
];

export const dashboardMissingDataSummary = {
  total: 16,
  items: [
    { area: "Environment", items: 7 },
    { area: "Social", items: 5 },
    { area: "Governance", items: 4 },
  ],
} satisfies {
  total: number;
  items: DashboardMissingDataItem[];
};

export const dashboardBuyerRequests: DashboardBuyerRequest[] = [
  {
    buyer: "Global Retail Group",
    module: "VSME Basic",
    status: "In progress",
    dueDate: "May 20, 2024",
  },
  {
    buyer: "Nordic Components AB",
    module: "VSME Comprehensive",
    status: "Requested",
    dueDate: "May 28, 2024",
  },
  {
    buyer: "TechSupply Inc.",
    module: "VSME Basic",
    status: "Not started",
    dueDate: "Jun 5, 2024",
  },
];

export const dashboardRecentUploads: DashboardUpload[] = [
  { name: "2023 Energy Invoices.pdf", category: "Environment", uploadedAt: "2 hours ago" },
  { name: "Environmental Policy.pdf", category: "Environment", uploadedAt: "1 day ago" },
  { name: "Waste Data Summary.xlsx", category: "Environment", uploadedAt: "2 days ago" },
  { name: "Employee Diversity Report.pdf", category: "Social", uploadedAt: "3 days ago" },
  { name: "Code of Conduct.pdf", category: "Governance", uploadedAt: "5 days ago" },
];

export const dashboardTasks: DashboardTask[] = [
  { title: "Upload energy invoices", category: "Environment", due: "Due May 16", completed: false },
  { title: "Add environmental policy", category: "Environment", due: "Due May 18", completed: false },
  { title: "Review waste data", category: "Environment", due: "Due May 20", completed: false },
  { title: "Complete water usage data", category: "Environment", due: "Completed", completed: true },
  { title: "Add CEO statement", category: "Governance", due: "Completed", completed: true },
];

export const dashboardReadinessOverTime = [
  { day: "Day 1", readiness: 60 },
  { day: "Day 6", readiness: 62 },
  { day: "Day 12", readiness: 64 },
  { day: "Day 18", readiness: 67 },
  { day: "Day 24", readiness: 70 },
  { day: "Day 30", readiness: 72 },
] as const;

export const dashboardActiveShareLinks: DashboardShareLink[] = [
  {
    buyer: "Global Retail Group",
    module: "VSME Basic",
    status: "Active",
    expires: "May 20, 2024",
  },
  {
    buyer: "Nordic Components AB",
    module: "VSME Comprehensive",
    status: "Active",
    expires: "May 28, 2024",
  },
  {
    buyer: "Investor Partners Ltd.",
    module: "VSME Basic",
    status: "Active",
    expires: "Jun 10, 2024",
  },
];

export const dashboardRecentActivity: DashboardActivity[] = [
  { text: "You uploaded 2023 Energy Invoices.pdf" },
  { text: "You updated Water usage (E3-2)" },
  { text: "Global Retail Group requested access" },
  { text: "You completed Environmental Policy" },
  { text: "Nordic Components AB requested access" },
];

export type QuestionnaireSectionProgress = {
  id: string;
  name: string;
  completed: number;
  total: number;
  isActive?: boolean;
};

export type QuestionnaireAnswerStatus =
  | "Completed"
  | "In progress"
  | "Needs evidence"
  | "Reviewed"
  | "Not started";

export type QuestionnaireLinkedDocument = {
  id: string;
  fileName: string;
  documentType: string;
  status: EvidenceRoomStatus;
};

type QuestionnaireQuestionEvidence = {
  answerId?: string;
  evidenceRequired?: boolean;
  linkedDocuments?: QuestionnaireLinkedDocument[];
};

export type QuestionnaireEnergyQuestion = QuestionnaireQuestionEvidence &
  (
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "input";
      value: string;
      unit: string;
    }
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "select";
      value: string;
      options: string[];
    }
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "yes-no";
      value: "Yes" | "No" | "";
    }
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "date";
      value: string;
    }
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "chips";
      values: string[];
      options: string[];
    }
  | {
      id: string;
      prompt: string;
      status: QuestionnaireAnswerStatus;
      type: "textarea";
      value: string;
    }
  );

export const questionnaireOverviewMock = {
  title: "VSME Readiness Questionnaire",
  status: "Draft",
  subtitle: "Answer the questions below to build your VSME profile.",
  completion: 42,
  completedQuestions: 24,
  totalQuestions: 57,
  activeSection: {
    name: "Energy",
    subtitle: "This section covers your organization’s energy consumption and efficiency.",
    completion: 50,
    completedQuestions: 4,
    totalQuestions: 8,
  },
  helper: {
    guidance:
      "Report energy data for your entire organization for the last 12 months. Use meter readings, invoices or energy management system data where available.",
    learnMoreLabel: "Learn more about VSME Energy metrics",
    evidenceRecommendations: [
      "Energy bills or utility invoices",
      "Meter readings or consumption logs",
      "Energy audit or assessment reports",
      "Renewable energy certificates",
    ],
    relatedDocuments: [
      { name: "VSME User Guide – Energy", type: "PDF" },
      { name: "Energy Reporting Template", type: "XLSX" },
      { name: "Sample Energy Policy", type: "PDF" },
    ],
  },
} as const;

export const questionnaireSectionProgress: QuestionnaireSectionProgress[] = [
  { id: "company-basics", name: "Company Basics", completed: 6, total: 6 },
  { id: "employees", name: "Employees", completed: 3, total: 6 },
  { id: "energy", name: "Energy", completed: 4, total: 8, isActive: true },
  { id: "fuel", name: "Fuel", completed: 0, total: 5 },
  { id: "waste", name: "Waste", completed: 1, total: 5 },
  { id: "environmental-policies", name: "Environmental Policies", completed: 0, total: 4 },
  { id: "health-safety", name: "Health & Safety", completed: 0, total: 6 },
  { id: "certifications", name: "Certifications", completed: 0, total: 4 },
  { id: "governance", name: "Governance", completed: 0, total: 6 },
  { id: "supplier-information", name: "Supplier Information", completed: 0, total: 7 },
];

export const questionnaireEnergyQuestions: QuestionnaireEnergyQuestion[] = [
  {
    id: "energy-total-consumption",
    prompt: "What was your total energy consumption from all sources in the last 12 months?",
    type: "input",
    value: "125,430",
    unit: "kWh",
    status: "Completed",
  },
  {
    id: "energy-intensity",
    prompt: "What was your total energy consumption intensity?",
    type: "input",
    value: "3,245",
    unit: "kWh / employee",
    status: "In progress",
  },
  {
    id: "energy-primary-source",
    prompt: "What is your primary source of purchased energy?",
    type: "select",
    value: "Grid electricity",
    options: ["Grid electricity", "District heating", "Natural gas", "Renewable PPA"],
    status: "Completed",
  },
  {
    id: "energy-renewable-onsite",
    prompt: "Do you use any on-site renewable energy?",
    type: "yes-no",
    value: "Yes",
    status: "Completed",
  },
  {
    id: "energy-renewable-percentage",
    prompt: "What percentage of your total energy comes from renewable sources?",
    type: "input",
    value: "18",
    unit: "%",
    status: "Needs evidence",
  },
  {
    id: "energy-audit-date",
    prompt: "When was your last energy audit or review conducted?",
    type: "date",
    value: "March 14, 2024",
    status: "Reviewed",
  },
  {
    id: "energy-efficiency-measures",
    prompt: "What measures have you implemented to improve energy efficiency?",
    type: "chips",
    values: ["LED lighting", "Efficient equipment", "Insulation improvement"],
    options: [
      "LED lighting",
      "Efficient equipment",
      "Insulation improvement",
      "Smart meters",
      "Heat recovery",
    ],
    status: "In progress",
  },
  {
    id: "energy-additional-notes",
    prompt: "Additional notes or context",
    type: "textarea",
    value:
      "We operate primarily during daytime hours and have implemented an ISO 50001-aligned energy management system.",
    status: "Not started",
  },
];

export type EvidenceRoomMetric = {
  label: string;
  value: string;
  detail: string;
};

export type EvidenceRoomStatus =
  | "Reviewed"
  | "Linked"
  | "Uploaded"
  | "Needs review"
  | "Expiring soon"
  | "Expired";

export type EvidenceRoomDocument = {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  type:
    | "Certificate"
    | "Utility Bill"
    | "Policy"
    | "Waste Report"
    | "Report"
    | "Training"
    | "Safety"
    | "Questionnaire"
    | "Other";
  linkedTo: string[];
  linkedExtra?: string;
  uploaded: string;
  uploadedBy: string;
  status: EvidenceRoomStatus;
  previewUrl?: string;
  mimeType?: string;
  expiresAt?: string | null;
};

export type EvidenceRoomLinkedQuestion = {
  code: string;
  question: string;
  status: "Answered";
};

export const evidenceRoomMetrics: EvidenceRoomMetric[] = [
  { label: "Total documents", value: "126", detail: "+12 this month" },
  { label: "Linked to answers", value: "98", detail: "78% of total" },
  { label: "Needs review", value: "11", detail: "8% of total" },
  { label: "Expiring soon", value: "7", detail: "Next 90 days" },
];

export const evidenceRoomFilters = {
  types: ["All types", "Certificate", "Utility Bill", "Policy", "Report", "Training"],
  statuses: ["All status", "Reviewed", "Linked", "Uploaded", "Needs review", "Expiring soon"],
  folders: ["All folders", "Environment", "Social", "Governance", "Certificates"],
} as const;

export const evidenceRoomDocuments: EvidenceRoomDocument[] = [
  {
    id: "iso-14001-certificate",
    title: "ISO 14001 Certificate",
    fileName: "iso_14001_2024.pdf",
    fileSize: "2.4 MB",
    type: "Certificate",
    linkedTo: ["ENV-1.1", "ENV-1.2"],
    linkedExtra: "+1 more",
    uploaded: "May 12, 2024",
    uploadedBy: "Anna Müller",
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
    uploadedBy: "Anna Müller",
    status: "Linked",
  },
  {
    id: "environmental-policy",
    title: "Environmental Policy",
    fileName: "environmental_policy.pdf",
    fileSize: "1.1 MB",
    type: "Policy",
    linkedTo: ["ENV-1.1"],
    uploaded: "May 8, 2024",
    uploadedBy: "Anna Müller",
    status: "Uploaded",
  },
  {
    id: "waste-disposal-report",
    title: "Waste Disposal Report",
    fileName: "waste_disposal_report_q1.pdf",
    fileSize: "860 KB",
    type: "Report",
    linkedTo: ["ENV-3.1", "ENV-3.2"],
    linkedExtra: "+1 more",
    uploaded: "May 6, 2024",
    uploadedBy: "Anna Müller",
    status: "Linked",
  },
  {
    id: "safety-training-record",
    title: "Safety Training Record",
    fileName: "safety_training_q1_2024.xlsx",
    fileSize: "1.3 MB",
    type: "Training",
    linkedTo: ["SOC-2.1"],
    uploaded: "May 5, 2024",
    uploadedBy: "Anna Müller",
    status: "Uploaded",
  },
  {
    id: "supplier-code-of-conduct",
    title: "Supplier Code of Conduct",
    fileName: "supplier_code_of_conduct.pdf",
    fileSize: "624 KB",
    type: "Policy",
    linkedTo: ["GOV-1.1"],
    uploaded: "Apr 30, 2024",
    uploadedBy: "Anna Müller",
    status: "Reviewed",
  },
];

export const evidenceRoomSelectedDocumentId = "iso-14001-certificate";

export const evidenceRoomLinkedQuestions: EvidenceRoomLinkedQuestion[] = [
  {
    code: "ENV-1.1",
    question: "Does your company have an environmental management policy?",
    status: "Answered",
  },
  {
    code: "ENV-1.2",
    question: "Provide your ISO 14001 certification.",
    status: "Answered",
  },
  {
    code: "ENV-1.3",
    question: "When was your ISO 14001 certificate last reviewed?",
    status: "Answered",
  },
];

export const evidenceRoomReview = {
  status: "Reviewed",
  reviewedBy: "Anna Müller",
  reviewedOn: "May 12, 2024",
} as const;

export type PassportCompanyProfile = {
  name: string;
  verified: boolean;
  industries: string[];
  countriesServed: string;
  employeeCount: string;
  headquarters: string;
  certifications: string[];
};

export type PassportReadinessModule = {
  label: string;
  value: number;
};

export type PassportSection = {
  title: string;
  completion: number;
  approvedAnswers: number;
  linkedDocuments: number;
  visibility: "Shared" | "Hidden";
};

export type PassportApprovedDocument = {
  id: string;
  name: string;
  category: string;
  status: "Approved";
  linkedSections: string[];
};

export type PassportChecklistItem = {
  label: string;
  status: "warning" | "review" | "recommended" | "approved";
};

export type PassportShareSetting = {
  label: string;
  value: string;
};

export const passportCompanyProfile: PassportCompanyProfile = {
  name: "Acme Manufacturing GmbH",
  verified: true,
  industries: ["Automotive", "Industrial Manufacturing"],
  countriesServed: "12 countries",
  employeeCount: "250–499 employees",
  headquarters: "Munich, Germany",
  certifications: ["ISO 14001", "ISO 9001", "ISO 45001", "IATF 16949"],
};

export const passportReadinessSummary = {
  score: 72,
  modules: [
    { label: "Basic Information", value: 100 },
    { label: "Environment", value: 68 },
    { label: "Social", value: 75 },
    { label: "Governance", value: 71 },
  ],
} satisfies { score: number; modules: PassportReadinessModule[] };

export const passportSections: PassportSection[] = [
  {
    title: "Company overview",
    completion: 100,
    approvedAnswers: 18,
    linkedDocuments: 4,
    visibility: "Shared",
  },
  {
    title: "Environment",
    completion: 68,
    approvedAnswers: 14,
    linkedDocuments: 11,
    visibility: "Shared",
  },
  {
    title: "Social",
    completion: 75,
    approvedAnswers: 12,
    linkedDocuments: 7,
    visibility: "Shared",
  },
  {
    title: "Governance",
    completion: 71,
    approvedAnswers: 10,
    linkedDocuments: 8,
    visibility: "Shared",
  },
  {
    title: "Evidence summary",
    completion: 86,
    approvedAnswers: 7,
    linkedDocuments: 7,
    visibility: "Hidden",
  },
];

export const passportApprovedDocuments: PassportApprovedDocument[] = [
  {
    id: "passport-doc-iso-14001",
    name: "ISO 14001 Certificate",
    category: "Environment",
    status: "Approved",
    linkedSections: ["Environment", "Evidence summary"],
  },
  {
    id: "passport-doc-iso-9001",
    name: "ISO 9001 Certificate",
    category: "Quality",
    status: "Approved",
    linkedSections: ["Company overview", "Evidence summary"],
  },
  {
    id: "passport-doc-iso-45001",
    name: "ISO 45001 Certificate",
    category: "Social",
    status: "Approved",
    linkedSections: ["Social", "Evidence summary"],
  },
  {
    id: "passport-doc-iatf-16949",
    name: "IATF 16949 Certificate",
    category: "Quality",
    status: "Approved",
    linkedSections: ["Company overview", "Governance"],
  },
  {
    id: "passport-doc-code-conduct",
    name: "Code of Conduct",
    category: "Governance",
    status: "Approved",
    linkedSections: ["Governance", "Evidence summary"],
  },
  {
    id: "passport-doc-sustainability-policy",
    name: "Sustainability Policy",
    category: "Governance",
    status: "Approved",
    linkedSections: ["Environment", "Governance"],
  },
  {
    id: "passport-doc-esg-summary-2024",
    name: "ESG Data Summary 2024",
    category: "ESG summary",
    status: "Approved",
    linkedSections: ["Environment", "Social", "Governance"],
  },
];

export const passportMissingDataChecklist: PassportChecklistItem[] = [
  { label: "Energy invoices missing", status: "warning" },
  { label: "Waste data needs review", status: "review" },
  { label: "Supplier code update recommended", status: "recommended" },
  { label: "Environmental policy approved", status: "approved" },
];

export const passportShareSettings: PassportShareSetting[] = [
  { label: "Access", value: "Read-only" },
  { label: "Security", value: "Password protected" },
  { label: "Expiry", value: "14 days" },
  { label: "Documents", value: "Approved only" },
  { label: "Internal notes", value: "Hidden" },
];

export const passportDisclaimer =
  "This passport structures supplier-provided sustainability information and supporting evidence. It is not a certification, assurance report, or legal compliance opinion.";

export type PublicShareSection = {
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  actionLabel: string;
};

export type PublicShareDocument = {
  id: string;
  name: string;
  category: string;
  fileType: "PDF";
  uploaded: string;
  accessUrl?: string;
  downloadUrl?: string;
};

export type PublicShareDetail = {
  label: string;
  value: string;
};

export type PublicSharePassport = {
  token: string;
  company: PassportCompanyProfile;
  readinessScore: number;
  certificateStatus?: "none" | "available" | "expires_soon" | "expired";
  lastUpdated: string;
  sharedWith: string;
  sharedOn: string;
  expiresOn: string;
  statusChips: string[];
  heroText: string;
  sections: PublicShareSection[];
  documents: PublicShareDocument[];
  details: PublicShareDetail[];
  footerDisclaimer: string;
};

export const publicSharePassport: PublicSharePassport = {
  token: "acme-manufacturing",
  company: passportCompanyProfile,
  readinessScore: 72,
  lastUpdated: "May 12, 2024",
  sharedWith: "supplier@acmebuyer.com",
  sharedOn: "May 12, 2024",
  expiresOn: "May 26, 2024",
  statusChips: ["Read-only", "Password protected", "Expires in 14 days"],
  heroText:
    "Acme Manufacturing GmbH has shared their VSME / ESG profile with you. This information is provided securely and is read-only.",
  sections: [
    {
      title: "Environment",
      description: "Strong management of environmental impact.",
      metricLabel: "Completion",
      metricValue: "68%",
      actionLabel: "View details",
    },
    {
      title: "Social",
      description: "Commitment to people, health & safety, and communities.",
      metricLabel: "Completion",
      metricValue: "75%",
      actionLabel: "View details",
    },
    {
      title: "Governance",
      description: "Robust policies, ethics, and risk management.",
      metricLabel: "Completion",
      metricValue: "71%",
      actionLabel: "View details",
    },
    {
      title: "Evidence summary",
      description: "Documents reviewed and approved for sharing.",
      metricLabel: "Evidence files",
      metricValue: "128",
      actionLabel: "View all evidence",
    },
  ] satisfies PublicShareSection[],
  documents: [
    {
      id: "share-doc-iso-14001",
      name: "ISO 14001 Certificate",
      category: "Environment",
      fileType: "PDF",
      uploaded: "Apr 18, 2024",
    },
    {
      id: "share-doc-iso-9001",
      name: "ISO 9001 Certificate",
      category: "Governance",
      fileType: "PDF",
      uploaded: "Apr 18, 2024",
    },
    {
      id: "share-doc-iso-45001",
      name: "ISO 45001 Certificate",
      category: "Social",
      fileType: "PDF",
      uploaded: "Apr 18, 2024",
    },
    {
      id: "share-doc-iatf-16949",
      name: "IATF 16949 Certificate",
      category: "Quality Management",
      fileType: "PDF",
      uploaded: "Apr 18, 2024",
    },
    {
      id: "share-doc-code-conduct",
      name: "Code of Conduct",
      category: "Governance",
      fileType: "PDF",
      uploaded: "Apr 10, 2024",
    },
    {
      id: "share-doc-sustainability-policy",
      name: "Sustainability Policy",
      category: "Environment",
      fileType: "PDF",
      uploaded: "Apr 10, 2024",
    },
    {
      id: "share-doc-esg-summary",
      name: "ESG Data Summary 2024",
      category: "ESG Overview",
      fileType: "PDF",
      uploaded: "May 12, 2024",
    },
  ] satisfies PublicShareDocument[],
  details: [
    { label: "Shared on", value: "May 12, 2024" },
    { label: "Shared with", value: "supplier@acmebuyer.com" },
    { label: "Access", value: "Read-only" },
    { label: "Security", value: "Password protected" },
    { label: "Expires", value: "May 26, 2024" },
  ] satisfies PublicShareDetail[],
  footerDisclaimer:
    "This passport contains supplier-provided information and supporting evidence. It is not a certification, assurance report, or legal compliance opinion.",
};

export type AdminOrganizationRow = {
  id: string;
  company: string;
  domain: string;
  verified: boolean;
  completion: number;
  evidenceStatus: string;
  documentCount: number;
  owner: string;
  industry: string;
  lastUpdated: string;
};

export type AdminChecklistStatus = "Completed" | "In progress" | "Pending";

export type AdminChecklistItem = {
  label: string;
  status: AdminChecklistStatus;
};

export type AdminStatsBreakdown = {
  label: string;
  value: string;
  tone: "red" | "amber" | "blue" | "green" | "slate";
};

export type AdminStatsWidgetData = {
  title: string;
  total: string;
  items: AdminStatsBreakdown[];
};

export type AdminRecentActivity = {
  organization: string;
  action: string;
};

export const adminOrganizationRows: AdminOrganizationRow[] = [
  {
    id: "admin-org-acme",
    company: "Acme Manufacturing GmbH",
    domain: "acme-manufacturing.com",
    verified: true,
    completion: 72,
    evidenceStatus: "3 issues",
    documentCount: 12,
    owner: "Sarah Johnson",
    industry: "Industrial Manufacturing",
    lastUpdated: "May 12 2024",
  },
  {
    id: "admin-org-lumen",
    company: "Lumen Technologies",
    domain: "lumentech.example",
    verified: true,
    completion: 92,
    evidenceStatus: "All good",
    documentCount: 24,
    owner: "Michael Chen",
    industry: "Technology",
    lastUpdated: "May 11 2024",
  },
  {
    id: "admin-org-greenparts",
    company: "GreenParts Industries",
    domain: "greenparts.example",
    verified: true,
    completion: 48,
    evidenceStatus: "7 issues",
    documentCount: 9,
    owner: "Anna Müller",
    industry: "Automotive",
    lastUpdated: "May 10 2024",
  },
  {
    id: "admin-org-nova",
    company: "Nova Packaging",
    domain: "novapackaging.example",
    verified: false,
    completion: 35,
    evidenceStatus: "12 issues",
    documentCount: 6,
    owner: "James Wilson",
    industry: "Packaging",
    lastUpdated: "May 9 2024",
  },
  {
    id: "admin-org-metaline",
    company: "Metaline Solutions",
    domain: "metaline.example",
    verified: true,
    completion: 66,
    evidenceStatus: "2 issues",
    documentCount: 18,
    owner: "Sarah Johnson",
    industry: "Metals",
    lastUpdated: "May 8 2024",
  },
  {
    id: "admin-org-ecotextile",
    company: "EcoTextile Group",
    domain: "ecotextile.example",
    verified: true,
    completion: 81,
    evidenceStatus: "1 issue",
    documentCount: 15,
    owner: "Anna Müller",
    industry: "Textiles",
    lastUpdated: "May 8 2024",
  },
  {
    id: "admin-org-brightwave",
    company: "BrightWave Services",
    domain: "brightwave.example",
    verified: false,
    completion: 27,
    evidenceStatus: "9 issues",
    documentCount: 4,
    owner: "Michael Chen",
    industry: "Services",
    lastUpdated: "May 7 2024",
  },
  {
    id: "admin-org-northbridge",
    company: "Northbridge Supplies",
    domain: "northbridge.example",
    verified: true,
    completion: 90,
    evidenceStatus: "All good",
    documentCount: 22,
    owner: "James Wilson",
    industry: "Supply Chain",
    lastUpdated: "May 7 2024",
  },
  {
    id: "admin-org-summit",
    company: "Summit Works",
    domain: "summitworks.example",
    verified: true,
    completion: 59,
    evidenceStatus: "4 issues",
    documentCount: 10,
    owner: "Sarah Johnson",
    industry: "Construction",
    lastUpdated: "May 6 2024",
  },
  {
    id: "admin-org-bluepeak",
    company: "BluePeak Industries",
    domain: "bluepeak.example",
    verified: false,
    completion: 15,
    evidenceStatus: "14 issues",
    documentCount: 3,
    owner: "Anna Müller",
    industry: "Manufacturing",
    lastUpdated: "May 5 2024",
  },
];

export const selectedAdminOrganization = {
  id: "admin-org-acme",
  company: "Acme Manufacturing GmbH",
  verified: true,
  domain: "acme-manufacturing.com",
  clientSince: "Feb 8, 2024",
  completion: 72,
  modules: [
    { label: "VSME Modules", value: 100 },
    { label: "Environment", value: 65 },
    { label: "Social", value: 60 },
    { label: "Governance", value: 71 },
  ],
  note: {
    author: "Anna Müller",
    text: "Client is waiting on updated ISO 14001 certificate. Follow up next week.",
  },
} as const;

export const adminChecklist: AdminChecklistItem[] = [
  { label: "Verify company profile", status: "Completed" },
  { label: "Review VSME questionnaire", status: "Completed" },
  { label: "Validate evidence documents", status: "In progress" },
  { label: "Confirm policy approvals", status: "Pending" },
  { label: "Generate & share passport", status: "Pending" },
];

export const adminStatsWidgets: AdminStatsWidgetData[] = [
  {
    title: "Pending reviews",
    total: "23 total",
    items: [
      { label: "High priority", value: "7", tone: "red" },
      { label: "Medium priority", value: "11", tone: "amber" },
      { label: "Low priority", value: "5", tone: "slate" },
    ],
  },
  {
    title: "Documents needing validation",
    total: "56 total",
    items: [
      { label: "Expiring soon", value: "18", tone: "amber" },
      { label: "Missing info", value: "22", tone: "red" },
      { label: "Outdated", value: "16", tone: "blue" },
    ],
  },
];

export const adminRecentActivityFeed: AdminRecentActivity[] = [
  { organization: "Acme Manufacturing GmbH", action: "Evidence uploaded" },
  { organization: "GreenParts Industries", action: "Passport generated" },
  { organization: "Lumen Technologies", action: "Review completed" },
  { organization: "Nova Packaging", action: "Note added" },
  { organization: "EcoTextile Group", action: "Document validated" },
];
