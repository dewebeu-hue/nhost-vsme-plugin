import { NextResponse } from "next/server";
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
      category: "hasura_admin_secret_missing",
    });

    return NextResponse.json(
      {
        error: "Server organization lookup is not configured.",
        category: "hasura_admin_secret_missing",
        stage: "admin_lookup",
        hasAdminSecret: false,
        hasUserId: false,
        membershipCount: 0,
      },
      { status: 500 },
    );
  }

  try {
    logCurrentOrgInfo("request started");
    logCurrentOrgInfo("auth token present", Boolean(request.headers.get("authorization")));

    const tokenResult = readUserIdFromAuthorizationHeader(request.headers.get("authorization"));

    if (!tokenResult.ok) {
      logSafeDiagnostic("current_org_failed", {
        category: tokenResult.category,
        stage: tokenResult.stage,
        hasAdminSecret: isWorkspaceBackendConfigured(),
        hasUserId: false,
        membershipCount: 0,
      });

      return NextResponse.json(
        {
          error: "A valid authenticated user is required.",
          category: tokenResult.category,
          stage: tokenResult.stage,
          hasAdminSecret: isWorkspaceBackendConfigured(),
          hasUserId: false,
          membershipCount: 0,
        },
        { status: 401 },
      );
    }

    logCurrentOrgInfo("user resolved", true);
    logSafeDiagnostic("user_resolved", {
      userResolved: true,
    });

    const organization = await getPrimaryOrganizationForUserWithAdmin(tokenResult.userId);
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
        hasUserId: false,
        membershipCount: 0,
      },
      { status: statusForCurrentOrganizationCategory(category) },
    );
  }
}

type TokenReadResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      category:
        | "missing_authorization_header"
        | "malformed_authorization_header"
        | "token_decode_failed"
        | "token_expired"
        | "user_id_missing_from_token";
      stage: "token_decode";
    };

function readUserIdFromAuthorizationHeader(header: string | null): TokenReadResult {
  if (!header) {
    return { ok: false, category: "missing_authorization_header", stage: "token_decode" };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false, category: "malformed_authorization_header", stage: "token_decode" };
  }

  const token = header.slice("bearer ".length).trim();
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return { ok: false, category: "token_decode_failed", stage: "token_decode" };
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as {
      sub?: unknown;
      exp?: unknown;
      "https://hasura.io/jwt/claims"?: {
        "x-hasura-user-id"?: unknown;
      };
    };

    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return { ok: false, category: "token_expired", stage: "token_decode" };
    }

    const subject = typeof payload.sub === "string" ? payload.sub : "";
    const hasuraUserId =
      typeof payload["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"] === "string"
        ? payload["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]
        : "";
    const userId = subject || hasuraUserId;

    if (!userId) {
      return { ok: false, category: "user_id_missing_from_token", stage: "token_decode" };
    }

    return { ok: true, userId };
  } catch {
    return { ok: false, category: "token_decode_failed", stage: "token_decode" };
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
