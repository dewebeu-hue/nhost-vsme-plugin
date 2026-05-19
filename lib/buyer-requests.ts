export const buyerRequestStatuses = [
  "draft",
  "in_progress",
  "ready_to_share",
  "shared",
  "closed",
] as const;

export type BuyerRequestStatus = (typeof buyerRequestStatuses)[number];

export const buyerRequestSectionCodes = [
  "company_basics",
  "employees",
  "energy",
  "fuel",
  "waste",
  "environmental_policies",
  "health_safety",
  "certifications",
  "governance",
  "supplier_information",
] as const;

export type BuyerRequestSectionCode = (typeof buyerRequestSectionCodes)[number];

export type BuyerRequest = {
  id: string;
  organization_id: string;
  buyer_name: string;
  buyer_contact_name: string | null;
  buyer_contact_email: string | null;
  request_title: string;
  request_description: string | null;
  due_date: string | null;
  status: BuyerRequestStatus;
  requested_sections: BuyerRequestSectionCode[];
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  readiness?: BuyerRequestListReadiness;
};

export type BuyerRequestSectionReadiness = {
  code: BuyerRequestSectionCode;
  title: string;
  totalQuestions: number;
  answeredQuestions: number;
  completion: number;
  evidenceRequired: number;
  evidenceLinked: number;
  expiredCertificates: number;
  expiringSoonCertificates: number;
};

export type BuyerRequestResponsePackage = {
  hasActiveShareLink: boolean;
  publicPassportPath: string | null;
  organizationName: string | null;
  uploadedDocumentCount: number;
  linkedEvidenceCount: number;
  expiredCertificateCount: number;
  expiringSoonCertificateCount: number;
};

export type BuyerRequestListReadiness = {
  readinessPercent: number;
  missingActionsCount: number;
};

export type BuyerRequestInput = {
  buyerName?: string;
  buyerContactName?: string;
  buyerContactEmail?: string;
  requestTitle?: string;
  requestDescription?: string;
  dueDate?: string;
  status?: BuyerRequestStatus;
  requestedSections?: BuyerRequestSectionCode[];
  notes?: string;
};

export function isBuyerRequestStatus(value: unknown): value is BuyerRequestStatus {
  return typeof value === "string" && buyerRequestStatuses.includes(value as BuyerRequestStatus);
}

export function normalizeRequestedSections(value: unknown): BuyerRequestSectionCode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowed = new Set<string>(buyerRequestSectionCodes);

  return [...new Set(value.filter((item): item is BuyerRequestSectionCode =>
    typeof item === "string" && allowed.has(item),
  ))];
}

export function normalizeBuyerRequestRecord(
  request: Omit<BuyerRequest, "requested_sections"> & { requested_sections: unknown },
): BuyerRequest {
  return {
    ...request,
    requested_sections: normalizeRequestedSections(request.requested_sections),
  };
}
