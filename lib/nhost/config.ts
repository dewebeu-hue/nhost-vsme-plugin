import { getNhostPublicConfig } from "@/lib/nhost/public-config";

export { getNhostPublicConfig, isNhostConfigured } from "@/lib/nhost/public-config";

export function getNhostAdminSecret() {
  return process.env.NHOST_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET || null;
}

export function getShareLinkCookieSecret() {
  if (process.env.SHARE_LINK_COOKIE_SECRET) {
    return process.env.SHARE_LINK_COOKIE_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return getNhostAdminSecret() || "supplier-passport-local-share-cookie-secret";
  }

  return null;
}

export function getNhostGraphqlUrl() {
  if (process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL;
  }

  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:8080/v1/graphql";
  }

  return `https://${config.subdomain}.graphql.${config.region}.nhost.run/v1/graphql`;
}

export function getNhostAuthUrl() {
  if (process.env.NEXT_PUBLIC_NHOST_AUTH_URL) {
    return process.env.NEXT_PUBLIC_NHOST_AUTH_URL;
  }

  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:4000/v1";
  }

  return `https://${config.subdomain}.auth.${config.region}.nhost.run/v1`;
}

export function getNhostStorageUrl() {
  if (process.env.NEXT_PUBLIC_NHOST_STORAGE_URL) {
    return process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
  }

  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:5000/v1";
  }

  return `https://${config.subdomain}.storage.${config.region}.nhost.run/v1`;
}
