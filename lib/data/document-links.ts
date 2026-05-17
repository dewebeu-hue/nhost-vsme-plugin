import "server-only";

import {
  LINK_DOCUMENT_TO_ANSWER,
  UNLINK_DOCUMENT_FROM_ANSWER,
} from "@/lib/graphql/mutations";
import {
  GET_ANSWERS_FOR_DOCUMENT,
  GET_DOCUMENTS_FOR_ANSWER,
  GET_DOCUMENT_LINKS,
} from "@/lib/graphql/queries";
import { getNhostAdminSecret, getNhostGraphqlUrl } from "@/lib/nhost/config";
import type { EvidenceDocumentRecord } from "@/lib/data/documents";
import type { GraphqlJson, QuestionAnswerRecord } from "@/lib/data/questionnaire";

export type LinkedQuestionAnswerRecord = Omit<QuestionAnswerRecord, "question_item"> & {
  question_item: {
    id: string;
    section_id: string;
    code: string;
    title: string;
    evidence_required: boolean;
    question_section: {
      id: string;
      code: string;
      title: string;
    } | null;
  } | null;
};

export type LinkedDocumentRecord = Pick<
  EvidenceDocumentRecord,
  | "id"
  | "organization_id"
  | "file_name"
  | "file_size_bytes"
  | "mime_type"
  | "document_type"
  | "status"
  | "expires_at"
  | "created_at"
  | "updated_at"
>;

export type DocumentLinkRecord = {
  id: string;
  document_id: string;
  question_answer_id: string;
  created_at: string;
  document: LinkedDocumentRecord | null;
  question_answer: LinkedQuestionAnswerRecord | null;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type DocumentLinksResponse = {
  document_links: DocumentLinkRecord[];
};

type LinkDocumentResponse = {
  insert_document_links_one: DocumentLinkRecord | null;
};

type UnlinkDocumentResponse = {
  delete_document_links: {
    returning: DocumentLinkRecord[];
  } | null;
};

export function isDocumentLinksBackendConfigured() {
  return Boolean(getNhostGraphqlUrl());
}

export async function getDocumentLinks(organizationId: string, accessToken?: string) {
  const data = await executeDocumentLinksGraphql<DocumentLinksResponse>(
    GET_DOCUMENT_LINKS,
    { organizationId },
    accessToken,
  );

  return data.document_links;
}

export async function linkDocumentToAnswer(
  documentId: string,
  questionAnswerId: string,
  accessToken?: string,
) {
  const data = await executeDocumentLinksGraphql<LinkDocumentResponse>(
    LINK_DOCUMENT_TO_ANSWER,
    {
      object: {
        document_id: documentId,
        question_answer_id: questionAnswerId,
      },
    },
    accessToken,
  );

  if (!data.insert_document_links_one) {
    throw new Error("Document could not be linked to this answer.");
  }

  return data.insert_document_links_one;
}

export async function unlinkDocumentFromAnswer(
  documentId: string,
  questionAnswerId: string,
  accessToken?: string,
) {
  const data = await executeDocumentLinksGraphql<UnlinkDocumentResponse>(
    UNLINK_DOCUMENT_FROM_ANSWER,
    { documentId, questionAnswerId },
    accessToken,
  );

  return data.delete_document_links?.returning ?? [];
}

export async function getDocumentsForAnswer(questionAnswerId: string, accessToken?: string) {
  const data = await executeDocumentLinksGraphql<DocumentLinksResponse>(
    GET_DOCUMENTS_FOR_ANSWER,
    { questionAnswerId },
    accessToken,
  );

  return data.document_links;
}

export async function getAnswersForDocument(documentId: string, accessToken?: string) {
  const data = await executeDocumentLinksGraphql<DocumentLinksResponse>(
    GET_ANSWERS_FOR_DOCUMENT,
    { documentId },
    accessToken,
  );

  return data.document_links;
}

async function executeDocumentLinksGraphql<TData>(
  query: string,
  variables: Record<string, GraphqlJson | unknown>,
  accessToken?: string,
): Promise<TData> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = getNhostAdminSecret();

  if (!graphqlUrl || (!accessToken && !adminSecret)) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  const authHeaders: Record<string, string> = accessToken
    ? { authorization: `Bearer ${accessToken}` }
    : { "x-hasura-admin-secret": adminSecret ?? "" };

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Nhost GraphQL request failed.");
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Nhost GraphQL returned an error.");
  }

  if (!payload.data) {
    throw new Error("Nhost GraphQL returned no data.");
  }

  return payload.data;
}
