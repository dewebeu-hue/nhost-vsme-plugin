import {
  getNhostPublicAuthUrl,
  getNhostPublicConfig,
  getNhostPublicGraphqlUrl,
  getNhostPublicStorageUrl,
  isAuthEndpointUrl,
  isStorageEndpointUrl,
} from "@/lib/nhost/public-config";

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
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:8080/v1/graphql";
  }

  return getNhostPublicGraphqlUrl(config.subdomain, config.region);
}

export function getNhostAuthUrl() {
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:4000/v1";
  }

  return getNhostPublicAuthUrl(config.subdomain, config.region);
}

export function getNhostStorageUrl() {
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (config.subdomain === "local" || config.region === "local") {
    return "http://localhost:5000/v1";
  }

  return getNhostPublicStorageUrl(config.subdomain, config.region);
}

export function authUrlLooksLikeAuthEndpoint() {
  const authUrl = process.env.NEXT_PUBLIC_NHOST_AUTH_URL;
  return Boolean(authUrl && isAuthEndpointUrl(authUrl));
}

export function storageUrlLooksLikeStorageEndpoint() {
  const storageUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
  return Boolean(storageUrl && isStorageEndpointUrl(storageUrl));
}
