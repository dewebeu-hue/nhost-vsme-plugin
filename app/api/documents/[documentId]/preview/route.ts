import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getDocumentPreviewUrl, isDocumentsBackendConfigured } from "@/lib/data/documents";

type PreviewRouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(request: Request, context: PreviewRouteContext) {
  if (!isDocumentsBackendConfigured()) {
    return NextResponse.json(
      { error: "Secure preview is not configured yet." },
      { status: 503 },
    );
  }

  try {
    await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const { documentId } = await context.params;

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to preview this document." }, { status: 401 });
    }

    await getDocumentPreviewUrl(documentId, accessToken);

    return NextResponse.json({
      message: "Secure preview access is confirmed. A document renderer will be added later.",
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to preview this document." }, { status: 401 });
    }

    console.error("Unable to prepare document preview", {
      stage: "document_preview",
      reason: "secure_preview_unavailable",
    });
    return NextResponse.json(
      { error: "Secure preview is not available for this document." },
      { status: 404 },
    );
  }
}
