import { NextResponse } from "next/server";
import { getCurrentOrganizationForUser } from "@/lib/data/organizations";
import {
  getDocumentLinks,
  isDocumentLinksBackendConfigured,
  linkDocumentToAnswer,
  unlinkDocumentFromAnswer,
} from "@/lib/data/document-links";
import { updateDocumentStatus } from "@/lib/data/documents";

type DocumentLinksPayload = {
  action?: unknown;
  userId?: unknown;
  organizationId?: unknown;
  documentId?: unknown;
  questionAnswerId?: unknown;
  questionAnswerIds?: unknown;
  currentDocumentStatus?: unknown;
};

export async function POST(request: Request) {
  if (!isDocumentLinksBackendConfigured()) {
    return NextResponse.json({ configured: false, links: [] });
  }

  try {
    const payload = (await request.json()) as DocumentLinksPayload;
    const action = readString(payload.action) || "list";
    const userId = readString(payload.userId);
    const organizationId = readString(payload.organizationId);
    const accessToken = readBearerToken(request.headers.get("authorization"));

    if (!isUuid(userId)) {
      return NextResponse.json({ error: "Please sign in before linking evidence." }, { status: 401 });
    }

    if (!isUuid(organizationId)) {
      return NextResponse.json({ error: "A valid organization is required." }, { status: 400 });
    }

    const organization = await getCurrentOrganizationForUser(userId, accessToken);

    if (!organization || organization.id !== organizationId) {
      return NextResponse.json(
        { error: "We could not confirm access to this workspace." },
        { status: 403 },
      );
    }

    if (action === "link") {
      const documentId = readString(payload.documentId);
      const questionAnswerIds = readUuidArray(payload.questionAnswerIds);

      if (!isUuid(documentId) || !questionAnswerIds.length) {
        return NextResponse.json(
          { error: "Choose a document and at least one questionnaire answer." },
          { status: 400 },
        );
      }

      await Promise.all(
        questionAnswerIds.map((questionAnswerId) =>
          linkDocumentToAnswer(documentId, questionAnswerId, accessToken),
        ),
      );

      if (readString(payload.currentDocumentStatus) === "Uploaded") {
        await updateDocumentStatus(documentId, "linked", accessToken);
      }
    }

    if (action === "unlink") {
      const documentId = readString(payload.documentId);
      const questionAnswerId = readString(payload.questionAnswerId);

      if (!isUuid(documentId) || !isUuid(questionAnswerId)) {
        return NextResponse.json(
          { error: "Choose a document and questionnaire answer to unlink." },
          { status: 400 },
        );
      }

      await unlinkDocumentFromAnswer(documentId, questionAnswerId, accessToken);
    }

    const links = await getDocumentLinks(organizationId, accessToken);

    return NextResponse.json({ configured: true, links });
  } catch (error) {
    console.error("Unable to update document links", error);
    return NextResponse.json(
      { error: "We could not update evidence links right now. Please try again." },
      { status: 500 },
    );
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readUuidArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && isUuid(item));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value,
  );
}

function readBearerToken(value: string | null) {
  if (!value?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = value.slice("Bearer ".length).trim();
  return token || undefined;
}
