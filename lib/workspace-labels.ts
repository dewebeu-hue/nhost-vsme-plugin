import type {
  EvidenceRoomDocument,
  EvidenceRoomStatus,
  QuestionnaireAnswerStatus,
} from "@/lib/mock-data";

export type QuestionnaireLabels = {
  title: string;
  subtitle: string;
  draft: string;
  overallCompletion: string;
  questionsCompleted: string;
  questionsCompletedShort: string;
  activeSection: string;
  sectionCompletion: string;
  previousSection: string;
  saveAndContinue: string;
  saving: string;
  shareProgress: string;
  moreActions: string;
  tipsTitle: string;
  evidenceRecommendationsTitle: string;
  relatedDocumentsTitle: string;
  needHelpTitle: string;
  needHelpText: string;
  contactSupport: string;
  uploadEvidence: string;
  learnMoreEnergy: string;
  evidence: string;
  attachEvidence: string;
  evidenceRequired: string;
  evidenceSupportText: string;
  attachDialogTitle: string;
  attachDialogDescription: string;
  searchEvidenceDocuments: string;
  searchEvidencePlaceholder: string;
  filterEvidenceByType: string;
  filterEvidenceByStatus: string;
  allTypes: string;
  allStatus: string;
  alreadyAttached: string;
  noMatchingDocuments: string;
  noDocumentsAvailable: string;
  noMatchingDocumentsDescription: string;
  noDocumentsAvailableDescription: string;
  attaching: string;
  cancel: string;
  sectionEnergyTitle: string;
  sectionEnergyDescription: string;
  mockModeMessage: string;
  mockSaveMessage: string;
  saveSignInError: string;
  saveError: string;
  saveSuccess: string;
  liveQuestionnaireLoadFailed: string;
  mockDataAvailable: string;
  questionnairePermissionDenied: string;
  questionnaireSaved: string;
  sessionExpired: string;
  loadFallbackError: string;
  seedFallbackMessage: string;
  attachSaveFirstMessage: string;
  attachMockSuccess: string;
  attachSignInError: string;
  attachError: string;
  attachSuccess: string;
  sections: Record<string, string>;
  questionPrompts: Record<string, string>;
  questionOptions: Record<string, string>;
  helperTexts: Record<string, string>;
  evidenceRecommendations: string[];
  relatedDocuments: { name: string; type: string }[];
  statuses: Record<QuestionnaireAnswerStatus, string>;
  documentStatuses: Record<EvidenceRoomStatus, string>;
  documentTypes: Record<EvidenceRoomDocument["type"], string>;
};

export type DocumentsLabels = {
  title: string;
  subtitle: string;
  breadcrumbRoot: string;
  breadcrumbCurrent: string;
  uploadDocuments: string;
  createFolder: string;
  totalDocuments: string;
  linkedToAnswers: string;
  needsReview: string;
  expiringSoon: string;
  next90Days: string;
  thisMonth: string;
  percentOfTotal: string;
  liveEvidenceFiles: string;
  awaitingValidation: string;
  searchPlaceholder: string;
  allTypes: string;
  allStatus: string;
  allFolders: string;
  columnDocument: string;
  columnType: string;
  columnLinkedTo: string;
  columnUploaded: string;
  columnStatus: string;
  columnActions: string;
  selectAllDocuments: string;
  selectDocument: string;
  actionsFor: string;
  uploadedBy: string;
  preview: string;
  details: string;
  versions: string;
  secureEvidencePreview: string;
  environmentalManagementSystem: string;
  privateWorkspaceDocument: string;
  securePreviewUnavailable: string;
  openSecurePreview: string;
  fileType: string;
  uploaded: string;
  versionCurrent: string;
  linkedToQuestionnaire: string;
  linkToAnswer: string;
  answered: string;
  notLinkedYet: string;
  reviewStatus: string;
  reviewedBy: string;
  changeStatus: string;
  uploadDialogTitle: string;
  uploadDialogDescription: string;
  chooseDocument: string;
  privateFilesNotice: string;
  documentType: string;
  expiryDate: string;
  note: string;
  optional: string;
  optionalNotePlaceholder: string;
  uploadFile: string;
  uploading: string;
  cancel: string;
  chooseBeforeUploading: string;
  linkDialogTitle: string;
  linkDialogDescription: string;
  searchAnswers: string;
  searchAnswersPlaceholder: string;
  filterAnswersBySection: string;
  allSections: string;
  alreadyLinked: string;
  noMatchingAnswers: string;
  noAnswersYet: string;
  noMatchingAnswersDescription: string;
  noAnswersYetDescription: string;
  linking: string;
  linkSelectedAnswers: string;
  noDocumentsTitle: string;
  noDocumentsText: string;
  mockModeMessage: string;
  liveUnavailableMessage: string;
  emptyLiveMessage: string;
  uploadMockMessage: string;
  uploadError: string;
  uploadSuccess: string;
  workspaceUser: string;
  linkMockSuccess: string;
  linkSignInError: string;
  linkError: string;
  linkSuccess: string;
  unknownSize: string;
  recently: string;
  notLinked: string;
  statuses: Record<EvidenceRoomStatus, string>;
  answerStatuses: Record<QuestionnaireAnswerStatus, string>;
  documentTypes: Record<EvidenceRoomDocument["type"], string>;
  sections: Record<string, string>;
  questionTitles: Record<string, string>;
};

export const defaultQuestionnaireLabels: QuestionnaireLabels = {
  title: "VSME Readiness Questionnaire",
  subtitle: "Answer the questions below to build your VSME profile.",
  draft: "Draft",
  overallCompletion: "Overall completion",
  questionsCompleted: "{completed} of {total} questions completed",
  questionsCompletedShort: "{completed} of {total} questions completed",
  activeSection: "Active section",
  sectionCompletion: "Section completion",
  previousSection: "Previous section",
  saveAndContinue: "Save & Continue",
  saving: "Saving...",
  shareProgress: "Share progress",
  moreActions: "More actions",
  tipsTitle: "Tips & Guidance",
  evidenceRecommendationsTitle: "Evidence recommendations",
  relatedDocumentsTitle: "Related documents",
  needHelpTitle: "Need help?",
  needHelpText: "Our team is here to help you complete your VSME profile.",
  contactSupport: "Contact Support",
  uploadEvidence: "Upload evidence",
  learnMoreEnergy: "Learn more about VSME Energy metrics",
  evidence: "Evidence",
  attachEvidence: "Attach evidence",
  evidenceRequired: "Evidence is required for this answer.",
  evidenceSupportText: "Attach supporting files from the Evidence Data Room.",
  attachDialogTitle: "Attach evidence",
  attachDialogDescription: "Choose an existing evidence document that supports this answer.",
  searchEvidenceDocuments: "Search evidence documents",
  searchEvidencePlaceholder: "Search evidence documents...",
  filterEvidenceByType: "Filter evidence by type",
  filterEvidenceByStatus: "Filter evidence by status",
  allTypes: "All types",
  allStatus: "All status",
  alreadyAttached: "Already attached to this answer",
  noMatchingDocuments: "No matching documents",
  noDocumentsAvailable: "No documents available",
  noMatchingDocumentsDescription: "Adjust the search or filters to find another evidence file.",
  noDocumentsAvailableDescription:
    "Upload evidence in the Evidence Data Room before attaching it to answers.",
  attaching: "Attaching...",
  cancel: "Cancel",
  sectionEnergyTitle: "Energy",
  sectionEnergyDescription:
    "This section covers your organization's energy consumption and efficiency.",
  mockModeMessage:
    "Questionnaire is running in mock mode until Nhost is configured and you are signed in.",
  mockSaveMessage:
    "Mock answers updated locally. Connect Nhost to persist questionnaire answers.",
  saveSignInError: "Please sign in before saving questionnaire answers.",
  saveError: "We could not save your answers right now. Please try again.",
  saveSuccess: "Questionnaire answers saved.",
  liveQuestionnaireLoadFailed: "We could not load live questionnaire data.",
  mockDataAvailable: "Mock data is still available.",
  questionnairePermissionDenied: "You do not have permission to update this questionnaire.",
  questionnaireSaved: "Questionnaire saved.",
  sessionExpired: "Your session has expired. Please sign in again.",
  loadFallbackError: "We could not load live questionnaire data.",
  seedFallbackMessage: "Questionnaire seed data is not available yet. Showing mock data.",
  attachSaveFirstMessage: "Save this answer once before attaching evidence.",
  attachMockSuccess: "Evidence attached locally in mock mode.",
  attachSignInError: "Please sign in before attaching evidence.",
  attachError: "We could not attach this evidence right now. Please try again.",
  attachSuccess: "Evidence attached to questionnaire answer.",
  sections: {
    "Company Basics": "Company Basics",
    Employees: "Employees",
    Energy: "Energy",
    Fuel: "Fuel",
    Waste: "Waste",
    "Environmental Policies": "Environmental Policies",
    "Health & Safety": "Health & Safety",
    Certifications: "Certifications",
    Governance: "Governance",
    "Supplier Information": "Supplier Information",
  },
  questionPrompts: {
    "energy-total-consumption":
      "What was your total energy consumption from all sources in the last 12 months?",
    "energy-intensity": "What was your total energy consumption intensity?",
    "energy-primary-source": "What is your primary source of purchased energy?",
    "energy-renewable-onsite": "Do you use any on-site renewable energy?",
    "energy-renewable-percentage":
      "What percentage of your total energy comes from renewable sources?",
    "energy-audit-date": "When was your last energy audit or review conducted?",
    "energy-efficiency-measures":
      "What measures have you implemented to improve energy efficiency?",
    "energy-additional-notes": "Additional notes or context",
  },
  questionOptions: {
    "Grid electricity": "Grid electricity",
    "District heating": "District heating",
    "Natural gas": "Natural gas",
    "Renewable PPA": "Renewable PPA",
    Yes: "Yes",
    No: "No",
    "LED lighting": "LED lighting",
    "Efficient equipment": "Efficient equipment",
    "Insulation improvement": "Insulation improvement",
    "Smart meters": "Smart meters",
    "Heat recovery": "Heat recovery",
  },
  helperTexts: {},
  evidenceRecommendations: [
    "Energy bills or utility invoices",
    "Meter readings or consumption logs",
    "Energy audit or assessment reports",
    "Renewable energy certificates, if applicable",
  ],
  relatedDocuments: [
    { name: "VSME User Guide - Energy", type: "PDF" },
    { name: "Energy Reporting Template", type: "XLSX" },
    { name: "Sample Energy Policy", type: "PDF" },
  ],
  statuses: {
    "Not started": "Not started",
    "In progress": "In progress",
    Completed: "Completed",
    "Needs evidence": "Needs evidence",
    Reviewed: "Reviewed",
  },
  documentStatuses: {
    Reviewed: "Reviewed",
    Linked: "Linked",
    Uploaded: "Uploaded",
    "Needs review": "Needs review",
    "Expiring soon": "Expiring soon",
  },
  documentTypes: {
    Certificate: "Certificate",
    "Utility Bill": "Utility Bill",
    Policy: "Policy",
    Report: "Report",
    Training: "Training",
    Safety: "Safety",
    Questionnaire: "Questionnaire",
    Other: "Other",
  },
};

export const defaultDocumentsLabels: DocumentsLabels = {
  title: "Evidence Data Room",
  subtitle: "Upload, organize and manage documents that support your VSME profile.",
  breadcrumbRoot: "Evidence Data Room",
  breadcrumbCurrent: "Documents",
  uploadDocuments: "Upload documents",
  createFolder: "Create folder",
  totalDocuments: "Total documents",
  linkedToAnswers: "Linked to answers",
  needsReview: "Needs review",
  expiringSoon: "Expiring soon",
  next90Days: "Next 90 days",
  thisMonth: "+{count} this month",
  percentOfTotal: "{percent}% of total",
  liveEvidenceFiles: "Live evidence files",
  awaitingValidation: "Awaiting validation",
  searchPlaceholder: "Search documents by name, tag or answer...",
  allTypes: "All types",
  allStatus: "All status",
  allFolders: "All folders",
  columnDocument: "Document",
  columnType: "Type",
  columnLinkedTo: "Linked to",
  columnUploaded: "Uploaded",
  columnStatus: "Status",
  columnActions: "Actions",
  selectAllDocuments: "Select all documents",
  selectDocument: "Select {title}",
  actionsFor: "Actions for {title}",
  uploadedBy: "by {name}",
  preview: "Preview",
  details: "Details",
  versions: "Versions",
  secureEvidencePreview: "Secure evidence preview",
  environmentalManagementSystem: "Environmental Management System",
  privateWorkspaceDocument: "Private workspace document",
  securePreviewUnavailable:
    "Secure preview will be available after storage access rules are configured.",
  openSecurePreview: "Open secure preview",
  fileType: "File type",
  uploaded: "Uploaded",
  versionCurrent: "Version 1 is the current reviewed document.",
  linkedToQuestionnaire: "Linked to questionnaire",
  linkToAnswer: "Link to answer",
  answered: "Answered",
  notLinkedYet: "This document is not linked to a questionnaire answer yet.",
  reviewStatus: "Review status",
  reviewedBy: "Reviewed by {name} on {date}",
  changeStatus: "Change status",
  uploadDialogTitle: "Upload evidence document",
  uploadDialogDescription:
    "Add a document and classify it before linking it to your VSME profile.",
  chooseDocument: "Choose a PDF, spreadsheet, or policy document",
  privateFilesNotice: "Files are stored as private evidence unless you explicitly share them later.",
  documentType: "Document type",
  expiryDate: "Expiry date",
  note: "Internal note",
  optional: "optional",
  optionalNotePlaceholder: "Add review context or collection notes...",
  uploadFile: "Upload file",
  uploading: "Uploading...",
  cancel: "Cancel",
  chooseBeforeUploading: "Choose a document before uploading.",
  linkDialogTitle: "Link to questionnaire answer",
  linkDialogDescription: "Select answered VSME questions that this evidence document supports.",
  searchAnswers: "Search questionnaire answers",
  searchAnswersPlaceholder: "Search questions by code or title...",
  filterAnswersBySection: "Filter questionnaire answers by section",
  allSections: "All sections",
  alreadyLinked: "Already linked to this document",
  noMatchingAnswers: "No matching answers",
  noAnswersYet: "No questionnaire answers yet",
  noMatchingAnswersDescription: "Adjust the search or section filter to find another answer.",
  noAnswersYetDescription: "Save questionnaire answers before linking evidence documents.",
  linking: "Linking...",
  linkSelectedAnswers: "Link selected answers",
  noDocumentsTitle: "No documents yet",
  noDocumentsText: "Upload your first evidence document to start building your Supplier Passport.",
  mockModeMessage:
    "Evidence room is running in mock mode until Nhost is configured and you are signed in.",
  liveUnavailableMessage: "Live documents are not available yet. Showing mock data.",
  emptyLiveMessage:
    "No live evidence documents yet. Upload your first document to start building the evidence room.",
  uploadMockMessage:
    "Connect Nhost and sign in to upload real evidence documents. Mock data remains available.",
  uploadError: "We could not upload this document right now. Please try again.",
  uploadSuccess: "Evidence document uploaded securely.",
  workspaceUser: "Workspace user",
  linkMockSuccess: "Evidence linked locally in mock mode.",
  linkSignInError: "Please sign in before linking evidence.",
  linkError: "We could not link this evidence right now. Please try again.",
  linkSuccess: "Evidence linked to questionnaire answer.",
  unknownSize: "Unknown size",
  recently: "Recently",
  notLinked: "Not linked yet",
  statuses: {
    Reviewed: "Reviewed",
    Linked: "Linked",
    Uploaded: "Uploaded",
    "Needs review": "Needs review",
    "Expiring soon": "Expiring soon",
  },
  answerStatuses: defaultQuestionnaireLabels.statuses,
  documentTypes: defaultQuestionnaireLabels.documentTypes,
  sections: defaultQuestionnaireLabels.sections,
  questionTitles: {
    "Does your company have an environmental management policy?":
      "Does your company have an environmental management policy?",
    "Provide your ISO 14001 certification.": "Provide your ISO 14001 certification.",
    "What was your total energy consumption from all sources?":
      "What was your total energy consumption from all sources?",
    "Provide health and safety training records.": "Provide health and safety training records.",
    "Does the organization maintain a code of conduct?":
      "Does the organization maintain a code of conduct?",
  },
};

export function formatLabel(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
