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

  const diagnosticContext = {
    action: "unknown",
    hasUserId: false,
    hasOrganizationId: false,
  };

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const payload = (await request.json()) as PassportRequest;
    const action = typeof payload.action === "string" ? payload.action : "latest";
    diagnosticContext.action = action;
    diagnosticContext.hasUserId = Boolean(user.id);

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in to manage Supplier Passports." }, { status: 401 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);
    diagnosticContext.hasOrganizationId = Boolean(organization?.id);

    if (!organization) {
      return NextResponse.json({ configured: true, organization: null }, { status: 404 });
    }

    if (action === "generate") {
      const passport = await generateSupplierPassport(organization.id, user.id);

      return NextResponse.json({ configured: true, organization, passport });
    }

    const passport = await getLatestPassport(organization.id, { useAdminSecret: true });

    return NextResponse.json({ configured: true, organization, passport });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      logSafeDiagnostic("passport_auth_required", {
        category: "unauthenticated",
      });

      return NextResponse.json({ error: "Please sign in to manage Supplier Passports." }, { status: 401 });
    }

    const category = classifyPassportError(error);
    const stage = getPassportErrorStage(error);

    logSafeDiagnostic("passport_error", {
      category,
      stage,
      safeMessage: sanitizePassportErrorMessage(error),
      ...diagnosticContext,
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

function getPassportErrorStage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const [stage] = message.split(":");

  return stage && stage.startsWith("passport_") ? stage : "unknown";
}

function sanitizePassportErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown Passport error.";

  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/x-hasura-admin-secret["':\s]+[A-Za-z0-9._-]+/gi, "x-hasura-admin-secret [redacted]")
    .slice(0, 500);
}
