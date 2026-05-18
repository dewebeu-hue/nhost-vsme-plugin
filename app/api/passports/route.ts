import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import {
  generateSupplierPassport,
  getLatestPassport,
  isPassportsBackendConfigured,
} from "@/lib/data/passports";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";

type PassportRequest = {
  action?: unknown;
};

export async function POST(request: Request) {
  if (!isPassportsBackendConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const payload = (await request.json()) as PassportRequest;
    const action = typeof payload.action === "string" ? payload.action : "latest";

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to manage Supplier Passports." }, { status: 401 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization) {
      return NextResponse.json({ configured: true, organization: null }, { status: 404 });
    }

    if (action === "generate") {
      const passport = await generateSupplierPassport(organization.id, user.id, accessToken);

      return NextResponse.json({ configured: true, organization, passport });
    }

    const passport = await getLatestPassport(organization.id, accessToken);

    return NextResponse.json({ configured: true, organization, passport });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      logSafeDiagnostic("passport_auth_required", {
        category: "unauthenticated",
      });

      return NextResponse.json({ error: "Please sign in to manage Supplier Passports." }, { status: 401 });
    }

    const category = classifyPassportError(error);

    logSafeDiagnostic("passport_error", {
      category,
      message: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json(
      { error: "We could not update the Supplier Passport right now.", category },
      { status: 500 },
    );
  }
}

function classifyPassportError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "env_missing";
  }

  if (message.includes("permission") || message.includes("access-denied") || message.includes("not authorized")) {
    return "permission_denied";
  }

  return "graphql_error";
}
