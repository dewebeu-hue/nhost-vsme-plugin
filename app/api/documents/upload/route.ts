import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import {
  evidenceDocumentTypes,
  isDocumentsBackendConfigured,
  uploadEvidenceDocument,
  type EvidenceDocumentType,
} from "@/lib/data/documents";

export async function POST(request: Request) {
  if (!isDocumentsBackendConfigured()) {
    return NextResponse.json(
      { error: "Nhost is not configured yet. Document uploads remain in mock mode." },
      { status: 503 },
    );
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const formData = await request.formData();
    const organizationId = readString(formData.get("organizationId"));
    const documentType = readDocumentType(formData.get("documentType"));
    const expiresAt = readDate(formData.get("expiresAt"));
    const note = readString(formData.get("note"));
    const file = formData.get("file");

    if (!accessToken) {
      return NextResponse.json({ error: "Your session is required for secure file upload." }, { status: 401 });
    }

    if (!isUuid(organizationId)) {
      return NextResponse.json({ error: "A valid organization is required." }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please choose a document to upload." }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: "Please choose a document type." }, { status: 400 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization || organization.id !== organizationId) {
      return NextResponse.json(
        { error: "We could not confirm access to this workspace." },
        { status: 403 },
      );
    }

    const document = await uploadEvidenceDocument(
      {
        organizationId,
        userId: user.id,
        file,
        documentType,
        expiresAt,
        note: note || undefined,
      },
      accessToken,
    );

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in before uploading documents." }, { status: 401 });
    }

    console.error("Unable to upload document", error);

    if (error instanceof Error && /permission|access|not found/i.test(error.message)) {
      return NextResponse.json(
        { error: "You do not have permission to upload documents for this workspace." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "We could not upload this document right now. Please try again." },
      { status: 500 },
    );
  }
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
