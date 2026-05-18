import { NextResponse } from "next/server";
import {
  getPrimaryOrganizationForUserWithAdmin,
  isWorkspaceBackendConfigured,
} from "@/lib/data/organizations";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { isHasuraGraphqlConfigured } from "@/lib/graphql/client";
import { getNhostAuthUrl } from "@/lib/nhost/config";

export async function POST(request: Request) {
  let userIdResolved = false;

  logSafeDiagnostic("current_org_start");
  logSafeDiagnostic("token_present", {
    tokenPresent: Boolean(request.headers.get("authorization")),
  });

  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    logSafeDiagnostic("current_org_failed", {
      category: tokenResult.category,
      stage: "token_decode",
      hasAdminSecret: isWorkspaceBackendConfigured(),
      hasUserId: false,
      membershipCount: 0,
    });

    return NextResponse.json(
      {
        error: "A valid authenticated user is required.",
        category: tokenResult.category,
        stage: "token_decode",
        hasAdminSecret: isWorkspaceBackendConfigured(),
        hasUserId: false,
        membershipCount: 0,
      },
      { status: 401 },
    );
  }

  try {
    logCurrentOrgInfo("request started");
    logCurrentOrgInfo("auth token present", Boolean(request.headers.get("authorization")));
    logSafeDiagnostic("auth_user_lookup_started");

    const userResult = await resolveUserIdFromNhostToken(tokenResult.token);

    if (!userResult.ok) {
      logSafeDiagnostic("current_org_failed", {
        category: userResult.category,
        stage: "auth_user_lookup",
        hasAdminSecret: isWorkspaceBackendConfigured(),
        hasUserId: false,
        membershipCount: 0,
      });

      return NextResponse.json(
        {
          error: "A valid authenticated user is required.",
          category: userResult.category,
          stage: "auth_user_lookup",
          hasAdminSecret: isWorkspaceBackendConfigured(),
          hasUserId: false,
          membershipCount: 0,
        },
        { status: 401 },
      );
    }

    if (!isHasuraGraphqlConfigured() || !isWorkspaceBackendConfigured()) {
      logSafeDiagnostic("current_org_failed", {
        category: "hasura_admin_secret_missing",
        stage: "admin_lookup",
        hasAdminSecret: false,
        hasUserId: true,
        membershipCount: 0,
      });

      return NextResponse.json(
        {
          error: "Server organization lookup is not configured.",
          category: "hasura_admin_secret_missing",
          stage: "admin_lookup",
          hasAdminSecret: false,
          hasUserId: true,
          membershipCount: 0,
        },
        { status: 500 },
      );
    }

    userIdResolved = true;
    logCurrentOrgInfo("user resolved", true);
    logSafeDiagnostic("auth_user_lookup_success", {
      success: true,
    });
    logSafeDiagnostic("user_resolved", {
      userResolved: true,
    });
    logSafeDiagnostic("admin_secret_present", {
      hasAdminSecret: true,
    });
    logSafeDiagnostic("admin_lookup_started");

    const organization = await getPrimaryOrganizationForUserWithAdmin(userResult.userId);
    logCurrentOrgInfo("organizations found count", organization ? 1 : 0);
    logSafeDiagnostic("memberships_found", {
      count: organization ? 1 : 0,
    });

    if (!organization) {
      logSafeDiagnostic("current_organization_missing", {
        category: "membership_not_found",
        userIdPresent: true,
      });

      return NextResponse.json(
        {
          configured: true,
          organization: null,
          category: "membership_not_found",
          stage: "membership_lookup",
          hasAdminSecret: true,
          hasUserId: true,
          membershipCount: 0,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      configured: true,
      organization,
      category: "current_org_success",
      stage: "organization_lookup",
      hasAdminSecret: true,
      hasUserId: true,
      membershipCount: 1,
    });
  } catch (error) {
    const category = classifyOrganizationError(error);

    logSafeDiagnostic("current_org_failed", {
      category,
      message: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json(
      {
        error: "We could not load your workspace right now.",
        category,
        stage: "admin_lookup",
        hasAdminSecret: isWorkspaceBackendConfigured(),
        hasUserId: userIdResolved,
        membershipCount: 0,
      },
      { status: statusForCurrentOrganizationCategory(category) },
    );
  }
}

type BearerTokenResult =
  | { ok: true; token: string }
  | {
      ok: false;
      category: "missing_authorization_header" | "malformed_authorization_header";
    };

function readBearerToken(header: string | null): BearerTokenResult {
  if (!header) {
    return { ok: false, category: "missing_authorization_header" };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  const token = header.slice("bearer ".length).trim();

  if (!token) {
    return { ok: false, category: "malformed_authorization_header" };
  }

  return { ok: true, token };
}

type UserIdResolutionResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      category: "auth_user_lookup_failed" | "token_expired" | "user_id_missing";
    };

async function resolveUserIdFromNhostToken(token: string): Promise<UserIdResolutionResult> {
  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return { ok: false, category: "auth_user_lookup_failed" };
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        category: isTokenExpired(token) ? "token_expired" : "auth_user_lookup_failed",
      };
    }

    if (!response.ok) {
      return { ok: false, category: "auth_user_lookup_failed" };
    }

    const user = (await response.json()) as { id?: unknown };

    if (typeof user.id !== "string" || !user.id) {
      return { ok: false, category: "user_id_missing" };
    }

    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, category: "auth_user_lookup_failed" };
  }
}

function isTokenExpired(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function classifyOrganizationError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("not configured")) {
    return "hasura_admin_secret_missing";
  }

  if (message.includes("organization_not_found")) {
    return "organization_not_found";
  }

  if (
    message.includes("permission") ||
    message.includes("access-denied") ||
    message.includes("not authorized") ||
    message.includes("not found in type") ||
    (message.includes("field") && message.includes("not found"))
  ) {
    return "admin_lookup_graphql_error";
  }

  if (message.includes("graphql")) {
    return "admin_lookup_graphql_error";
  }

  return "admin_lookup_graphql_error";
}

function statusForCurrentOrganizationCategory(category: string) {
  if (category === "hasura_admin_secret_missing") {
    return 500;
  }

  if (category === "organization_not_found") {
    return 404;
  }

  if (category === "admin_lookup_graphql_error") {
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
