import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const authUrl = process.env.NEXT_PUBLIC_NHOST_AUTH_URL;
  const storageUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
  const graphqlUrl = process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL;

  return NextResponse.json({
    nhostSubdomainConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN),
    nhostRegionConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_REGION),
    graphqlUrlConfigured: Boolean(graphqlUrl),
    authUrlConfigured: Boolean(authUrl),
    storageUrlConfigured: Boolean(storageUrl),
    authUrlLooksLikeAuthEndpoint: looksLikeServiceEndpoint(authUrl, ".auth."),
    storageUrlLooksLikeStorageEndpoint: looksLikeServiceEndpoint(storageUrl, ".storage."),
    graphqlUrlLooksLikeHasuraEndpoint: looksLikeHasuraGraphqlEndpoint(graphqlUrl),
    hasuraAdminSecretConfiguredServerSide: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
    nhostAdminSecretConfiguredServerSide: Boolean(process.env.NHOST_ADMIN_SECRET),
    shareCookieSecretConfiguredServerSide: Boolean(process.env.SHARE_LINK_COOKIE_SECRET),
    nodeEnv: process.env.NODE_ENV || "unknown",
  }, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

function looksLikeHasuraGraphqlEndpoint(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.host.includes(".hasura.") && url.pathname.endsWith("/v1/graphql");
  } catch {
    return false;
  }
}

function looksLikeServiceEndpoint(value: string | undefined, serviceHostPart: string) {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).host.includes(serviceHostPart);
  } catch {
    return false;
  }
}
