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
  readinessSummary: string;
  evidenceLinked: string;
  answeredQuestions: string;
  completion: string;
  actionsTitle: string;
  reviewQuestionnaire: string;
  openEvidenceRoom: string;
  openPassport: string;
  openSharePage: string;
  downloadPdfHint: string;
  noRequestedSections: string;
  notProvidedYet: string;
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
  readinessSummary: "Requested section readiness",
  evidenceLinked: "{linked} linked evidence items",
  answeredQuestions: "{answered} of {total} answered",
  completion: "{percent}% complete",
  actionsTitle: "Prepare response",
  reviewQuestionnaire: "Review questionnaire",
  openEvidenceRoom: "Open Evidence Room",
  openPassport: "Open Passport",
  openSharePage: "Open Share page",
  downloadPdfHint: "Download the PDF draft from the Passport page.",
  noRequestedSections: "No specific sections selected yet.",
  notProvidedYet: "Not provided yet",
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
