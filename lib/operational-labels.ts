export type OnboardingLabels = {
  title: string;
  subtitle: string;
  eyebrow: string;
  skipForNow: string;
  companyLegalName: string;
  vatId: string;
  industry: string;
  employeeCountRange: string;
  headquartersCity: string;
  headquartersCountry: string;
  website: string;
  createWorkspace: string;
  creatingWorkspace: string;
  workspaceCreated: string;
  onboardingError: string;
  mockModeNotice: string;
  authRequired: string;
};

export type AdminLabels = {
  admin: string;
  title: string;
  subtitle: string;
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
  completion: string;
  evidenceStatus: string;
  owner: string;
  lastUpdated: string;
  actions: string;
  actionsForCompany: string;
  verified: string;
  docs: string;
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
  openSettings: string;
  workspaceSettings: string;
  workspaceSettingsDescription: string;
  teamAccess: string;
  teamAccessDescription: string;
  notifications: string;
  notificationsDescription: string;
  planned: string;
  starter: string;
  oneUser: string;
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
  headquartersCity: "Headquarters city",
  headquartersCountry: "Headquarters country",
  website: "Website",
  createWorkspace: "Create workspace",
  creatingWorkspace: "Creating workspace...",
  workspaceCreated: "Workspace created successfully.",
  onboardingError: "We could not create your workspace. Please try again.",
  mockModeNotice:
    "Nhost is not configured yet. You can review this form, and mock dashboards will keep working.",
  authRequired: "Sign in with Nhost before creating a real workspace. Mock mode remains available.",
};

export const defaultAdminLabels: AdminLabels = {
  admin: "ADMIN",
  title: "Organizations",
  subtitle: "Manage and support your client organizations.",
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
  completion: "Completion",
  evidenceStatus: "Evidence Status",
  owner: "Owner",
  lastUpdated: "Last Updated",
  actions: "Actions",
  actionsForCompany: "Actions for {company}",
  verified: "Verified",
  docs: "docs",
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
  openSettings: "Open settings",
  workspaceSettings: "Workspace settings",
  workspaceSettingsDescription:
    "Manage organization preferences and buyer-facing profile defaults.",
  teamAccess: "Team access",
  teamAccessDescription: "{name} is the mock workspace owner for this phase.",
  notifications: "Notifications",
  notificationsDescription:
    "Future notification preferences will support buyer requests and evidence expiry.",
  planned: "Planned",
  starter: "Starter",
  oneUser: "1 user",
};

export function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
