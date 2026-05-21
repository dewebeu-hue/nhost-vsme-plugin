export type DashboardNavKey =
  | "dashboard"
  | "companyProfile"
  | "buyerRequests"
  | "questionnaire"
  | "evidenceRoom"
  | "passport"
  | "share"
  | "shareLinks"
  | "activity"
  | "settings";

export type DashboardShellLabels = {
  navigation: Record<DashboardNavKey, string>;
  verified: string;
  verifiedSupplier: string;
  plan: string;
  renewal: string;
  workspace: string;
  account: string;
  logOut: string;
  needHelp: string;
  helpCenter: string;
  openNavigation: string;
  notifications: string;
  notificationsUnavailable: string;
};

export const defaultDashboardShellLabels: DashboardShellLabels = {
  navigation: {
    dashboard: "Dashboard",
    companyProfile: "Company Profile",
    buyerRequests: "Buyer requests",
    questionnaire: "Questionnaire",
    evidenceRoom: "Evidence Room",
    passport: "Passport",
    share: "Share",
    shareLinks: "Share Links",
    activity: "Activity",
    settings: "Settings",
  },
  verified: "Verified",
  verifiedSupplier: "Supplier profile",
  plan: "Plan",
  renewal: "Renewal",
  workspace: "Workspace",
  account: "Account",
  logOut: "Log out",
  needHelp: "Need help?",
  helpCenter: "Visit our Help Center",
  openNavigation: "Open navigation",
  notifications: "Notifications",
  notificationsUnavailable: "Notifications are not available yet.",
};

export type DashboardOverviewLabels = {
  title: string;
  account: string;
  subtitle: string;
  overallReadiness: string;
  readinessDescription: string;
  goodProgress: string;
  readinessNeedsAttention: string;
  readinessInProgress: string;
  readinessBuyerReadyDraft: string;
  readinessStrong: string;
  ready: string;
  vsme: string;
  readinessHelper: string;
  lastUpdated: string;
  moduleCompletion: string;
  moduleDescription: string;
  viewAllSections: string;
  missingDataSummary: string;
  missingDataDescription: string;
  totalMissingData: string;
  items: string;
  goToMissingData: string;
  recentBuyerRequests: string;
  buyerRequestsDescription: string;
  due: string;
  recentUploads: string;
  recentUploadsDescription: string;
  yourTasks: string;
  tasksDescription: string;
  readinessOverTime: string;
  endValue: string;
  activeShareLinks: string;
  activeShareLinksDescription: string;
  expires: string;
  recentActivity: string;
  recentActivityDescription: string;
  noBuyerRequests: string;
  noRecentUploads: string;
  noRecentActivity: string;
  noActiveShareLinks: string;
  noReadinessTrend: string;
  publicSupplierPassport: string;
  noExpiry: string;
  contextualHelp: {
    title: string;
    text: string;
    restartGuide: string;
  };
  setupChecklist: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    nextRecommendedStep: string;
    readinessDisclaimer: string;
    completed: string;
    available: string;
    pending: string;
    completeQuestionnaire: string;
    completeQuestionnaireDescription: string;
    completeQuestionnaireCta: string;
    uploadEvidence: string;
    uploadEvidenceDescription: string;
    uploadEvidenceCta: string;
    linkEvidence: string;
    linkEvidenceDescription: string;
    linkEvidenceCta: string;
    reviewPassport: string;
    reviewPassportDescription: string;
    reviewPassportCta: string;
    sharePublicLink: string;
    sharePublicLinkDescription: string;
    sharePublicLinkCta: string;
    downloadPdf: string;
    downloadPdfDescription: string;
    downloadPdfCta: string;
    startQuestionnaire: string;
    uploadDocumentsNext: string;
    linkEvidenceNext: string;
    reviewAndShareNext: string;
    downloadOrShareNext: string;
    neutralFallback: string;
    questionsAnswered: string;
    documentsUploaded: string;
    evidenceLinks: string;
    activeShareLinksMetric: string;
    pdfReady: string;
  };
  activity: {
    answers: string;
    documents: string;
    links: string;
    share: string;
  };
  modules: Record<string, string>;
  statuses: Record<string, string>;
};

export const defaultDashboardOverviewLabels: DashboardOverviewLabels = {
  title: "Welcome back, {name}",
  account: "Account",
  subtitle: "Here's an overview of your VSME readiness and recent activity.",
  overallReadiness: "Overall readiness",
  readinessDescription: "Your current VSME readiness snapshot.",
  goodProgress: "Good progress",
  readinessNeedsAttention: "Needs attention",
  readinessInProgress: "In progress",
  readinessBuyerReadyDraft: "Buyer-ready draft",
  readinessStrong: "Strong readiness",
  ready: "Ready",
  vsme: "VSME",
  readinessHelper: "Keep closing evidence gaps to move this passport toward buyer-ready review.",
  lastUpdated: "Last updated",
  moduleCompletion: "VSME module completion",
  moduleDescription: "Completion by disclosure area.",
  viewAllSections: "View all sections",
  missingDataSummary: "Missing data summary",
  missingDataDescription: "Open items blocking buyer-ready status.",
  totalMissingData: "Total missing data",
  items: "items",
  goToMissingData: "Go to missing data",
  recentBuyerRequests: "Recent buyer requests",
  buyerRequestsDescription: "Latest buyer requests and deadlines.",
  due: "Due",
  recentUploads: "Recent uploads",
  recentUploadsDescription: "Evidence files added to the data room.",
  yourTasks: "Your tasks",
  tasksDescription: "Priority items assigned to your workspace.",
  readinessOverTime: "Readiness over time",
  endValue: "End value",
  activeShareLinks: "Active share links",
  activeShareLinksDescription: "Secure passport links currently available to buyers.",
  expires: "Expires",
  recentActivity: "Recent activity",
  recentActivityDescription: "A concise audit trail of the latest workspace events.",
  noBuyerRequests: "No buyer requests yet.",
  noRecentUploads: "No evidence documents uploaded yet.",
  noRecentActivity: "Activity will appear after questionnaire, evidence, sharing, or PDF work starts.",
  noActiveShareLinks: "No active public share links yet.",
  noReadinessTrend: "Readiness trend will appear after more saved progress.",
  publicSupplierPassport: "Public Supplier Passport",
  noExpiry: "No expiry",
  contextualHelp: {
    title: "How to complete your Supplier Passport",
    text: "Follow the steps below to complete the questionnaire, add evidence and prepare a buyer-safe Passport summary.",
    restartGuide: "Restart onboarding guide",
  },
  setupChecklist: {
    title: "Supplier Passport setup",
    description: "Complete these steps to prepare a buyer-ready, VSME-aligned supplier profile.",
    emptyTitle: "Your Supplier Passport is not ready yet.",
    emptyDescription:
      "Complete the steps below to create a buyer-ready, VSME-aligned supplier profile.",
    nextRecommendedStep: "Next recommended step",
    readinessDisclaimer:
      "Readiness is based on completed questionnaire items and evidence metadata. It is not an audit or certification.",
    completed: "Complete",
    available: "Available",
    pending: "Pending",
    completeQuestionnaire: "Complete questionnaire",
    completeQuestionnaireDescription: "Answer the Supplier Passport questionnaire.",
    completeQuestionnaireCta: "Go to questionnaire",
    uploadEvidence: "Upload evidence documents",
    uploadEvidenceDescription: "Add supporting documents to your Evidence Data Room.",
    uploadEvidenceCta: "Upload documents",
    linkEvidence: "Link evidence to answers",
    linkEvidenceDescription: "Connect uploaded documents to questionnaire answers.",
    linkEvidenceCta: "Open Data Room",
    reviewPassport: "Review Supplier Passport",
    reviewPassportDescription: "Check the real readiness and evidence summary.",
    reviewPassportCta: "Review Passport",
    sharePublicLink: "Share public link",
    sharePublicLinkDescription: "Create or manage the buyer-facing public link.",
    sharePublicLinkCta: "Open sharing page",
    downloadPdf: "Download PDF draft",
    downloadPdfDescription: "Export the authenticated Supplier Passport draft.",
    downloadPdfCta: "Review Passport",
    startQuestionnaire: "Start by completing the questionnaire.",
    uploadDocumentsNext: "Upload evidence documents to support your answers.",
    linkEvidenceNext: "Link evidence documents to questionnaire answers.",
    reviewAndShareNext: "Review your Supplier Passport and share it with buyers.",
    downloadOrShareNext: "Download your PDF draft or share the public link.",
    neutralFallback:
      "Live dashboard metrics will appear after your organization data is available.",
    questionsAnswered: "Questions answered",
    documentsUploaded: "Documents uploaded",
    evidenceLinks: "Evidence links",
    activeShareLinksMetric: "Active share links",
    pdfReady: "PDF draft",
  },
  activity: {
    answers: "{count} questionnaire answers completed.",
    documents: "{count} evidence documents uploaded.",
    links: "{count} evidence links created.",
    share: "{count} public share link active.",
  },
  modules: {
    "Basic Information": "Basic Information",
    Environment: "Environment",
    Social: "Social",
    Governance: "Governance",
  },
  statuses: {
    "Not started": "Not started",
    "In progress": "In progress",
    Completed: "Completed",
    Reviewed: "Reviewed",
    Uploaded: "Uploaded",
    Linked: "Linked",
    Active: "Active",
  },
};
