import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    nhostSubdomainConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN),
    nhostRegionConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_REGION),
    graphqlUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL),
    authUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_AUTH_URL),
    storageUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_STORAGE_URL),
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
