import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import { getDocumentLinks } from "@/lib/data/document-links";
import {
  getOrganizationDocuments,
  isDocumentsBackendConfigured,
} from "@/lib/data/documents";
import { getOrganizationAnswers } from "@/lib/data/questionnaire";

export async function POST(request: Request) {
  if (!isDocumentsBackendConfigured()) {
    return NextResponse.json({ configured: false, documents: [] });
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to load documents." }, { status: 401 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization) {
      return NextResponse.json({ configured: true, organization: null, documents: [] }, { status: 404 });
    }

    const [documents, documentLinks, answers] = await Promise.all([
      getOrganizationDocuments(organization.id, accessToken),
      getDocumentLinks(organization.id, accessToken),
      getOrganizationAnswers(organization.id, accessToken),
    ]);

    return NextResponse.json({
      configured: true,
      organization,
      documents,
      documentLinks,
      answers,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to load documents." }, { status: 401 });
    }

    console.error("Unable to load documents", error);
    return NextResponse.json(
      { error: "We could not load live documents. Mock data is still available." },
      { status: 500 },
    );
  }
}
