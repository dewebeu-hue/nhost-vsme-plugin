import { NextResponse } from "next/server";
import { AuthenticationRequiredError, requireCurrentUser } from "@/lib/auth/session";
import {
  createOrganizationWithOwner,
  isWorkspaceBackendConfigured,
} from "@/lib/data/organizations";

export const runtime = "nodejs";

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
        error: "env_missing",
        category: "env_missing",
        message: "Server onboarding configuration is missing.",
      },
      { status: 503 },
    );
  }

  try {
    const user = await requireCurrentUser(request);
    const payload = (await request.json()) as OnboardingPayload;
    const legalName = readString(payload.legalName);

    if (!legalName) {
      return NextResponse.json(
        {
          error: "organization_create_failed",
          category: "organization_create_failed",
          message: "Company legal name is required.",
        },
        { status: 400 },
      );
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
      return NextResponse.json(
        {
          error: "auth_required",
          category: "auth_required",
          message: "Please sign in before creating a workspace.",
        },
        { status: 401 },
      );
    }

    const category = classifyOnboardingError(error);
    logOnboardingServerError(category);

    return NextResponse.json(
      {
        error: category,
        category,
        message: "We could not create your workspace right now. Please try again.",
      },
      { status: 500 },
    );
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function classifyOnboardingError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "env_missing";
  }

  if (message.includes("duplicate") || message.includes("unique") || message.includes("slug")) {
    return "duplicate_workspace_slug";
  }

  if (message.includes("member")) {
    return "membership_create_failed";
  }

  if (message.includes("profile")) {
    return "profile_create_failed";
  }

  if (message.includes("organization") || message.includes("workspace")) {
    return "organization_create_failed";
  }

  return "unknown_onboarding_error";
}

function logOnboardingServerError(category: string) {
  console.error("Unable to create workspace", {
    category,
    reason: "workspace_create_failed",
  });
}
