export type DashboardNavKey =
  | "dashboard"
  | "companyProfile"
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
};

export const defaultDashboardShellLabels: DashboardShellLabels = {
  navigation: {
    dashboard: "Dashboard",
    companyProfile: "Company Profile",
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
};

export type DashboardOverviewLabels = {
  title: string;
  account: string;
  subtitle: string;
  overallReadiness: string;
  readinessDescription: string;
  goodProgress: string;
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
