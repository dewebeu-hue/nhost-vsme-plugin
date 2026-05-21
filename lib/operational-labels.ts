export type OnboardingLabels = {
  title: string;
  subtitle: string;
  eyebrow: string;
  skipForNow: string;
  companyLegalName: string;
  vatId: string;
  industry: string;
  employeeCountRange: string;
  employeeCountPlaceholder: string;
  headquartersCity: string;
  headquartersCountry: string;
  website: string;
  createWorkspace: string;
  creatingWorkspace: string;
  workspaceCreated: string;
  onboardingError: string;
  serverConfigMissing: string;
  organizationCreateFailed: string;
  membershipCreateFailed: string;
  profileCreateFailed: string;
  duplicateWorkspaceSlug: string;
  networkError: string;
  unknownOnboardingError: string;
  mockModeNotice: string;
  authRequired: string;
};

export type AdminLabels = {
  admin: string;
  title: string;
  subtitle: string;
  adminWorkspace: string;
  adminAccount: string;
  conciergeDashboard: string;
  organizations: string;
  organization: string;
  risks: string;
  backToDashboard: string;
  logOut: string;
  signedInAs: string;
  unauthorizedTitle: string;
  unauthorizedDescription: string;
  loading: string;
  loadError: string;
  retry: string;
  searchPlaceholder: string;
  searchOrganizations: string;
  allStatus: string;
  allOwners: string;
  allIndustries: string;
  moreFilters: string;
  savedViews: string;
  addOrganization: string;
  issues: string;
  company: string;
  currentWorkspacePlan: string;
  commercialClassification: string;
  commercialLabelsInternalNote: string;
  planPackage: string;
  segment: string;
  commercialStatus: string;
  pilotStartDate: string;
  pilotTargetDate: string;
  commercialNote: string;
  saveCommercialClassification: string;
  commercialClassificationSaved: string;
  commercialClassificationSaveError: string;
  commercialPlanStarter: string;
  commercialPlanSupplierPro: string;
  commercialPlanPartner: string;
  commercialPlanBuyerPilot: string;
  commercialPlanBuyerProFuture: string;
  commercialSegmentSupplier: string;
  commercialSegmentPartner: string;
  commercialSegmentBuyer: string;
  commercialSegmentConsultant: string;
  commercialSegmentInternalDemo: string;
  commercialStatusLead: string;
  commercialStatusPilot: string;
  commercialStatusActive: string;
  commercialStatusPaused: string;
  commercialStatusChurnRisk: string;
  commercialStatusClosed: string;
  allPlans: string;
  allSegments: string;
  activePilots: string;
  leads: string;
  churnRisk: string;
  partnerProspects: string;
  completion: string;
  evidenceStatus: string;
  owner: string;
  lastUpdated: string;
  actions: string;
  actionsForCompany: string;
  verified: string;
  docs: string;
  linkedEvidence: string;
  buyerRequests: string;
  activePublicLink: string;
  noActivePublicLink: string;
  certificateExpiryWarnings: string;
  missingSteps: string;
  totalOrganizations: string;
  lowReadiness: string;
  noDocuments: string;
  noLinkedEvidence: string;
  expiredCertificates: string;
  expiring30: string;
  expiring90: string;
  overdueBuyerRequests: string;
  openDetail: string;
  backToOrganizations: string;
  sectionReadiness: string;
  evidenceSummary: string;
  buyerRequestSummary: string;
  shareLinkStatus: string;
  noMissingSteps: string;
  notProvided: string;
  triage: string;
  triageNeedsAttention: string;
  triageInProgress: string;
  triageDemoReady: string;
  triageAtRisk: string;
  conciergeStatus: string;
  priority: string;
  internalNote: string;
  notes: string;
  nextFollowUp: string;
  assistedOnboarding: string;
  onboardingStatus: string;
  onboardingChecklist: string;
  onboardingNextAction: string;
  onboardingOwnerNote: string;
  onboardingProgress: string;
  saveOnboardingDetails: string;
  onboardingSaved: string;
  onboardingSaveError: string;
  onboardingChecklistAutoNote: string;
  portfolio: string;
  portfolioLabel: string;
  partnerLabel: string;
  assistedBy: string;
  internalPartnerNote: string;
  noPortfolioAssigned: string;
  organizationsByPortfolio: string;
  assistedPortfolio: string;
  allPortfolios: string;
  allTriage: string;
  portfolioSummary: string;
  portfolioOverview: string;
  totalPortfolios: string;
  upcomingFollowUps: string;
  highPriorityOrganizations: string;
  followUpOverdue: string;
  followUpDueToday: string;
  followUpDueSoon: string;
  noFollowUpScheduled: string;
  internalHandoffSummary: string;
  copyHandoffSummary: string;
  handoffCopied: string;
  handoffCopyError: string;
  downloadHandoffTxt: string;
  handoffDownloaded: string;
  internalUseOnly: string;
  handoffReady: string;
  needsUpdate: string;
  missingNextAction: string;
  missingFollowUpDate: string;
  saveConciergeStatus: string;
  conciergeSaved: string;
  conciergeSaveError: string;
  reviewedSaved: string;
  reviewedSaveError: string;
  missingOrganizationContext: string;
  reviewedInternally: string;
  internalReviewDisclaimer: string;
  support: string;
  supportChecklist: string;
  reviewedAt: string;
  notReviewedYet: string;
  supportAcknowledgementDeferred: string;
  riskDashboard: string;
  riskDashboardSubtitle: string;
  certificateRisks: string;
  overdueRequests: string;
  missingEvidence: string;
  noActivePublicLinks: string;
  riskType: string;
  severity: string;
  critical: string;
  warning: string;
  info: string;
  viewRisks: string;
  viewOrganizations: string;
  statusNotStarted: string;
  statusInvited: string;
  statusSetupInProgress: string;
  statusOnboarding: string;
  statusWaitingOnSupplier: string;
  statusReadyForReview: string;
  statusDemoReady: string;
  statusCompleted: string;
  statusPaused: string;
  priorityLow: string;
  priorityNormal: string;
  priorityHigh: string;
  checklistQuestionnaireStarted: string;
  checklistWorkspaceCreated: string;
  checklistCompanyProfileReviewed: string;
  checklistCoreQuestionnaireCompleted: string;
  checklistEvidenceUploaded: string;
  checklistEvidenceLinked: string;
  checklistPassportReviewed: string;
  checklistPublicLinkActive: string;
  checklistBuyerRequestsReviewed: string;
  checklistCertificateExpiryChecked: string;
  checklistPdfExportAvailable: string;
  clientSince: string;
  overview: string;
  activity: string;
  documents: string;
  reviews: string;
  internalNotes: string;
  checklist: string;
  quickActions: string;
  markReviewed: string;
  addNote: string;
  generatePassport: string;
  emailClient: string;
  pendingReviews: string;
  documentsNeedingValidation: string;
  recentActivity: string;
  liveQueuePreview: string;
  conciergeAdmin: string;
  activityPlaceholder: string;
  documentsPlaceholder: string;
  reviewsPlaceholder: string;
  modules: Record<string, string>;
  navigation: Record<string, string>;
  checklistLabels: Record<string, string>;
  statuses: Record<string, string>;
  stats: Record<string, string>;
};

export type SettingsLabels = {
  title: string;
  subtitle: string;
  workspaceSettings: string;
  workspaceSettingsDescription: string;
  workspaceSettingsUnavailable: string;
  teamAccess: string;
  teamAccessDescription: string;
  notifications: string;
  notificationsDescription: string;
  comingLater: string;
};

export type CompanyProfileLabels = {
  title: string;
  subtitle: string;
  updateInQuestionnaire: string;
  editUnavailable: string;
  supplierProfile: string;
  organizationName: string;
  legalName: string;
  location: string;
  industry: string;
  employeeCount: string;
  website: string;
  workspace: string;
  notProvided: string;
  loadFailed: string;
  contextualHelpTitle: string;
  contextualHelpText: string;
};

export const defaultOnboardingLabels: OnboardingLabels = {
  title: "Create your supplier workspace",
  subtitle: "Set up your company profile so your team can start building a Supplier Passport.",
  eyebrow: "Supplier setup",
  skipForNow: "Skip for now",
  companyLegalName: "Company legal name",
  vatId: "VAT / OIB",
  industry: "Industry",
  employeeCountRange: "Employee count",
  employeeCountPlaceholder: "Select range",
  headquartersCity: "Headquarters city",
  headquartersCountry: "Headquarters country",
  website: "Website",
  createWorkspace: "Create workspace",
  creatingWorkspace: "Creating workspace...",
  workspaceCreated: "Workspace created successfully.",
  onboardingError: "We could not create your workspace. Please try again.",
  serverConfigMissing: "Server onboarding configuration is missing.",
  organizationCreateFailed: "We could not create the organization. Please try again.",
  membershipCreateFailed: "We could not assign you as workspace owner. Please contact support.",
  profileCreateFailed: "We could not create the company profile. Please try again.",
  duplicateWorkspaceSlug: "A workspace with this name already exists. Please adjust the company name.",
  networkError: "We could not reach the workspace service. Check your connection and try again.",
  unknownOnboardingError: "An unknown onboarding error occurred. Please try again.",
  mockModeNotice:
    "Nhost is not configured yet. You can review this form, and mock dashboards will keep working.",
  authRequired: "Sign in with Nhost before creating a real workspace. Mock mode remains available.",
};

export const defaultAdminLabels: AdminLabels = {
  admin: "ADMIN",
  title: "Organizations",
  subtitle: "Manage and support your client organizations.",
  adminWorkspace: "Admin workspace",
  adminAccount: "Admin account",
  conciergeDashboard: "Concierge dashboard",
  organizations: "Organizations",
  organization: "Organization",
  risks: "Risks",
  backToDashboard: "Back to dashboard",
  logOut: "Log out",
  signedInAs: "Signed in as",
  unauthorizedTitle: "You do not have access to this admin workspace.",
  unauthorizedDescription: "Sign in with an allowlisted admin account to use the concierge workspace.",
  loading: "Loading...",
  loadError: "We could not load admin data right now.",
  retry: "Retry",
  searchPlaceholder: "Search organizations, owners, or domains...",
  searchOrganizations: "Search organizations...",
  allStatus: "All status",
  allOwners: "All owners",
  allIndustries: "All industries",
  moreFilters: "More filters",
  savedViews: "Saved views",
  addOrganization: "Add Organization",
  issues: "Issues",
  company: "Company",
  currentWorkspacePlan: "Current workspace plan",
  commercialClassification: "Commercial classification",
  commercialLabelsInternalNote: "Commercial labels are internal and do not enforce billing or feature limits.",
  planPackage: "Plan/package",
  segment: "Segment",
  commercialStatus: "Commercial status",
  pilotStartDate: "Pilot start date",
  pilotTargetDate: "Pilot target date",
  commercialNote: "Commercial note",
  saveCommercialClassification: "Save commercial classification",
  commercialClassificationSaved: "Commercial classification saved.",
  commercialClassificationSaveError: "We could not save commercial classification right now.",
  commercialPlanStarter: "Starter",
  commercialPlanSupplierPro: "Supplier Pro",
  commercialPlanPartner: "Partner",
  commercialPlanBuyerPilot: "Buyer Pilot",
  commercialPlanBuyerProFuture: "Buyer Pro future",
  commercialSegmentSupplier: "Supplier",
  commercialSegmentPartner: "Partner",
  commercialSegmentBuyer: "Buyer",
  commercialSegmentConsultant: "Consultant",
  commercialSegmentInternalDemo: "Internal demo",
  commercialStatusLead: "Lead",
  commercialStatusPilot: "Pilot",
  commercialStatusActive: "Active",
  commercialStatusPaused: "Paused",
  commercialStatusChurnRisk: "Churn risk",
  commercialStatusClosed: "Closed",
  allPlans: "All plans",
  allSegments: "All segments",
  activePilots: "Active pilots",
  leads: "Leads",
  churnRisk: "Churn risk",
  partnerProspects: "Partner prospects",
  completion: "Completion",
  evidenceStatus: "Evidence Status",
  owner: "Owner",
  lastUpdated: "Last Updated",
  actions: "Actions",
  actionsForCompany: "Actions for {company}",
  verified: "Verified",
  docs: "docs",
  linkedEvidence: "Linked evidence",
  buyerRequests: "Buyer requests",
  activePublicLink: "Active public link",
  noActivePublicLink: "No active public link",
  certificateExpiryWarnings: "Certificate expiry warnings",
  missingSteps: "Missing steps",
  totalOrganizations: "Total organizations",
  lowReadiness: "Low readiness",
  noDocuments: "No documents",
  noLinkedEvidence: "No linked evidence",
  expiredCertificates: "Expired certificates",
  expiring30: "Expiring within 30 days",
  expiring90: "Expiring within 90 days",
  overdueBuyerRequests: "Overdue buyer requests",
  openDetail: "Open detail",
  backToOrganizations: "Back to organizations",
  sectionReadiness: "Section readiness",
  evidenceSummary: "Evidence summary",
  buyerRequestSummary: "Buyer request summary",
  shareLinkStatus: "Share link status",
  noMissingSteps: "No obvious missing steps.",
  notProvided: "Not provided yet",
  triage: "Triage",
  triageNeedsAttention: "Needs attention",
  triageInProgress: "In progress",
  triageDemoReady: "Demo-ready",
  triageAtRisk: "At risk",
  conciergeStatus: "Concierge status",
  priority: "Priority",
  internalNote: "Internal note",
  notes: "Notes",
  nextFollowUp: "Next follow-up",
  assistedOnboarding: "Assisted onboarding",
  onboardingStatus: "Onboarding status",
  onboardingChecklist: "Onboarding checklist",
  onboardingNextAction: "Next action",
  onboardingOwnerNote: "Onboarding owner note",
  onboardingProgress: "Onboarding progress",
  saveOnboardingDetails: "Save onboarding details",
  onboardingSaved: "Onboarding details saved.",
  onboardingSaveError: "We could not save onboarding details right now.",
  onboardingChecklistAutoNote:
    "Checklist status is derived from supplier workspace data where possible. Manual overrides are not included in this step.",
  portfolio: "Portfolio",
  portfolioLabel: "Portfolio label",
  partnerLabel: "Assisted by",
  assistedBy: "Assisted by",
  internalPartnerNote: "Internal partner note",
  noPortfolioAssigned: "No portfolio assigned",
  organizationsByPortfolio: "Organizations by portfolio",
  assistedPortfolio: "Assisted portfolio",
  allPortfolios: "All portfolios",
  allTriage: "All triage",
  portfolioSummary: "Portfolio summary",
  portfolioOverview: "Portfolio overview",
  totalPortfolios: "Total portfolios",
  upcomingFollowUps: "Upcoming follow-ups",
  highPriorityOrganizations: "High-priority organizations",
  followUpOverdue: "Follow-up overdue",
  followUpDueToday: "Follow-up due today",
  followUpDueSoon: "Follow-up due soon",
  noFollowUpScheduled: "No follow-up scheduled",
  internalHandoffSummary: "Internal handoff summary",
  copyHandoffSummary: "Copy handoff summary",
  handoffCopied: "Handoff summary copied.",
  handoffCopyError: "We could not copy the handoff summary right now.",
  downloadHandoffTxt: "Download handoff .txt",
  handoffDownloaded: "Handoff text file prepared.",
  internalUseOnly: "Internal use only.",
  handoffReady: "Handoff ready",
  needsUpdate: "Needs update",
  missingNextAction: "Missing next action",
  missingFollowUpDate: "Missing follow-up date",
  saveConciergeStatus: "Save concierge status",
  conciergeSaved: "Concierge status saved.",
  conciergeSaveError: "We could not save concierge status right now.",
  reviewedSaved: "Organization marked as internally reviewed.",
  reviewedSaveError: "We could not mark this organization as reviewed right now.",
  missingOrganizationContext: "We could not identify this organization. Please refresh and try again.",
  reviewedInternally: "Reviewed internally",
  internalReviewDisclaimer: "Internal review only. This is not a certification or approval.",
  support: "Support",
  supportChecklist: "Support checklist",
  reviewedAt: "Reviewed at",
  notReviewedYet: "Not reviewed yet",
  supportAcknowledgementDeferred:
    "Acknowledging individual missing actions is deferred; real risks remain visible until supplier data changes.",
  riskDashboard: "Risk dashboard",
  riskDashboardSubtitle: "Review urgent certificate, evidence, readiness and buyer request risks.",
  certificateRisks: "Certificate warnings",
  overdueRequests: "Overdue requests",
  missingEvidence: "Missing evidence",
  noActivePublicLinks: "No active public link",
  riskType: "Risk type",
  severity: "Severity",
  critical: "Critical",
  warning: "Warning",
  info: "Info",
  viewRisks: "View risks",
  viewOrganizations: "View organizations",
  statusNotStarted: "Not started",
  statusInvited: "Invited",
  statusSetupInProgress: "Setup in progress",
  statusOnboarding: "Onboarding",
  statusWaitingOnSupplier: "Waiting on supplier",
  statusReadyForReview: "Ready for review",
  statusDemoReady: "Demo-ready",
  statusCompleted: "Completed",
  statusPaused: "Paused",
  priorityLow: "Low",
  priorityNormal: "Normal",
  priorityHigh: "High",
  checklistWorkspaceCreated: "Workspace created",
  checklistCompanyProfileReviewed: "Company profile reviewed",
  checklistQuestionnaireStarted: "Questionnaire started",
  checklistCoreQuestionnaireCompleted: "Core questionnaire sections completed",
  checklistEvidenceUploaded: "Evidence documents uploaded",
  checklistEvidenceLinked: "Evidence linked",
  checklistPassportReviewed: "Passport reviewed",
  checklistPublicLinkActive: "Public link active",
  checklistBuyerRequestsReviewed: "Buyer requests reviewed",
  checklistCertificateExpiryChecked: "Certificate expiry checked",
  checklistPdfExportAvailable: "PDF export available",
  clientSince: "Client since {date}",
  overview: "Overview",
  activity: "Activity",
  documents: "Documents",
  reviews: "Reviews",
  internalNotes: "Internal notes",
  checklist: "Checklist",
  quickActions: "Quick actions",
  markReviewed: "Mark reviewed",
  addNote: "Add note",
  generatePassport: "Generate passport",
  emailClient: "Email client",
  pendingReviews: "Pending reviews",
  documentsNeedingValidation: "Documents needing validation",
  recentActivity: "Recent activity",
  liveQueuePreview: "Live queue preview",
  conciergeAdmin: "Concierge Admin",
  activityPlaceholder: "Recent client activity will appear here once connected.",
  documentsPlaceholder: "Document review history and validation notes will appear here.",
  reviewsPlaceholder: "Open review assignments and concierge decisions will appear here.",
  modules: {
    "VSME Modules": "VSME Modules",
    Environment: "Environment",
    Social: "Social",
    Governance: "Governance",
  },
  navigation: {
    Organizations: "Organizations",
    Risks: "Risks",
    Reviews: "Reviews",
    Documents: "Documents",
    Passports: "Passports",
    "Share Links": "Share Links",
    Notes: "Notes",
    Settings: "Settings",
  },
  checklistLabels: {
    "Verify company profile": "Verify company profile",
    "Review VSME questionnaire": "Review VSME questionnaire",
    "Validate evidence documents": "Validate evidence documents",
    "Confirm policy approvals": "Confirm policy approvals",
    "Generate & share passport": "Generate & share passport",
  },
  statuses: {
    Completed: "Completed",
    "In progress": "In progress",
    Pending: "Pending",
    "All good": "All good",
  },
  stats: {},
};

export const defaultSettingsLabels: SettingsLabels = {
  title: "Settings",
  subtitle: "Manage company, account, notification and workspace settings.",
  workspaceSettings: "Workspace settings",
  workspaceSettingsDescription: "Workspace preferences will be managed here.",
  workspaceSettingsUnavailable: "Editing workspace settings is not available yet.",
  teamAccess: "Team access",
  teamAccessDescription: "Team management is not available yet.",
  notifications: "Notifications",
  notificationsDescription: "Notification preferences will be available in a later version.",
  comingLater: "Coming later",
};

export const defaultCompanyProfileLabels: CompanyProfileLabels = {
  title: "Company Profile",
  subtitle: "Review the company details used across your Supplier Passport workspace.",
  updateInQuestionnaire: "Update in questionnaire",
  editUnavailable: "Profile editing is not available yet. Update company details in the questionnaire.",
  supplierProfile: "Supplier profile",
  organizationName: "Organization name",
  legalName: "Legal company name",
  location: "Location",
  industry: "Industry",
  employeeCount: "Employee count",
  website: "Website",
  workspace: "Workspace",
  notProvided: "Not provided yet",
  loadFailed: "We could not load company profile data.",
  contextualHelpTitle: "How Company Profile is filled",
  contextualHelpText: "Company Profile uses selected answers from Company Basics and related questionnaire sections. Update these values in the questionnaire.",
};

export function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
