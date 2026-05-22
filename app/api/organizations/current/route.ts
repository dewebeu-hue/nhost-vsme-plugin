import { NextResponse } from "next/server";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";

type Organization = {
  id: string;
  name: string;
  slug: string;
  vat_id: string | null;
  industry: string | null;
  employee_count_range: string | null;
  headquarters_city: string | null;
  headquarters_country: string | null;
  countries_served: string[] | null;
  is_verified: boolean;
  plan_key: string;
  billing_interval: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
};

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

const getMembershipQuery = `
  query GetMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      limit: 1
    ) {
      id
      user_id
      organization_id
      role
    }
  }
`;

const getOrganizationQuery = `
  query GetOrganization($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
      slug
      vat_id
      industry
      employee_count_range
      headquarters_city
      headquarters_country
      countries_served
      is_verified
      plan_key
      billing_interval
      subscription_status
      created_at
      updated_at
    }
  }
`;

export async function POST(request: Request) {
  logSafeDiagnostic("current_org_start");
  logSafeDiagnostic("token_present", {
    tokenPresent: Boolean(request.headers.get("authorization")),
  });

  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    logSafeDiagnostic("current_org_failed", {
      category: tokenResult.category,
      stage: "token_decode",
      hasAdminSecret: hasHasuraAdminSecret(),
      hasUserId: false,
      membershipCount: 0,
    });

    return NextResponse.json(
      {
        error: "A valid authenticated user is required.",
        category: tokenResult.category,
        stage: "token_decode",
        hasAdminSecret: hasHasuraAdminSecret(),
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
        hasAdminSecret: hasHasuraAdminSecret(),
        hasUserId: false,
        membershipCount: 0,
      });

      return NextResponse.json(
        {
          error: "A valid authenticated user is required.",
          category: userResult.category,
          stage: "auth_user_lookup",
          hasAdminSecret: hasHasuraAdminSecret(),
          hasUserId: false,
          membershipCount: 0,
        },
        { status: 401 },
      );
    }

    if (!getNhostGraphqlUrl() || !hasHasuraAdminSecret()) {
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

    logSafeDiagnostic("membership_lookup_started");
    const membershipResult = await executeCurrentOrgAdminGraphql<{
      organization_members: Membership[];
    }>({
      operationName: "GetMembership",
      query: getMembershipQuery,
      variables: { userId: userResult.userId },
    });

    if (!membershipResult.ok) {
      logSafeDiagnostic("current_org_failed", {
        category: "membership_lookup_graphql_error",
        stage: "membership_lookup",
      });

      return NextResponse.json(
        {
          error: "We could not load your workspace right now.",
          category: "membership_lookup_graphql_error",
          stage: "membership_lookup",
          hasAdminSecret: true,
          hasUserId: true,
          membershipCount: 0,
        },
        { status: 502 },
      );
    }

    const membership = membershipResult.data.organization_members[0];
    const membershipCount = membershipResult.data.organization_members.length;

    logSafeDiagnostic("membership_lookup_success", {
      success: true,
    });
    logSafeDiagnostic("membership_count", {
      count: membershipCount,
    });
    logSafeDiagnostic("memberships_found", {
      count: membershipCount,
    });

    if (!membership) {
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

    logSafeDiagnostic("organization_id_present", {
      organizationIdPresent: Boolean(membership.organization_id),
    });
    logSafeDiagnostic("organization_lookup_started");

    const organizationResult = await executeCurrentOrgAdminGraphql<{
      organizations_by_pk: Organization | null;
    }>({
      operationName: "GetOrganization",
      query: getOrganizationQuery,
      variables: { organizationId: membership.organization_id },
    });

    if (!organizationResult.ok) {
      logSafeDiagnostic("current_org_failed", {
        category: "organization_lookup_graphql_error",
        stage: "organization_lookup",
      });

      return NextResponse.json(
        {
          error: "We could not load your workspace right now.",
          category: "organization_lookup_graphql_error",
          stage: "organization_lookup",
          hasAdminSecret: true,
          hasUserId: true,
          membershipCount: 1,
        },
        { status: 502 },
      );
    }

    const organization = organizationResult.data.organizations_by_pk;

    logSafeDiagnostic("organization_lookup_success", {
      success: Boolean(organization),
    });

    if (!organization) {
      return NextResponse.json(
        {
          error: "We could not load your workspace right now.",
          category: "organization_not_found",
          stage: "organization_lookup",
          hasAdminSecret: true,
          hasUserId: true,
          membershipCount: 1,
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
  } catch {
    logSafeDiagnostic("current_org_failed", {
      category: "admin_lookup_graphql_error",
    });

    return NextResponse.json(
      {
        error: "We could not load your workspace right now.",
        category: "admin_lookup_graphql_error",
        stage: "admin_lookup",
        hasAdminSecret: hasHasuraAdminSecret(),
        hasUserId: true,
        membershipCount: 0,
      },
      { status: 502 },
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

async function executeCurrentOrgAdminGraphql<TData>({
  operationName,
  query,
  variables,
}: {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}): Promise<AdminGraphqlResult<TData>> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

  if (!graphqlUrl || !adminSecret) {
    return { ok: false, safeGraphqlMessage: "Hasura admin lookup is not configured." };
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Current organization admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Current organization admin GraphQL returned errors", {
      operationName,
      reason: "graphql_returned_errors",
    });
    return { ok: false, safeGraphqlMessage: firstError };
  }

  if (!payload.data) {
    return { ok: false, safeGraphqlMessage: "GraphQL response did not include data." };
  }

  return { ok: true, data: payload.data };
}

function hasHasuraAdminSecret() {
  return Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET);
}

function logCurrentOrgInfo(message: string, value?: boolean | number) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const details = value === undefined ? "" : ` ${value}`;
  console.info(`[current-org] ${message}${details}`);
}
