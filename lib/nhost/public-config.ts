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
    authUrl: process.env.NEXT_PUBLIC_NHOST_AUTH_URL || undefined,
    graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL || undefined,
    storageUrl: process.env.NEXT_PUBLIC_NHOST_STORAGE_URL || undefined,
  };
}

export function isNhostConfigured() {
  return getNhostPublicConfig() !== null;
}
