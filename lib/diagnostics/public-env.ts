export type PublicDiagnostics = {
  nhostSubdomainConfigured: boolean;
  nhostRegionConfigured: boolean;
  graphqlUrlConfigured: boolean;
  authUrlConfigured: boolean;
  storageUrlConfigured: boolean;
};

export function getPublicDiagnostics(): PublicDiagnostics {
  return {
    nhostSubdomainConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN),
    nhostRegionConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_REGION),
    graphqlUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL),
    authUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_AUTH_URL),
    storageUrlConfigured: Boolean(process.env.NEXT_PUBLIC_NHOST_STORAGE_URL),
  };
}
