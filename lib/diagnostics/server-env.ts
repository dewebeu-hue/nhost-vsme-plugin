import "server-only";

import { getPublicDiagnostics } from "@/lib/diagnostics/public-env";

export type ServerDiagnostics = ReturnType<typeof getServerDiagnostics>;

export function getServerDiagnostics() {
  return {
    ...getPublicDiagnostics(),
    hasuraAdminSecretConfiguredServerSide: Boolean(process.env.HASURA_GRAPHQL_ADMIN_SECRET),
    nhostAdminSecretConfiguredServerSide: Boolean(process.env.NHOST_ADMIN_SECRET),
    shareCookieSecretConfiguredServerSide: Boolean(process.env.SHARE_LINK_COOKIE_SECRET),
    nodeEnv: process.env.NODE_ENV || "unknown",
  };
}

export function logSafeDiagnostic(event: string, details: Record<string, unknown> = {}) {
  console.info(`[diagnostics:${event}]`, {
    ...getServerDiagnostics(),
    ...details,
  });
}
