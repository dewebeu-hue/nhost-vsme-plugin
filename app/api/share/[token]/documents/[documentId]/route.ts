import { type NextRequest, NextResponse } from "next/server";
import {
  canAccessSharedDocument,
  getSharedDocumentFile,
  getShareVerificationCookieName,
  recordShareLinkAccess,
} from "@/lib/data/share-links";

type SharedDocumentContext = {
  params: Promise<{
    token: string;
    documentId: string;
  }>;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: SharedDocumentContext) {
  const { token, documentId } = await context.params;
  const verificationCookieValue = request.cookies.get(getShareVerificationCookieName(token))?.value;
  const access = await canAccessSharedDocument({
    token,
    documentId,
    verificationCookieValue,
  });

  if (!access.ok) {
    const status =
      access.reason === "inactive" ||
      access.reason === "expired" ||
      access.reason === "password_required"
        ? 403
        : 404;

    return NextResponse.json({ error: "Document is not available." }, { status });
  }

  try {
    const file = await getSharedDocumentFile(access.document);
    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const headers = new Headers();
    const contentType =
      file.headers.get("content-type") ||
      access.document.mime_type ||
      "application/octet-stream";
    const contentLength = file.headers.get("content-length");

    headers.set("content-type", contentType);
    headers.set(
      "content-disposition",
      `${isDownload ? "attachment" : "inline"}; filename="${sanitizeFilename(
        access.document.file_name,
      )}"`,
    );
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    await recordShareLinkAccess({
      shareLinkId: access.shareLink.id,
      ipAddress: readForwardedIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return new Response(file.body.stream(), {
      status: file.status,
      headers,
    });
  } catch {
    console.error("Unable to serve shared document", {
      stage: "shared_document_access",
      reason: "storage_proxy_failed",
    });

    return NextResponse.json(
      { error: "Document access is not configured." },
      { status: 501 },
    );
  }
}

function readForwardedIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

function sanitizeFilename(fileName: string) {
  return fileName.replace(/["\\\r\n]/g, "_");
}
