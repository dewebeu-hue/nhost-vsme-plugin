import { NextResponse } from "next/server";
import { AuthenticationRequiredError, requireCurrentUser } from "@/lib/auth/session";
import {
  createOrganizationWithOwner,
  isWorkspaceBackendConfigured,
} from "@/lib/data/organizations";

type OnboardingPayload = {
  legalName?: unknown;
  companyName?: unknown;
  vatId?: unknown;
  industry?: unknown;
  employeeCountRange?: unknown;
  headquartersCity?: unknown;
  headquartersCountry?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  if (!isWorkspaceBackendConfigured()) {
    return NextResponse.json(
      {
        error:
          "Nhost is not configured yet. Add the Nhost environment variables before creating a real workspace.",
      },
      { status: 503 },
    );
  }

  try {
    const user = await requireCurrentUser(request);
    const payload = (await request.json()) as OnboardingPayload;
    const legalName = readString(payload.legalName);

    if (!legalName) {
      return NextResponse.json({ error: "Company legal name is required." }, { status: 400 });
    }

    const organization = await createOrganizationWithOwner({
      userId: user.id,
      companyLegalName: legalName,
      companyName: readString(payload.companyName),
      vatId: readString(payload.vatId),
      industry: readString(payload.industry),
      employeeCountRange: readString(payload.employeeCountRange),
      headquartersCity: readString(payload.headquartersCity),
      headquartersCountry: readString(payload.headquartersCountry),
      website: readString(payload.website),
    });

    return NextResponse.json({ organization });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in before creating a workspace." }, { status: 401 });
    }

    console.error("Unable to create workspace", error);
    return NextResponse.json(
      { error: "We could not create your workspace right now. Please try again." },
      { status: 500 },
    );
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
