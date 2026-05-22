import { NextResponse } from "next/server";
import { createAPIClient } from "@nhost/nhost-js/storage";
import type { FileMetadata } from "@nhost/nhost-js/storage";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { evidenceDocumentTypes, type EvidenceDocumentType } from "@/lib/data/documents";
import {
  getNhostAdminSecret,
  getNhostAuthUrl,
  getNhostGraphqlUrl,
  getNhostStorageUrl,
} from "@/lib/nhost/config";

export const runtime = "nodejs";

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type EvidenceDocumentRecord = {
  id: string;
  organization_id: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  document_type: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

type BearerTokenResult =
  | { ok: true; token: string }
  | {
      ok: false;
      category: "missing_authorization_header" | "malformed_authorization_header";
    };

type UserIdResolutionResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      category: "auth_user_lookup_failed" | "token_expired" | "user_id_missing";
    };

const writableRoles = new Set(["owner", "editor", "admin"]);

const getMembershipQuery = `
  query GetDocumentUploadMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      limit: 1
    ) {
      id
      user_id
      organization_id
      role
    }
  }
`;

const insertDocumentMutation = `
  mutation InsertDocumentMetadata($object: documents_insert_input!) {
    insert_documents_one(object: $object) {
      id
      organization_id
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

export async function POST(request: Request) {
  logSafeDiagnostic("document_upload_start");

  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return uploadError(tokenResult.category, "auth", 401);
  }

  const organizationResult = await resolveOrganizationForRequest(tokenResult.token);

  if (!organizationResult.ok) {
    return uploadError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      {
        hasUserId: organizationResult.hasUserId,
        organizationIdPresent: false,
        membershipVerified: false,
        safeGraphqlMessage: organizationResult.safeGraphqlMessage,
      },
    );
  }

  if (!writableRoles.has(organizationResult.role)) {
    return uploadError("permission_denied", "membership_lookup", 403, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
    });
  }

  const storageUrl = getNhostStorageUrl();
  const storageAdminSecret = getNhostAdminSecret();

  if (
    !storageUrl ||
    !storageAdminSecret ||
    !getNhostGraphqlUrl() ||
    !process.env.HASURA_GRAPHQL_ADMIN_SECRET
  ) {
    return uploadError("documents_backend_missing", "configuration", 503, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
    });
  }

  const formData = await request.formData();
  const documentType = readDocumentType(formData.get("documentType"));
  const expiresAt = readDate(formData.get("expiresAt"));
  const note = readString(formData.get("note"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return uploadError("file_missing", "validation", 400, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
    });
  }

  if (!documentType) {
    return uploadError("document_type_missing", "validation", 400, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
    });
  }

  logSafeDiagnostic("document_upload_validated", {
    hasUserId: true,
    organizationIdPresent: true,
    membershipVerified: true,
    hasFile: true,
    fileSize: file.size,
    mimeType: file.type || "unknown",
  });

  const storageResult = await uploadFileToNhost({
    documentType,
    file,
    note,
    organizationId: organizationResult.organizationId,
    storageAdminSecret,
    storageUrl,
  });

  if (!storageResult.ok) {
    return uploadError(storageResult.category, "storage_upload", 502, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
      storageUploadSucceeded: false,
      safeGraphqlMessage: storageResult.safeMessage,
      storageStatus: storageResult.status,
    });
  }

  logSafeDiagnostic("storage_upload_success", {
    storageUploadSucceeded: true,
  });

  const metadataResult = await executeDocumentsAdminGraphql<{
    insert_documents_one: EvidenceDocumentRecord | null;
  }>({
    operationName: "InsertDocumentMetadata",
    query: insertDocumentMutation,
    variables: {
      object: {
        organization_id: organizationResult.organizationId,
        uploaded_by: organizationResult.userId,
        file_id: storageResult.file.id,
        file_name: storageResult.file.name || file.name,
        file_size_bytes: storageResult.file.size || file.size,
        mime_type: storageResult.file.mimeType || file.type || null,
        document_type: documentType,
        status: "uploaded",
        expires_at: expiresAt || null,
      },
    },
  });

  if (!metadataResult.ok || !metadataResult.data.insert_documents_one) {
    return uploadError("document_metadata_insert_failed", "metadata_insert", 502, {
      hasUserId: true,
      organizationIdPresent: true,
      membershipVerified: true,
      storageUploadSucceeded: true,
      safeGraphqlMessage: metadataResult.ok
        ? "Document metadata insert returned no row."
        : metadataResult.safeGraphqlMessage,
    });
  }

  return NextResponse.json({
    document: metadataResult.data.insert_documents_one,
  });
}

type UploadFileResult =
  | { ok: true; file: FileMetadata }
  | {
      ok: false;
      category: "storage_upload_failed" | "storage_permission_denied" | "storage_bucket_missing";
      safeMessage: string;
      status?: number;
    };

async function uploadFileToNhost({
  documentType,
  file,
  note,
  organizationId,
  storageAdminSecret,
  storageUrl,
}: {
  documentType: EvidenceDocumentType;
  file: File;
  note: string;
  organizationId: string;
  storageAdminSecret: string;
  storageUrl: string;
}): Promise<UploadFileResult> {
  try {
    const storage = createAPIClient(storageUrl);
    const response = await storage.uploadFiles(
      {
        "file[]": [file],
        "metadata[]": [
          {
            name: file.name,
            metadata: {
              organizationId,
              documentType,
              note: note || undefined,
            },
          },
        ],
      },
      {
        headers: {
          "x-hasura-admin-secret": storageAdminSecret,
        },
      },
    );
    const uploadedFile = response.body.processedFiles[0];

    if (!uploadedFile?.id) {
      return {
        ok: false,
        category: "storage_upload_failed",
        safeMessage: "Nhost Storage did not return a file identifier.",
      };
    }

    return { ok: true, file: uploadedFile };
  } catch (error) {
    const status = readFetchErrorStatus(error);
    const category = classifyStorageUploadError(status, error);
    const safeMessage = readSafeStorageErrorMessage(error, status);

    console.error("Nhost Storage upload failed", {
      category,
      status,
      message: safeMessage,
    });
    return { ok: false, category, safeMessage, status };
  }
}

type OrganizationResolutionResult =
  | {
      ok: true;
      userId: string;
      organizationId: string;
      role: string;
    }
  | {
      ok: false;
      category:
        | "auth_user_lookup_failed"
        | "token_expired"
        | "user_id_missing"
        | "hasura_admin_secret_missing"
        | "membership_lookup_graphql_error"
        | "membership_not_found";
      stage: string;
      status: number;
      hasUserId: boolean;
      safeGraphqlMessage?: string;
    };

async function resolveOrganizationForRequest(token: string): Promise<OrganizationResolutionResult> {
  const userResult = await resolveUserIdFromNhostToken(token);

  if (!userResult.ok) {
    return {
      ok: false,
      category: userResult.category,
      stage: "auth_user_lookup",
      status: 401,
      hasUserId: false,
    };
  }

  if (!getNhostGraphqlUrl() || !process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
    return {
      ok: false,
      category: "hasura_admin_secret_missing",
      stage: "membership_lookup",
      status: 500,
      hasUserId: true,
    };
  }

  const membershipResult = await executeDocumentsAdminGraphql<{
    organization_members: Membership[];
  }>({
    operationName: "GetDocumentUploadMembership",
    query: getMembershipQuery,
    variables: { userId: userResult.userId },
  });

  if (!membershipResult.ok) {
    return {
      ok: false,
      category: "membership_lookup_graphql_error",
      stage: "membership_lookup",
      status: 502,
      hasUserId: true,
      safeGraphqlMessage: membershipResult.safeGraphqlMessage,
    };
  }

  const membership = membershipResult.data.organization_members[0];

  if (!membership) {
    return {
      ok: false,
      category: "membership_not_found",
      stage: "membership_lookup",
      status: 404,
      hasUserId: true,
    };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

function uploadError(
  category: string,
  stage: string,
  status: number,
  metadata: {
    hasUserId?: boolean;
    organizationIdPresent?: boolean;
    membershipVerified?: boolean;
    storageUploadSucceeded?: boolean;
    safeGraphqlMessage?: string;
    storageStatus?: number;
  } = {},
) {
  logSafeDiagnostic("document_upload_failed", {
    category,
    stage,
    hasUserId: metadata.hasUserId ?? false,
    organizationIdPresent: metadata.organizationIdPresent ?? false,
    membershipVerified: metadata.membershipVerified ?? false,
    storageUploadSucceeded: metadata.storageUploadSucceeded ?? false,
    storageStatus: metadata.storageStatus,
  });

  return NextResponse.json(
    {
      error: "We could not upload this document right now.",
      category,
      stage,
      hasUserId: metadata.hasUserId ?? false,
      organizationIdPresent: metadata.organizationIdPresent ?? false,
      membershipVerified: metadata.membershipVerified ?? false,
      storageUploadSucceeded: metadata.storageUploadSucceeded ?? false,
      storageStatus: metadata.storageStatus,
    },
    { status },
  );
}

function readBearerToken(header: string | null): BearerTokenResult {
  if (!header) {
    return { ok: false, category: "missing_authorization_header" };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  const token = header.slice("bearer ".length).trim();

  if (!token) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  return { ok: true, token };
}

async function resolveUserIdFromNhostToken(token: string): Promise<UserIdResolutionResult> {
  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return { ok: false, category: "auth_user_lookup_failed" };
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        category: isTokenExpired(token) ? "token_expired" : "auth_user_lookup_failed",
      };
    }

    if (!response.ok) {
      return { ok: false, category: "auth_user_lookup_failed" };
    }

    const user = (await response.json()) as { id?: unknown };

    if (typeof user.id !== "string" || !user.id) {
      return { ok: false, category: "user_id_missing" };
    }

    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, category: "auth_user_lookup_failed" };
  }
}

async function executeDocumentsAdminGraphql<TData>({
  operationName,
  query,
  variables,
}: {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}): Promise<AdminGraphqlResult<TData>> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

  if (!graphqlUrl || !adminSecret) {
    return { ok: false, safeGraphqlMessage: "Hasura admin lookup is not configured." };
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Document upload admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Document upload admin GraphQL returned errors", {
      operationName,
      reason: "graphql_returned_errors",
    });
    return { ok: false, safeGraphqlMessage: firstError };
  }

  if (!payload.data) {
    return { ok: false, safeGraphqlMessage: "GraphQL response did not include data." };
  }

  return { ok: true, data: payload.data };
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function readDocumentType(value: FormDataEntryValue | null): EvidenceDocumentType | null {
  if (typeof value !== "string") {
    return null;
  }

  return evidenceDocumentTypes.includes(value as EvidenceDocumentType)
    ? (value as EvidenceDocumentType)
    : null;
}

function readDate(value: FormDataEntryValue | null) {
  const raw = readString(value);

  if (!raw) {
    return undefined;
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function isTokenExpired(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function readFetchErrorStatus(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

function readSafeStorageErrorMessage(error: unknown, status?: number) {
  if (error instanceof Error && error.message) {
    return status ? `Nhost Storage returned HTTP ${status}: ${error.message}` : error.message;
  }

  return status ? `Nhost Storage returned HTTP ${status}.` : "Nhost Storage upload failed.";
}

function classifyStorageUploadError(
  status: number | undefined,
  error: unknown,
): "storage_upload_failed" | "storage_permission_denied" | "storage_bucket_missing" {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (status === 401 || status === 403) {
    return "storage_permission_denied";
  }

  if (status === 404 || message.includes("bucket")) {
    return "storage_bucket_missing";
  }

  return "storage_upload_failed";
}
