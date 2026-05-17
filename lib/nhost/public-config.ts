export type NhostPublicConfig = {
  subdomain: string;
  region: string;
};

export function getNhostPublicConfig(): NhostPublicConfig | null {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;

  if (!subdomain || !region) {
    return null;
  }

  return { subdomain, region };
}

export function isNhostConfigured() {
  return getNhostPublicConfig() !== null;
}
