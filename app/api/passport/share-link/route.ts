import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getNhostAuthUrl, getNhostGraphqlUrl } from "@/lib/nhost/config";
import { calculatePassportReadinessScore } from "@/lib/passport-summary";

export const runtime = "nodejs";

type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

type SupplierPassport = {
  id: string;
  organization_id: string;
  title: string;
  status: "draft" | "generated" | "shared" | "archived";
  readiness_score: number;
  generated_by: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

type ShareLink = {
  id: string;
  passport_id: string;
  organization_id: string;
  token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type UserResolution =
  | { ok: true; userId: string }
  | { ok: false; category: "missing_authorization_header" | "malformed_authorization_header" | "auth_user_lookup_failed" | "token_expired" | "user_id_missing"; status: number };

type OrganizationResolution =
  | { ok: true; userId: string; organization: Organization; role: string }
  | { ok: false; category: string; status: number; stage: string; safeGraphqlMessage?: string };

type AdminGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; safeGraphqlMessage: string };

const writableRoles = new Set(["owner", "editor", "admin"]);

const getMembershipQuery = `
  query GetPassportShareMembership($userId: uuid!) {
    organization_members(where: { user_id: { _eq: $userId } }, limit: 1) {
      id
      user_id
      organization_id
      role
    }
  }
`;

const getOrganizationQuery = `
  query GetPassportShareOrganization($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
      slug
    }
  }
`;

const getLatestPassportQuery = `
  query GetPassportShareLatestPassport($organizationId: uuid!) {
    supplier_passports(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ generated_at: desc_nulls_last }, { created_at: desc }]
      limit: 1
    ) {
      id
      organization_id
      title
      status
      readiness_score
      generated_by
      generated_at
      created_at
      updated_at
    }
  }
`;

const getActiveShareLinkQuery = `
  query GetPassportShareActiveLink($organizationId: uuid!, $now: timestamptz!) {
    share_links(
      where: {
        organization_id: { _eq: $organizationId }
        is_active: { _eq: true }
        _or: [
          { expires_at: { _is_null: true } }
          { expires_at: { _gt: $now } }
        ]
      }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      passport_id
      organization_id
      token
      is_active
      expires_at
      created_at
    }
  }
`;

const getReadinessQuery = `
  query GetPassportShareReadiness($organizationId: uuid!) {
    question_items {
      id
      section_id
      code
      title
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
    ) {
      question_item_id
      value
      status
    }
  }
`;

const insertPassportMutation = `
  mutation InsertPassportSharePassport($object: supplier_passports_insert_input!) {
    insert_supplier_passports_one(object: $object) {
      id
      organization_id
      title
      status
      readiness_score
      generated_by
      generated_at
      created_at
      updated_at
    }
  }
`;

const insertShareLinkMutation = `
  mutation InsertPassportShareLink($object: share_links_insert_input!) {
    insert_share_links_one(object: $object) {
      id
      passport_id
      organization_id
      token
      is_active
      expires_at
      created_at
    }
  }
`;

const updatePassportMutation = `
  mutation UpdatePassportSharePassport($passportId: uuid!, $set: supplier_passports_set_input!) {
    update_supplier_passports_by_pk(pk_columns: { id: $passportId }, _set: $set) {
      id
    }
  }
`;

const deactivateActiveShareLinksMutation = `
  mutation DeactivatePassportShareLinks($organizationId: uuid!) {
    update_share_links(
      where: {
        organization_id: { _eq: $organizationId }
        is_active: { _eq: true }
      }
      _set: { is_active: false }
    ) {
      affected_rows
    }
  }
`;

export async function GET(request: Request) {
  return handleShareLinkRequest(request, "load");
}

export async function POST(request: Request) {
  return handleShareLinkRequest(request, await readShareLinkAction(request));
}

async function handleShareLinkRequest(request: Request, action: "load" | "create" | "deactivate" | "regenerate") {
  const organizationResult = await resolveOrganizationForRequest(request);

  if (!organizationResult.ok) {
    return shareLinkError(
      organizationResult.category,
      organizationResult.stage,
      organizationResult.status,
      organizationResult.safeGraphqlMessage,
    );
  }

  const existingLinkResult = await getActiveShareLink(organizationResult.organization.id);

  if (!existingLinkResult.ok) {
    return shareLinkError("share_link_lookup_graphql_error", "share_link_lookup", 502, existingLinkResult.safeGraphqlMessage);
  }

  const existingLink = existingLinkResult.data.share_links[0] ?? null;

  if (action === "deactivate") {
    if (!writableRoles.has(organizationResult.role)) {
      return shareLinkError("permission_denied", "membership_lookup", 403);
    }

    const deactivateResult = await deactivateActiveShareLinks(organizationResult.organization.id);

    if (!deactivateResult.ok) {
      return shareLinkError("share_link_deactivate_graphql_error", "share_link_deactivate", 502, deactivateResult.safeGraphqlMessage);
    }

    return shareLinkResponse(request, null, organizationResult.organization);
  }

  if (action === "regenerate") {
    if (!writableRoles.has(organizationResult.role)) {
      return shareLinkError("permission_denied", "membership_lookup", 403);
    }

    const deactivateResult = await deactivateActiveShareLinks(organizationResult.organization.id);

    if (!deactivateResult.ok) {
      return shareLinkError("share_link_deactivate_graphql_error", "share_link_deactivate", 502, deactivateResult.safeGraphqlMessage);
    }

    const passportResult = await getOrCreatePassport({
      organizationId: organizationResult.organization.id,
      userId: organizationResult.userId,
    });

    if (!passportResult.ok) {
      return shareLinkError(passportResult.category, passportResult.stage, passportResult.status, passportResult.safeGraphqlMessage);
    }

    const createdLinkResult = await createShareLink({
      organizationId: organizationResult.organization.id,
      passportId: passportResult.passport.id,
      userId: organizationResult.userId,
    });

    if (!createdLinkResult.ok) {
      return shareLinkError("share_link_insert_graphql_error", "share_link_insert", 502, createdLinkResult.safeGraphqlMessage);
    }

    await updatePassportStatus(passportResult.passport.id).catch(() => null);

    return shareLinkResponse(request, createdLinkResult.data.insert_share_links_one, organizationResult.organization);
  }

  if (existingLink) {
    return shareLinkResponse(request, existingLinkResult.data.share_links[0], organizationResult.organization);
  }

  if (action === "load") {
    return NextResponse.json({
      configured: true,
      organization: organizationResult.organization,
      shareLink: null,
      publicPath: null,
      publicUrl: null,
    });
  }

  if (!writableRoles.has(organizationResult.role)) {
    return shareLinkError("permission_denied", "membership_lookup", 403);
  }

  const passportResult = await getOrCreatePassport({
    organizationId: organizationResult.organization.id,
    userId: organizationResult.userId,
  });

  if (!passportResult.ok) {
    return shareLinkError(passportResult.category, passportResult.stage, passportResult.status, passportResult.safeGraphqlMessage);
  }

  const createdLinkResult = await createShareLink({
    organizationId: organizationResult.organization.id,
    passportId: passportResult.passport.id,
    userId: organizationResult.userId,
  });

  if (!createdLinkResult.ok) {
    return shareLinkError("share_link_insert_graphql_error", "share_link_insert", 502, createdLinkResult.safeGraphqlMessage);
  }

  await updatePassportStatus(passportResult.passport.id).catch(() => null);

  return shareLinkResponse(request, createdLinkResult.data.insert_share_links_one, organizationResult.organization);
}

async function readShareLinkAction(request: Request): Promise<"create" | "deactivate" | "regenerate"> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return "create";
  }

  try {
    const payload = (await request.json()) as { action?: unknown };

    if (payload.action === "deactivate" || payload.action === "regenerate") {
      return payload.action;
    }
  } catch {
    return "create";
  }

  return "create";
}

async function resolveOrganizationForRequest(request: Request): Promise<OrganizationResolution> {
  const userResult = await resolveUserFromRequest(request);

  if (!userResult.ok) {
    return { ok: false, category: userResult.category, status: userResult.status, stage: "auth_user_lookup" };
  }

  const membershipResult = await executeAdminGraphql<{ organization_members: Membership[] }>({
    operationName: "GetPassportShareMembership",
    query: getMembershipQuery,
    variables: { userId: userResult.userId },
  });

  if (!membershipResult.ok) {
    return {
      ok: false,
      category: "membership_lookup_graphql_error",
      status: 502,
      stage: "membership_lookup",
      safeGraphqlMessage: membershipResult.safeGraphqlMessage,
    };
  }

  const membership = membershipResult.data.organization_members[0];

  if (!membership) {
    return { ok: false, category: "membership_not_found", status: 404, stage: "membership_lookup" };
  }

  const organizationResult = await executeAdminGraphql<{ organizations_by_pk: Organization | null }>({
    operationName: "GetPassportShareOrganization",
    query: getOrganizationQuery,
    variables: { organizationId: membership.organization_id },
  });

  if (!organizationResult.ok) {
    return {
      ok: false,
      category: "organization_lookup_graphql_error",
      status: 502,
      stage: "organization_lookup",
      safeGraphqlMessage: organizationResult.safeGraphqlMessage,
    };
  }

  if (!organizationResult.data.organizations_by_pk) {
    return { ok: false, category: "organization_not_found", status: 404, stage: "organization_lookup" };
  }

  return {
    ok: true,
    userId: userResult.userId,
    organization: organizationResult.data.organizations_by_pk,
    role: membership.role,
  };
}

async function resolveUserFromRequest(request: Request): Promise<UserResolution> {
  const tokenResult = readBearerToken(request.headers.get("authorization"));

  if (!tokenResult.ok) {
    return { ok: false, category: tokenResult.category, status: 401 };
  }

  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return { ok: false, category: "auth_user_lookup_failed", status: 401 };
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${tokenResult.token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        category: isTokenExpired(tokenResult.token) ? "token_expired" : "auth_user_lookup_failed",
        status: 401,
      };
    }

    if (!response.ok) {
      return { ok: false, category: "auth_user_lookup_failed", status: 401 };
    }

    const user = (await response.json()) as { id?: unknown };

    if (typeof user.id !== "string" || !user.id) {
      return { ok: false, category: "user_id_missing", status: 401 };
    }

    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, category: "auth_user_lookup_failed", status: 401 };
  }
}

function readBearerToken(header: string | null) {
  if (!header) {
    return { ok: false as const, category: "missing_authorization_header" as const };
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return { ok: false as const, category: "malformed_authorization_header" as const };
  }

  const token = header.slice("bearer ".length).trim();

  if (!token) {
    return { ok: false as const, category: "malformed_authorization_header" as const };
  }

  return { ok: true as const, token };
}

async function getActiveShareLink(organizationId: string) {
  return executeAdminGraphql<{ share_links: ShareLink[] }>({
    operationName: "GetPassportShareActiveLink",
    query: getActiveShareLinkQuery,
    variables: { organizationId, now: new Date().toISOString() },
  });
}

async function getOrCreatePassport(input: { organizationId: string; userId: string }): Promise<
  | { ok: true; passport: SupplierPassport }
  | { ok: false; category: string; stage: string; status: number; safeGraphqlMessage?: string }
> {
  const latestResult = await executeAdminGraphql<{ supplier_passports: SupplierPassport[] }>({
    operationName: "GetPassportShareLatestPassport",
    query: getLatestPassportQuery,
    variables: { organizationId: input.organizationId },
  });

  if (!latestResult.ok) {
    return {
      ok: false,
      category: "passport_lookup_graphql_error",
      stage: "passport_lookup",
      status: 502,
      safeGraphqlMessage: latestResult.safeGraphqlMessage,
    };
  }

  const latestPassport = latestResult.data.supplier_passports[0];

  if (latestPassport) {
    return { ok: true, passport: latestPassport };
  }

  const readinessScore = await calculateReadinessScore(input.organizationId);
  const generatedAt = new Date().toISOString();
  const insertResult = await executeAdminGraphql<{ insert_supplier_passports_one: SupplierPassport | null }>({
    operationName: "InsertPassportSharePassport",
    query: insertPassportMutation,
    variables: {
      object: {
        organization_id: input.organizationId,
        title: "Supplier Passport",
        status: "generated",
        readiness_score: readinessScore,
        generated_by: input.userId,
        generated_at: generatedAt,
      },
    },
  });

  if (!insertResult.ok || !insertResult.data.insert_supplier_passports_one) {
    return {
      ok: false,
      category: "passport_insert_graphql_error",
      stage: "passport_insert",
      status: 502,
      safeGraphqlMessage: insertResult.ok
        ? "Supplier Passport insert returned no row."
        : insertResult.safeGraphqlMessage,
    };
  }

  return { ok: true, passport: insertResult.data.insert_supplier_passports_one };
}

async function calculateReadinessScore(organizationId: string) {
  const readinessResult = await executeAdminGraphql<{
    question_items: Array<{ id: string; section_id: string; code: string; title: string }>;
    question_answers: Array<{ question_item_id: string; value: unknown; status: string }>;
  }>({
    operationName: "GetPassportShareReadiness",
    query: getReadinessQuery,
    variables: { organizationId },
  });

  if (!readinessResult.ok || readinessResult.data.question_items.length === 0) {
    return 0;
  }

  return calculatePassportReadinessScore(
    readinessResult.data.question_items,
    readinessResult.data.question_answers,
  );
}

async function createShareLink(input: { organizationId: string; passportId: string; userId: string }) {
  return executeAdminGraphql<{ insert_share_links_one: ShareLink }>({
    operationName: "InsertPassportShareLink",
    query: insertShareLinkMutation,
    variables: {
      object: {
        passport_id: input.passportId,
        organization_id: input.organizationId,
        token: createShareToken(),
        document_visibility: "approved_only",
        created_by: input.userId,
      },
    },
  });
}

async function deactivateActiveShareLinks(organizationId: string) {
  return executeAdminGraphql<{ update_share_links: { affected_rows: number } }>({
    operationName: "DeactivatePassportShareLinks",
    query: deactivateActiveShareLinksMutation,
    variables: { organizationId },
  });
}

async function updatePassportStatus(passportId: string) {
  await executeAdminGraphql({
    operationName: "UpdatePassportSharePassport",
    query: updatePassportMutation,
    variables: {
      passportId,
      set: { status: "shared" },
    },
  });
}

async function executeAdminGraphql<TData>({
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
    return { ok: false, safeGraphqlMessage: "Passport share backend is not configured." };
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ operationName, query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Passport share admin GraphQL request failed", {
      operationName,
      status: response.status,
    });
    return { ok: false, safeGraphqlMessage: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  const firstError = payload.errors?.[0]?.message;

  if (firstError) {
    console.error("Passport share admin GraphQL returned errors", {
      operationName,
      message: firstError,
    });
    return { ok: false, safeGraphqlMessage: firstError };
  }

  if (!payload.data) {
    return { ok: false, safeGraphqlMessage: "GraphQL response did not include data." };
  }

  return { ok: true, data: payload.data };
}

function shareLinkResponse(request: Request, shareLink: ShareLink | null, organization: Organization) {
  const publicPath = shareLink ? createPublicPath(request, shareLink.token) : null;

  return NextResponse.json({
    configured: true,
    organization,
    shareLink,
    publicPath,
    publicUrl: publicPath ? new URL(publicPath, request.url).toString() : null,
  });
}

function shareLinkError(category: string, stage: string, status: number, safeGraphqlMessage?: string) {
  return NextResponse.json(
    {
      error: "We could not load your share link right now.",
      category,
      stage,
      safeGraphqlMessage,
    },
    { status },
  );
}

function createPublicPath(request: Request, token: string) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "en";

  return `/${locale}/passport/${encodeURIComponent(token)}`;
}

function createShareToken() {
  return randomBytes(18).toString("base64url");
}

function isTokenExpired(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as { exp?: unknown };

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
