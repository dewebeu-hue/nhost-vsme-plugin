import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  isRequestBearerTokenExpired,
  requireCurrentUser,
} from "@/lib/auth/session";
import {
  getPrimaryOrganizationForUserWithAdmin,
  isWorkspaceBackendConfigured,
} from "@/lib/data/organizations";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { isHasuraGraphqlConfigured } from "@/lib/graphql/client";

export async function POST(request: Request) {
  logSafeDiagnostic("current_org_start");
  logSafeDiagnostic("token_present", {
    tokenPresent: Boolean(request.headers.get("authorization")),
  });

  if (!isHasuraGraphqlConfigured()) {
    return NextResponse.json({
      configured: false,
      organization: null,
      category: "env_missing",
    });
  }

  if (!isWorkspaceBackendConfigured()) {
    logSafeDiagnostic("current_org_failed", {
      category: "env_missing",
    });

    return NextResponse.json(
      { error: "Server organization lookup is not configured.", category: "env_missing" },
      { status: 500 },
    );
  }

  try {
    logCurrentOrgInfo("request started");
    logCurrentOrgInfo("auth token present", Boolean(request.headers.get("authorization")));

    const user = await requireCurrentUser(request);
    logCurrentOrgInfo("user resolved", Boolean(user.id));
    logSafeDiagnostic("user_resolved", {
      userResolved: Boolean(user.id),
    });

    const organization = await getPrimaryOrganizationForUserWithAdmin(user.id);
    logCurrentOrgInfo("organizations found count", organization ? 1 : 0);
    logSafeDiagnostic("memberships_found", {
      count: organization ? 1 : 0,
    });

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
      const category = isRequestBearerTokenExpired(request) ? "token_expired" : "unauthenticated";

      logSafeDiagnostic("current_organization_auth_required", {
        category,
      });

      return NextResponse.json(
        { error: "A valid authenticated user is required.", category },
        { status: 401 },
      );
    }

    const category = classifyOrganizationError(error);

    logSafeDiagnostic("current_org_failed", {
      category,
      message: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json(
      { error: "We could not load your workspace right now.", category },
      { status: statusForCurrentOrganizationCategory(category) },
    );
  }
}

function classifyOrganizationError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "env_missing";
  }

  if (
    message.includes("permission") ||
    message.includes("access-denied") ||
    message.includes("not authorized") ||
    message.includes("not found in type") ||
    (message.includes("field") && message.includes("not found"))
  ) {
    return "permission_denied";
  }

  if (message.includes("graphql")) {
    return "graphql_error";
  }

  return "unknown_current_org_error";
}

function statusForCurrentOrganizationCategory(category: string) {
  if (category === "permission_denied") {
    return 403;
  }

  if (category === "env_missing") {
    return 503;
  }

  if (category === "graphql_error") {
    return 502;
  }

  return 500;
}

function logCurrentOrgInfo(message: string, value?: boolean | number) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const details = value === undefined ? "" : ` ${value}`;
  console.info(`[current-org] ${message}${details}`);
}
