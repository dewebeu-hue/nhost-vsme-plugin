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
    const documentVisibility = readString(payload.documentVisibility);

    if (!passportId || !organizationId) {
      return NextResponse.json({ error: "A generated Supplier Passport is required." }, { status: 400 });
    }

    if (documentVisibility !== "approved_only" && documentVisibility !== "all_linked_documents") {
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

    return NextResponse.json({ configured: true, ...result });
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
