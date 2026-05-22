import "server-only";

import { createAPIClient } from "@nhost/nhost-js/storage";
import type { FileMetadata } from "@nhost/nhost-js/storage";
import {
  INSERT_DOCUMENT,
  UPDATE_DOCUMENT_STATUS,
} from "@/lib/graphql/mutations";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { GET_ORGANIZATION_DOCUMENTS } from "@/lib/graphql/queries";
import { getNhostGraphqlUrl, getNhostStorageUrl } from "@/lib/nhost/config";

export type EvidenceDocumentStatus =
  | "uploaded"
  | "linked"
  | "reviewed"
  | "expiring_soon"
  | "needs_review";

export type EvidenceDocumentType =
  | "certificate"
  | "utility_bill"
  | "policy"
  | "waste_report"
  | "safety"
  | "customer_questionnaire"
  | "other"
  | "report"
  | "training";

export type EvidenceDocumentRecord = {
  id: string;
  organization_id: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  document_type: EvidenceDocumentType;
  status: EvidenceDocumentStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UploadEvidenceDocumentInput = {
  organizationId: string;
  userId: string;
  file: File;
  documentType: EvidenceDocumentType;
  expiresAt?: string;
  note?: string;
};

export type InsertDocumentMetadataInput = {
  organizationId: string;
  uploadedBy: string;
  fileId: string;
  fileName: string;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  documentType: EvidenceDocumentType;
  status?: EvidenceDocumentStatus;
  expiresAt?: string | null;
};

type OrganizationDocumentsResponse = {
  documents: EvidenceDocumentRecord[];
};

type DocumentByIdResponse = {
  documents_by_pk: { id: string; file_id: string | null } | null;
};

type InsertDocumentResponse = {
  insert_documents_one: EvidenceDocumentRecord | null;
};

type UpdateDocumentStatusResponse = {
  update_documents_by_pk: EvidenceDocumentRecord | null;
};

type DeleteDocumentResponse = {
  delete_documents_by_pk: (EvidenceDocumentRecord & { file_id: string | null }) | null;
};

export const evidenceDocumentTypes = [
  "certificate",
  "utility_bill",
  "policy",
  "waste_report",
  "safety",
  "customer_questionnaire",
  "other",
  "report",
  "training",
] as const satisfies EvidenceDocumentType[];

const getDocumentFileIdById = `
  query GetDocumentFileIdById($documentId: uuid!) {
    documents_by_pk(id: $documentId) {
      id
      file_id
    }
  }
`;

const deleteDocumentWithFileId = `
  mutation DeleteDocumentWithFileId($documentId: uuid!) {
    delete_documents_by_pk(id: $documentId) {
      id
      organization_id
      file_id
      file_name
      file_size_bytes
      mime_type
      document_type
      status
      expires_at
      created_at
      updated_at
    }
  }
`;

export const evidenceDocumentStatuses = [
  "uploaded",
  "linked",
  "reviewed",
  "expiring_soon",
  "needs_review",
] as const satisfies EvidenceDocumentStatus[];

export function isDocumentsBackendConfigured() {
  return Boolean(getNhostGraphqlUrl() && getNhostStorageUrl());
}

export async function getOrganizationDocuments(
  organizationId: string,
  accessToken?: string,
) {
  const data = await executeDocumentsGraphql<OrganizationDocumentsResponse>(
    GET_ORGANIZATION_DOCUMENTS,
    { organizationId },
    accessToken,
  );

  return data.documents;
}

export async function uploadEvidenceDocument(
  input: UploadEvidenceDocumentInput,
  accessToken?: string,
) {
  if (!accessToken) {
    throw new Error("A signed-in user is required to upload evidence.");
  }

  const storageFile = await uploadFileToNhost(input, accessToken);

  return insertDocumentMetadata(
    {
      organizationId: input.organizationId,
      uploadedBy: input.userId,
      fileId: storageFile.id,
      fileName: storageFile.name || input.file.name,
      fileSizeBytes: storageFile.size || input.file.size,
      mimeType: storageFile.mimeType || input.file.type || null,
      documentType: input.documentType,
      status: "uploaded",
      expiresAt: input.expiresAt || null,
    },
    accessToken,
  );
}

export async function insertDocumentMetadata(
  input: InsertDocumentMetadataInput,
  accessToken?: string,
) {
  const data = await executeDocumentsGraphql<InsertDocumentResponse>(
    INSERT_DOCUMENT,
    {
      object: {
        organization_id: input.organizationId,
        uploaded_by: input.uploadedBy,
        file_id: input.fileId,
        file_name: input.fileName,
        file_size_bytes: input.fileSizeBytes ?? null,
        mime_type: input.mimeType ?? null,
        document_type: input.documentType,
        status: input.status ?? "uploaded",
        expires_at: input.expiresAt || null,
      },
    },
    accessToken,
  );

  if (!data.insert_documents_one) {
    throw new Error("Document metadata could not be saved.");
  }

  return data.insert_documents_one;
}

export async function updateDocumentStatus(
  documentId: string,
  status: EvidenceDocumentStatus,
  accessToken?: string,
) {
  const data = await executeDocumentsGraphql<UpdateDocumentStatusResponse>(
    UPDATE_DOCUMENT_STATUS,
    { documentId, status },
    accessToken,
  );

  if (!data.update_documents_by_pk) {
    throw new Error("Document status could not be updated.");
  }

  return data.update_documents_by_pk;
}

export async function getDocumentPreviewUrl(documentId: string, accessToken?: string) {
  const data = await executeDocumentsGraphql<DocumentByIdResponse>(
    getDocumentFileIdById,
    { documentId },
    accessToken,
  );

  if (!data.documents_by_pk?.file_id) {
    throw new Error("Secure preview is not available for this document.");
  }

  return `/api/documents/${documentId}/preview`;
}

export async function deleteDocument(documentId: string, accessToken?: string) {
  const data = await executeDocumentsGraphql<DeleteDocumentResponse>(
    deleteDocumentWithFileId,
    { documentId },
    accessToken,
  );

  if (!data.delete_documents_by_pk) {
    throw new Error("Document could not be deleted.");
  }

  if (data.delete_documents_by_pk.file_id) {
    await deleteFileFromNhost(data.delete_documents_by_pk.file_id, accessToken);
  }

  return data.delete_documents_by_pk;
}

async function uploadFileToNhost(
  input: UploadEvidenceDocumentInput,
  accessToken: string,
): Promise<FileMetadata> {
  const storageUrl = getNhostStorageUrl();

  if (!storageUrl) {
    throw new Error("Nhost Storage is not configured.");
  }

  const storage = createAPIClient(storageUrl);
  const response = await storage.uploadFiles(
    {
      "file[]": [input.file],
      "metadata[]": [
        {
          name: input.file.name,
          metadata: {
            organizationId: input.organizationId,
            documentType: input.documentType,
            note: input.note || undefined,
          },
        },
      ],
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const file = response.body.processedFiles[0];

  if (!file?.id) {
    throw new Error("Nhost Storage did not return a file identifier.");
  }

  return file;
}

async function deleteFileFromNhost(fileId: string, accessToken?: string) {
  const storageUrl = getNhostStorageUrl();

  if (!storageUrl || !accessToken) {
    return;
  }

  const storage = createAPIClient(storageUrl);

  await storage.deleteFile(fileId, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

async function executeDocumentsGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string,
): Promise<TData> {
  const graphqlUrl = getNhostGraphqlUrl();

  if (!graphqlUrl || !accessToken) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  return executeHasuraGraphql<TData>(query, variables, { accessToken });
}
