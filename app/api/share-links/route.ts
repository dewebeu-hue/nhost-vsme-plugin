import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import { createShareLink, isShareLinksBackendConfigured } from "@/lib/data/share-links";

type CreateShareLinkPayload = {
  passportId?: unknown;
  organizationId?: unknown;
  buyerName?: unknown;
  buyerEmail?: unknown;
  expiresAt?: unknown;
  password?: unknown;
  documentVisibility?: unknown;
  locale?: unknown;
};

export async function POST(request: Request) {
  if (!isShareLinksBackendConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const payload = (await request.json()) as CreateShareLinkPayload;

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to create a share link." }, { status: 401 });
    }

    const passportId = readString(payload.passportId);
    const organizationId = readString(payload.organizationId);
    const documentVisibility = readDocumentVisibility(payload.documentVisibility);

    if (!passportId || !organizationId) {
      return NextResponse.json({ error: "A generated Supplier Passport is required." }, { status: 400 });
    }

    if (!documentVisibility) {
      return NextResponse.json({ error: "Document visibility is invalid." }, { status: 400 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization || organization.id !== organizationId) {
      return NextResponse.json({ error: "Organization membership is required." }, { status: 403 });
    }

    const result = await createShareLink(
      {
        passportId,
        organizationId,
        createdBy: user.id,
        buyerName: readString(payload.buyerName),
        buyerEmail: readString(payload.buyerEmail),
        expiresAt: readString(payload.expiresAt),
        password: readString(payload.password),
        documentVisibility,
        locale: readString(payload.locale) || "en",
      },
      accessToken,
    );

    return NextResponse.json({
      configured: true,
      shareUrl: result.shareUrl,
      shareLink: sanitizeShareLink(result.shareLink),
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to create a share link." }, { status: 401 });
    }

    console.error("Unable to create share link", {
      stage: "share_link_create",
      reason: "share_link_create_failed",
    });
    return NextResponse.json(
      { error: "We could not create the share link right now." },
      { status: 500 },
    );
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readDocumentVisibility(value: unknown) {
  const visibility = readString(value);

  if (
    visibility === "summary_only" ||
    visibility === "approved_only" ||
    visibility === "all_linked_documents" ||
    visibility === "all_metadata"
  ) {
    return visibility;
  }

  return "";
}

function sanitizeShareLink(shareLink: {
  id: string;
  passport_id: string;
  organization_id: string;
  token: string;
  buyer_name: string | null;
  buyer_email: string | null;
  password_hash: string | null;
  expires_at: string | null;
  is_active: boolean;
  document_visibility: string;
  created_at: string;
}) {
  return {
    id: shareLink.id,
    passport_id: shareLink.passport_id,
    organization_id: shareLink.organization_id,
    token: shareLink.token,
    buyer_name: shareLink.buyer_name,
    buyer_email: shareLink.buyer_email,
    passwordProtected: Boolean(shareLink.password_hash),
    expires_at: shareLink.expires_at,
    is_active: shareLink.is_active,
    document_visibility: shareLink.document_visibility,
    created_at: shareLink.created_at,
  };
}
