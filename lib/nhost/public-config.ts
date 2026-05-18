export type NhostPublicConfig = {
  subdomain: string;
  region: string;
  authUrl?: string;
  graphqlUrl?: string;
  storageUrl?: string;
};

export function getNhostPublicConfig(): NhostPublicConfig | null {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;

  if (!subdomain || !region) {
    return null;
  }

  return {
    subdomain,
    region,
    authUrl: getNhostPublicAuthUrl(subdomain, region),
    graphqlUrl: getNhostPublicGraphqlUrl(subdomain, region),
    storageUrl: getNhostPublicStorageUrl(subdomain, region),
  };
}

export function isNhostConfigured() {
  return getNhostPublicConfig() !== null;
}

export function getNhostPublicAuthUrl(subdomain: string, region: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_NHOST_AUTH_URL;

  if (configuredUrl && isAuthEndpointUrl(configuredUrl)) {
    return configuredUrl;
  }

  return `https://${subdomain}.auth.${region}.nhost.run/v1`;
}

export function getNhostPublicGraphqlUrl(subdomain: string, region: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL;

  if (configuredUrl && isGraphqlEndpointUrl(configuredUrl)) {
    return configuredUrl;
  }

  return `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;
}

export function getNhostPublicStorageUrl(subdomain: string, region: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;

  if (configuredUrl && isStorageEndpointUrl(configuredUrl)) {
    return configuredUrl;
  }

  return `https://${subdomain}.storage.${region}.nhost.run/v1`;
}

export function isAuthEndpointUrl(value: string) {
  return getSafeUrlHost(value)?.includes(".auth.") ?? false;
}

export function isGraphqlEndpointUrl(value: string) {
  const host = getSafeUrlHost(value);
  if (!host?.includes(".hasura.")) {
    return false;
  }

  try {
    return new URL(value).pathname.endsWith("/v1/graphql");
  } catch {
    return false;
  }
}

export function isStorageEndpointUrl(value: string) {
  return getSafeUrlHost(value)?.includes(".storage.") ?? false;
}

export function getSafeUrlHost(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}
