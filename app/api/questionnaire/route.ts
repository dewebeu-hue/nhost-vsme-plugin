import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import { getDocumentLinks } from "@/lib/data/document-links";
import { getOrganizationDocuments } from "@/lib/data/documents";
import {
  getOrganizationAnswers,
  getQuestionSections,
  getQuestionsBySection,
  isQuestionnaireBackendConfigured,
} from "@/lib/data/questionnaire";

type QuestionnaireLoadPayload = {
  sectionCode?: unknown;
};

export async function POST(request: Request) {
  if (!isQuestionnaireBackendConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const payload = (await request.json()) as QuestionnaireLoadPayload;
    const sectionCode = readString(payload.sectionCode) || "energy";

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to load questionnaire data." }, { status: 401 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization) {
      return NextResponse.json({ configured: true, organization: null }, { status: 404 });
    }

    const [sections, questions, answers, documents, documentLinks] = await Promise.all([
      getQuestionSections(accessToken),
      getQuestionsBySection(sectionCode, accessToken),
      getOrganizationAnswers(organization.id, accessToken),
      getOrganizationDocuments(organization.id, accessToken),
      getDocumentLinks(organization.id, accessToken),
    ]);

    return NextResponse.json({
      configured: true,
      organization,
      activeSectionCode: sectionCode,
      sections,
      questions,
      answers,
      documents,
      documentLinks,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to load questionnaire data." }, { status: 401 });
    }

    console.error("Unable to load questionnaire data", error);
    return NextResponse.json(
      { error: "We could not load live questionnaire data. Mock data is still available." },
      { status: 500 },
    );
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
