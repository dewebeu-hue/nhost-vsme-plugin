"use client";

export type EvidenceDocumentIdentity = {
  id?: unknown;
  documentId?: unknown;
  document_id?: unknown;
} | null;

export type LinkDocumentToQuestionItemsInput = {
  accessToken: string;
  documentId: string;
  questionItemIds: string[];
};

export type LinkDocumentToQuestionItemsResult<TLink> = {
  links?: TLink[];
  error?: string;
};

export function resolveEvidenceDocumentId(document: EvidenceDocumentIdentity) {
  if (!document) {
    return "";
  }

  const candidates = [document.id, document.documentId, document.document_id];
  const documentId = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && isUuid(candidate.trim()),
  );

  return documentId?.trim() ?? "";
}

export function normalizeQuestionItemIds(questionItemIds: string[]) {
  return questionItemIds.filter((questionItemId) => isUuid(questionItemId));
}

export async function linkDocumentToQuestionItems<TLink>({
  accessToken,
  documentId,
  questionItemIds,
}: LinkDocumentToQuestionItemsInput) {
  const response = await fetch("/api/document-links", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      documentId,
      questionItemIds,
    }),
  });
  const payload = (await response.json()) as LinkDocumentToQuestionItemsResult<TLink>;

  return { response, payload };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value,
  );
}
