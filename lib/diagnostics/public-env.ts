export type PublicDiagnostics = {
  nhostSubdomainConfigured: boolean;
  nhostRegionConfigured: boolean;
  graphqlUrlConfigured: boolean;
  authUrlConfigured: boolean;
  storageUrlConfigured: boolean;
  authUrlLooksLikeAuthEndpoint: boolean;
  storageUrlLooksLikeStorageEndpoint: boolean;
  graphqlUrlLooksLikeHasuraEndpoint: boolean;
};

export function getPublicDiagnostics(): PublicDiagnostics {
  const authUrl = process.env.NEXT_PUBLIC_NHOST_AUTH_URL;
  const storageUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
  const graphqlUrl = process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL;

  return {
    nhostSubdomainConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN),
    nhostRegionConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_REGION),
    graphqlUrlConfigured: Boolean(graphqlUrl),
    authUrlConfigured: Boolean(authUrl),
    storageUrlConfigured: Boolean(storageUrl),
    authUrlLooksLikeAuthEndpoint: looksLikeServiceEndpoint(authUrl, ".auth."),
    storageUrlLooksLikeStorageEndpoint: looksLikeServiceEndpoint(storageUrl, ".storage."),
    graphqlUrlLooksLikeHasuraEndpoint: looksLikeHasuraGraphqlEndpoint(graphqlUrl),
  };
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
