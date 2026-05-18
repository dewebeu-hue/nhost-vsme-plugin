import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import {
  getPrimaryOrganizationForUser,
} from "@/lib/data/organizations";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { isHasuraGraphqlConfigured } from "@/lib/graphql/client";

export async function POST(request: Request) {
  if (!isHasuraGraphqlConfigured()) {
    return NextResponse.json({ configured: false, organization: null });
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);

    if (!accessToken) {
      logSafeDiagnostic("current_organization_unauthenticated", {
        category: "unauthenticated",
      });

      return NextResponse.json(
        { error: "A valid authenticated user is required.", category: "unauthenticated" },
        { status: 401 },
      );
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization) {
      logSafeDiagnostic("current_organization_missing", {
        category: "no_organization",
        userIdPresent: Boolean(user.id),
      });

      return NextResponse.json(
        { configured: true, organization: null, category: "no_organization" },
        { status: 404 },
      );
    }

    return NextResponse.json({ configured: true, organization });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      logSafeDiagnostic("current_organization_auth_required", {
        category: "unauthenticated",
      });

      return NextResponse.json(
        { error: "A valid authenticated user is required.", category: "unauthenticated" },
        { status: 401 },
      );
    }

    const category = classifyOrganizationError(error);

    logSafeDiagnostic("current_organization_error", {
      category,
      message: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json(
      { error: "We could not load your workspace right now.", category },
      { status: 500 },
    );
  }
}

function classifyOrganizationError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "env_missing";
  }

  if (message.includes("permission") || message.includes("access-denied") || message.includes("not authorized")) {
    return "permission_denied";
  }

  return "graphql_error";
}
