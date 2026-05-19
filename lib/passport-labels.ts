export type PassportLabels = {
  title: string;
  subtitle: string;
  generatePassport: string;
  createShareLink: string;
  exportPdf: string;
  draftStateTitle: string;
  draftStateText: string;
  companySummary: string;
  companySummaryDescription: string;
  verified: string;
  supplierIdentity: string;
  notProvided: string;
  noCertifications: string;
  industries: string;
  countriesServed: string;
  employeeCount: string;
  headquarters: string;
  keyCertifications: string;
  readinessSummary: string;
  readinessSummaryDescription: string;
  ready: string;
  passportSections: string;
  passportSectionsDescription: string;
  approvedDocuments: string;
  approvedDocumentsDescription: string;
  noApprovedDocuments: string;
  document: string;
  category: string;
  linkedSections: string;
  status: string;
  approved: string;
  missingDataChecklist: string;
  missingDataChecklistDescription: string;
  missingDataNeutral: string;
  shareSettingsPreview: string;
  shareSettingsPreviewDescription: string;
  buyerReadOnlyNotice: string;
  notCertificationTitle: string;
  notCertificationText: string;
  companyOverview: string;
  environment: string;
  social: string;
  governance: string;
  evidenceSummary: string;
  shared: string;
  hidden: string;
  approvedAnswers: string;
  linkedDocuments: string;
  completion: string;
  passportStatus: string;
  generatedAt: string;
  noPassportTitle: string;
  noPassportText: string;
  generateSuccess: string;
  generateError: string;
  shareLinkGenerateFirst: string;
  createShareLinkTitle: string;
  createShareLinkDescription: string;
  buyerName: string;
  buyerEmail: string;
  expiryDate: string;
  passwordProtected: string;
  password: string;
  documentVisibility: string;
  approvedOnly: string;
  allLinkedDocuments: string;
  createLink: string;
  creatingLink: string;
  generatedLink: string;
  copyLink: string;
  openShareLink: string;
  shareLinkSuccess: string;
  shareLinkError: string;
  cancel: string;
  modules: Record<string, string>;
  settings: Record<string, string>;
  settingValues: Record<string, string>;
  checklist: Record<string, string>;
  documentCategories: Record<string, string>;
};

export const defaultPassportLabels: PassportLabels = {
  title: "Supplier Passport",
  subtitle:
    "Review your VSME readiness profile, approved evidence, and buyer-facing passport before sharing.",
  generatePassport: "Generate Passport",
  createShareLink: "Create Share Link",
  exportPdf: "Export PDF",
  draftStateTitle: "Passport preview is using draft data",
  draftStateText:
    "Generate a passport when the organization profile, questionnaire answers, and approved evidence are ready. Until then, this page shows the buyer-safe preview structure for demo review.",
  companySummary: "Company summary",
  companySummaryDescription: "The organization profile buyers will see in the passport.",
  verified: "Verified",
  supplierIdentity: "Buyer-facing supplier identity and operating footprint",
  notProvided: "Not provided yet",
  noCertifications: "No certifications provided yet.",
  industries: "Industries",
  countriesServed: "Countries served",
  employeeCount: "Employee count",
  headquarters: "Headquarters",
  keyCertifications: "Key certifications",
  readinessSummary: "Readiness summary",
  readinessSummaryDescription: "Current VSME readiness by buyer-facing module.",
  ready: "ready",
  passportSections: "Passport sections",
  passportSectionsDescription: "Control what buyers can review in the generated passport.",
  approvedDocuments: "Approved documents",
  approvedDocumentsDescription: "Evidence files approved for the buyer-facing passport.",
  noApprovedDocuments: "No approved documents yet.",
  document: "Document",
  category: "Category",
  linkedSections: "Linked sections",
  status: "Status",
  approved: "Approved",
  missingDataChecklist: "Missing data checklist",
  missingDataChecklistDescription: "Open items before this passport is shared externally.",
  missingDataNeutral:
    "Missing-data checks will appear here once your questionnaire and documents are reviewed.",
  shareSettingsPreview: "Share settings preview",
  shareSettingsPreviewDescription: "Default controls for a new buyer link.",
  buyerReadOnlyNotice:
    "Buyers can view the approved passport without changing answers or documents.",
  notCertificationTitle: "Important disclaimer",
  notCertificationText:
    "This passport structures supplier-provided sustainability information and supporting evidence. It is not a certification, assurance report, or legal compliance opinion.",
  companyOverview: "Company overview",
  environment: "Environment",
  social: "Social",
  governance: "Governance",
  evidenceSummary: "Evidence summary",
  shared: "Shared",
  hidden: "Hidden",
  approvedAnswers: "approved answers",
  linkedDocuments: "linked documents",
  completion: "completion",
  passportStatus: "Passport status",
  generatedAt: "Generated at",
  noPassportTitle: "No Passport generated yet",
  noPassportText: "Generate your first Supplier Passport to prepare a buyer-ready profile.",
  generateSuccess: "Supplier Passport generated successfully.",
  generateError: "We could not generate the Supplier Passport right now.",
  shareLinkGenerateFirst: "Generate a Supplier Passport before creating a buyer share link.",
  createShareLinkTitle: "Create buyer share link",
  createShareLinkDescription:
    "Create a secure read-only link that can be sent to a buyer or procurement contact.",
  buyerName: "Buyer name",
  buyerEmail: "Buyer email",
  expiryDate: "Expiry date",
  passwordProtected: "Password protected",
  password: "Password",
  documentVisibility: "Document visibility",
  approvedOnly: "Approved only",
  allLinkedDocuments: "All linked documents",
  createLink: "Create link",
  creatingLink: "Creating link...",
  generatedLink: "Generated link",
  copyLink: "Copy link",
  openShareLink: "Open share link",
  shareLinkSuccess: "Share link created successfully.",
  shareLinkError: "We could not create the share link right now.",
  cancel: "Cancel",
  modules: {
    "Basic Information": "Basic Information",
    Environment: "Environment",
    Social: "Social",
    Governance: "Governance",
  },
  settings: {
    Access: "Access",
    Security: "Security",
    Expiry: "Expiry",
    Documents: "Documents",
    "Internal notes": "Internal notes",
  },
  settingValues: {
    "Read-only": "Read-only",
    "Password protected": "Password protected",
    "14 days": "14 days",
    "Approved only": "Approved only",
    Hidden: "Hidden from buyers",
  },
  checklist: {
    "Energy invoices missing": "Energy invoices missing",
    "Waste data needs review": "Waste data needs review",
    "Supplier code update recommended": "Supplier code update recommended",
    "Environmental policy approved": "Environmental policy approved",
  },
  documentCategories: {
    Environment: "Environment",
    Governance: "Governance",
    Social: "Social",
    "Quality Management": "Quality Management",
    "ESG Overview": "ESG Overview",
  },
};
