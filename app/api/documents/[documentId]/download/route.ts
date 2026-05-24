import { createAPIClient } from "@nhost/nhost-js/storage";
import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  requireCurrentUser,
} from "@/lib/auth/session";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostAdminSecret, getNhostGraphqlUrl, getNhostStorageUrl } from "@/lib/nhost/config";

type DownloadRouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

type DownloadDocumentRecord = {
  id: string;
  organization_id: string;
  file_id: string | null;
  file_name: string;
  mime_type: string | null;
};

type DownloadAccessResponse = {
  documents_by_pk: DownloadDocumentRecord | null;
  organization_members: Array<{
    organization_id: string;
  }>;
};

const getDownloadAccessQuery = `
  query GetDocumentDownloadAccess($documentId: uuid!, $userId: uuid!) {
    documents_by_pk(id: $documentId) {
      id
      organization_id
      file_id
      file_name
      mime_type
    }
    organization_members(where: { user_id: { _eq: $userId } }) {
      organization_id
    }
  }
`;

export const runtime = "nodejs";

export async function GET(request: Request, context: DownloadRouteContext) {
  const storageUrl = getNhostStorageUrl();
  const adminSecret = getNhostAdminSecret();

  if (!getNhostGraphqlUrl() || !storageUrl || !adminSecret) {
    return NextResponse.json({ error: "Document download is not configured." }, { status: 503 });
  }

  try {
    const user = await requireCurrentUser(request);
    const { documentId } = await context.params;
    const access = await executeHasuraGraphql<DownloadAccessResponse>(
      getDownloadAccessQuery,
      { documentId, userId: user.id },
      { useAdminSecret: true },
    );
    const document = access.documents_by_pk;
    const fileId = document?.file_id ?? null;
    const hasMembership = Boolean(
      document &&
      access.organization_members.some((membership) => membership.organization_id === document.organization_id),
    );
    if (!document || !fileId || !hasMembership) {
      logSafeDiagnostic("document_download_denied", {
        stage: "document_download_access",
        hasDocument: Boolean(document),
        hasFileId: Boolean(fileId),
        hasMembership,
      });

      return NextResponse.json({ error: "Document is not available." }, { status: 404 });
    }

    const storage = createAPIClient(storageUrl);
    const file = await storage.getFile(fileId, undefined, {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    });
    const headers = new Headers();
    const contentType = file.headers.get("content-type") || document.mime_type || "application/octet-stream";
    const contentLength = file.headers.get("content-length");

    headers.set("content-type", contentType);
    headers.set(
      "content-disposition",
      `attachment; filename="${sanitizeFilename(document.file_name)}"; filename*=UTF-8''${encodeURIComponent(
        document.file_name,
      )}`,
    );
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new Response(file.body.stream(), {
      status: file.status,
      headers,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to download this document." }, { status: 401 });
    }

    logSafeDiagnostic("document_download_error", {
      stage: "document_download",
      safeMessage: sanitizeDownloadError(error),
    });

    return NextResponse.json({ error: "Document download is not available." }, { status: 500 });
  }
}

function sanitizeFilename(fileName: string) {
  return fileName.replace(/["\\\r\n]/g, "_");
}

function sanitizeDownloadError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown document download error.";

  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/x-hasura-admin-secret["':\s]+[A-Za-z0-9._-]+/gi, "x-hasura-admin-secret [redacted]")
    .slice(0, 300);
}
