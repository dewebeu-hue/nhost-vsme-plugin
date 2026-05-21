import type { BuyerRequestSectionCode, BuyerRequestStatus } from "@/lib/buyer-requests";

export type BuyerRequestLabels = {
  title: string;
  subtitle: string;
  createRequest: string;
  creating: string;
  saveRequest: string;
  saving: string;
  buyerName: string;
  buyerContactName: string;
  buyerContactEmail: string;
  requestTitle: string;
  requestDescription: string;
  dueDate: string;
  requestedSections: string;
  notes: string;
  internalNotes: string;
  internalNotesDescription: string;
  saveNotes: string;
  notesSaved: string;
  requestActivity: string;
  created: string;
  currentStatus: string;
  evidenceLinkedLabel: string;
  missingSteps: string;
  statusDescriptions: Record<BuyerRequestStatus, string>;
  status: string;
  openRequest: string;
  emptyTitle: string;
  emptyDescription: string;
  loadError: string;
  createError: string;
  updateError: string;
  validationRequired: string;
  validationEmail: string;
  sectionCount: string;
  noDueDate: string;
  backToList: string;
  requestDetails: string;
  requestReadiness: string;
  missingActions: string;
  readinessSummary: string;
  evidenceLinked: string;
  answeredQuestions: string;
  completion: string;
  evidenceAvailable: string;
  evidenceRecommended: string;
  noEvidenceYet: string;
  certificateExpiryWarning: string;
  completeSectionQuestions: string;
  uploadOrLinkEvidence: string;
  reviewCertificateExpiry: string;
  noObviousGaps: string;
  actionsTitle: string;
  reviewQuestionnaire: string;
  uploadLinkEvidence: string;
  openPassport: string;
  openSharePage: string;
  downloadPdfDraft: string;
  downloadPdfHint: string;
  responsePackage: string;
  prepareResponse: string;
  copyResponseNote: string;
  copying: string;
  responseNoteCopied: string;
  createPublicLinkFirst: string;
  requestLooksReady: string;
  completeRemainingActionsBeforeSharing: string;
  markReadyToShare: string;
  checklistCompleteRequestedSections: string;
  checklistLinkEvidence: string;
  checklistReviewPassport: string;
  checklistConfirmPublicLink: string;
  checklistDownloadPdf: string;
  checklistMarkReady: string;
  done: string;
  incomplete: string;
  requestedSectionsSummary: string;
  evidenceSummary: string;
  missingActionsSummary: string;
  responseNoteWithLink: string;
  responseNoteWithoutLink: string;
  activeShareLinkAvailable: string;
  noActiveShareLink: string;
  pdfDraftAvailable: string;
  evidenceAvailableOnRequest: string;
  currentRequestStatus: string;
  dueSoon: string;
  overdue: string;
  dueInDays: string;
  dueToday: string;
  overdueByDays: string;
  lastUpdated: string;
  needsAttention: string;
  readyToShare: string;
  shared: string;
  noRequestedSections: string;
  notProvidedYet: string;
  contextualHelpTitle: string;
  contextualHelpText: string;
  noEmailHelpText: string;
  statuses: Record<BuyerRequestStatus, string>;
  sections: Record<BuyerRequestSectionCode, string>;
};

export const defaultBuyerRequestLabels: BuyerRequestLabels = {
  title: "Buyer requests",
  subtitle: "Track buyer-specific ESG and supplier data requests inside your Supplier Passport workspace.",
  createRequest: "Create request",
  creating: "Creating...",
  saveRequest: "Save request",
  saving: "Saving...",
  buyerName: "Buyer",
  buyerContactName: "Contact person",
  buyerContactEmail: "Contact email",
  requestTitle: "Request title",
  requestDescription: "Description",
  dueDate: "Due date",
  requestedSections: "Requested sections",
  notes: "Notes",
  internalNotes: "Internal notes",
  internalNotesDescription: "Add notes for your team. These notes are not shown to buyers.",
  saveNotes: "Save notes",
  notesSaved: "Notes saved",
  requestActivity: "Request activity",
  created: "Created",
  currentStatus: "Current status",
  evidenceLinkedLabel: "Evidence linked",
  missingSteps: "Missing actions",
  statusDescriptions: {
    draft: "Request is being prepared.",
    in_progress: "Work on questionnaire and evidence is in progress.",
    ready_to_share: "Response package appears ready to share.",
    shared: "Supplier marked this request as shared.",
    closed: "Request is closed.",
  },
  status: "Status",
  openRequest: "Open request",
  emptyTitle: "No buyer requests yet.",
  emptyDescription:
    "Create a request to track what a buyer is asking for and prepare a response from your Supplier Passport.",
  loadError: "We could not load buyer requests right now.",
  createError: "We could not create this buyer request right now.",
  updateError: "We could not update this buyer request right now.",
  validationRequired: "Buyer name and request title are required.",
  validationEmail: "Enter a valid buyer contact email.",
  sectionCount: "{count} sections",
  noDueDate: "No due date",
  backToList: "Back to buyer requests",
  requestDetails: "Request details",
  requestReadiness: "Request readiness",
  missingActions: "Missing or recommended actions",
  readinessSummary: "Requested section readiness",
  evidenceLinked: "{linked} linked evidence items",
  answeredQuestions: "{answered} of {total} answered",
  completion: "{percent}% complete",
  evidenceAvailable: "Evidence available",
  evidenceRecommended: "Evidence recommended",
  noEvidenceYet: "No evidence yet",
  certificateExpiryWarning: "Certificate expiry warning",
  completeSectionQuestions: "Complete unanswered {section} questions.",
  uploadOrLinkEvidence: "Upload or link evidence for {section}.",
  reviewCertificateExpiry: "Review certificate expiry dates.",
  noObviousGaps: "No obvious gaps for the selected sections.",
  actionsTitle: "Prepare response",
  reviewQuestionnaire: "Review questionnaire",
  uploadLinkEvidence: "Upload/link evidence",
  openPassport: "Open Passport",
  openSharePage: "Open Share page",
  downloadPdfDraft: "Download PDF draft",
  downloadPdfHint: "Download the PDF draft from the Passport page.",
  responsePackage: "Response package",
  prepareResponse: "Prepare response",
  copyResponseNote: "Copy response note",
  copying: "Copying...",
  responseNoteCopied: "Response note copied",
  createPublicLinkFirst: "Create public link first",
  requestLooksReady: "This request looks ready to share.",
  completeRemainingActionsBeforeSharing: "Complete the remaining actions before sharing.",
  markReadyToShare: "Mark as ready to share",
  checklistCompleteRequestedSections: "Complete requested questionnaire sections",
  checklistLinkEvidence: "Link evidence documents",
  checklistReviewPassport: "Review Supplier Passport",
  checklistConfirmPublicLink: "Confirm public link is active",
  checklistDownloadPdf: "Download PDF draft",
  checklistMarkReady: "Mark request as ready to share",
  done: "Done",
  incomplete: "Incomplete",
  requestedSectionsSummary: "{count} requested sections, {percent}% readiness",
  evidenceSummary: "{linked} linked evidence items. Evidence documents are available on request.",
  missingActionsSummary: "{count} remaining gaps",
  responseNoteWithLink:
    "Hello {buyer}, {organization} has prepared a Supplier Passport summary for your request. You can view the public summary here: {link}. Supporting evidence documents are available on request.",
  responseNoteWithoutLink:
    "Hello {buyer}, {organization} has prepared a Supplier Passport summary for your request. Supporting evidence documents are available on request.",
  activeShareLinkAvailable: "Active public Passport link available",
  noActiveShareLink: "No active public Passport link yet",
  pdfDraftAvailable: "PDF draft available from the Passport page",
  evidenceAvailableOnRequest: "Evidence documents are available on request",
  currentRequestStatus: "Current buyer request status",
  dueSoon: "Due soon",
  overdue: "Overdue",
  dueInDays: "Due in {count} days",
  dueToday: "Due today",
  overdueByDays: "Overdue by {count} days",
  lastUpdated: "Last updated {date}",
  needsAttention: "Needs attention",
  readyToShare: "Ready to share",
  shared: "Shared",
  noRequestedSections: "No specific sections selected yet.",
  notProvidedYet: "Not provided yet",
  contextualHelpTitle: "How to use Buyer Requests",
  contextualHelpText: "Use Buyer Requests to track what a buyer is asking for and prepare a response using your Supplier Passport, evidence and PDF draft.",
  noEmailHelpText: "Email sending is not enabled. Copy the response note and send it through your usual procurement channel.",
  statuses: {
    draft: "Draft",
    in_progress: "In progress",
    ready_to_share: "Ready to share",
    shared: "Shared",
    closed: "Closed",
  },
  sections: {
    company_basics: "Company basics",
    employees: "Employees",
    energy: "Energy",
    fuel: "Fuel",
    waste: "Waste",
    environmental_policies: "Environmental policies",
    health_safety: "Health and safety",
    certifications: "Certifications",
    governance: "Governance",
    supplier_information: "Supplier information",
  },
};

export function formatBuyerRequestLabel(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
