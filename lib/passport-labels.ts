export type PassportLabels = {
  title: string;
  subtitle: string;
  generatePassport: string;
  generatingPassport: string;
  createShareLink: string;
  exportPdf: string;
  exportPdfGenerating: string;
  exportPdfError: string;
  exportPdfSuccess: string;
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
  certificateExpired: string;
  certificateExpiresWithin30Days: string;
  certificateExpiresWithin90Days: string;
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
  copyingLink: string;
  linkCopied: string;
  copyError: string;
  openShareLink: string;
  shareLinkSuccess: string;
  shareLinkError: string;
  cancel: string;
  contextualHelp: {
    title: string;
    text: string;
    disclaimer: string;
  };
  modules: Record<string, string>;
  settings: Record<string, string>;
  settingValues: Record<string, string>;
  checklist: Record<string, string>;
  documentCategories: Record<string, string>;
  evidenceMissingBySection: Record<string, string>;
};

export const defaultPassportLabels: PassportLabels = {
  title: "Supplier Passport",
  subtitle:
    "Review your VSME readiness profile, evidence metadata, and buyer-facing passport before sharing.",
  generatePassport: "Update Passport",
  generatingPassport: "Updating Passport...",
  createShareLink: "Create Share Link",
  exportPdf: "Download PDF",
  exportPdfGenerating: "Generating PDF...",
  exportPdfError: "We could not generate the PDF right now.",
  exportPdfSuccess: "PDF is ready.",
  draftStateTitle: "Passport preview is using draft data",
  draftStateText:
    "Complete the questionnaire and link evidence documents to improve readiness.",
  companySummary: "Company summary",
  companySummaryDescription: "The organization profile buyers will see in the passport.",
  verified: "Profile",
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
  approvedDocuments: "Evidence documents",
  approvedDocumentsDescription: "Evidence metadata available for the buyer-facing passport.",
  noApprovedDocuments: "No evidence summary available yet.",
  certificateExpired: "Certification evidence is expired",
  certificateExpiresWithin30Days: "Certification expires within 30 days",
  certificateExpiresWithin90Days: "Certification expires within 90 days",
  document: "Document",
  category: "Category",
  linkedSections: "Linked sections",
  status: "Status",
  approved: "Available",
  missingDataChecklist: "Missing data checklist",
  missingDataChecklistDescription: "Open items before this passport is shared externally.",
  missingDataNeutral:
    "Missing-data checks will appear here once your questionnaire and documents are reviewed.",
  shareSettingsPreview: "Share settings preview",
  shareSettingsPreviewDescription: "Default controls for a new buyer link.",
  buyerReadOnlyNotice:
    "Buyers can view the shared passport without changing answers or documents.",
  notCertificationTitle: "Important disclaimer",
  notCertificationText:
    "This passport structures supplier-provided sustainability information and evidence metadata. It is not a certification, assurance report, or legal compliance opinion.",
  companyOverview: "Company overview",
  environment: "Environment",
  social: "Social",
  governance: "Governance",
  evidenceSummary: "Evidence summary",
  shared: "Shared",
  hidden: "Hidden",
  approvedAnswers: "completed answers",
  linkedDocuments: "linked documents",
  completion: "completion",
  passportStatus: "Passport status",
  generatedAt: "Generated at",
  noPassportTitle: "Your Supplier Passport draft is not ready yet.",
  noPassportText:
    "Complete the questionnaire and link evidence documents to improve readiness.",
  generateSuccess: "Passport updated.",
  generateError: "We could not update the Passport right now. Please try again.",
  shareLinkGenerateFirst: "Update the Supplier Passport before creating a buyer share link.",
  createShareLinkTitle: "Create buyer share link",
  createShareLinkDescription:
    "Create a secure read-only link that can be sent to a buyer or procurement contact.",
  buyerName: "Buyer name",
  buyerEmail: "Buyer email",
  expiryDate: "Expiry date",
  passwordProtected: "Password protected",
  password: "Password",
  documentVisibility: "Document visibility",
  approvedOnly: "Summary only",
  allLinkedDocuments: "All linked documents",
  createLink: "Create link",
  creatingLink: "Creating link...",
  generatedLink: "Generated link",
  copyLink: "Copy link",
  copyingLink: "Copying...",
  linkCopied: "Link copied.",
  copyError: "We could not copy the link right now.",
  openShareLink: "Open share link",
  shareLinkSuccess: "Share link created successfully.",
  shareLinkError: "We could not create the share link right now.",
  cancel: "Cancel",
  contextualHelp: {
    title: "What buyers can see",
    text: "The public Supplier Passport shows a buyer-safe summary: readiness, section status and evidence availability. Private files are not publicly downloadable.",
    disclaimer: "This is not an audit, certification or assurance report.",
  },
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
    "Approved only": "Summary only",
    Hidden: "Hidden from buyers",
  },
  checklist: {
    "Energy invoices missing": "Energy invoices missing",
    "Waste data needs review": "Waste data needs review",
    "Supplier code update recommended": "Supplier code update recommended",
    "Environmental policy approved": "Environmental policy available",
  },
  documentCategories: {
    certificate: "Certifications",
    utility_bill: "Energy",
    policy: "Environmental policy",
    waste_report: "Waste",
    safety: "Health and safety",
    customer_questionnaire: "Supplier information",
    report: "Other report",
    training: "Workforce / training",
    other: "Other",
  },
  evidenceMissingBySection: {
    company_basics: "Company profile evidence is missing",
    employees: "Workforce evidence is missing",
    energy: "Energy evidence is missing",
    fuel: "Fuel evidence is missing",
    waste: "Waste documentation is missing",
    environmental_policies: "Environmental policy evidence is missing",
    health_safety: "Health and safety evidence is missing",
    certifications: "Certification documents are missing",
    governance: "Governance evidence is missing",
    supplier_information: "Supplier information evidence is missing",
  },
};
