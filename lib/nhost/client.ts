"use client";

import { createClient } from "@nhost/nhost-js";
import type { NhostClient } from "@nhost/nhost-js";
import { getPublicDiagnostics } from "@/lib/diagnostics/public-env";
import {
  getNhostPublicConfig,
  getSafeUrlHost,
  isAuthEndpointUrl,
  isStorageEndpointUrl,
} from "@/lib/nhost/public-config";

let browserClient: NhostClient | null = null;

export function getBrowserNhostClient() {
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  if (!browserClient) {
    logBrowserNhostConfig(config);

    browserClient = createClient({
      subdomain: config.subdomain,
      region: config.region,
    });
  }

  return browserClient;
}

function logBrowserNhostConfig(config: NonNullable<ReturnType<typeof getNhostPublicConfig>>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const authUrl = process.env.NEXT_PUBLIC_NHOST_AUTH_URL;
  const storageUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;

  console.info("[nhost-config]", {
    ...getPublicDiagnostics(),
    authHost: getSafeUrlHost(config.authUrl),
    storageHost: getSafeUrlHost(config.storageUrl),
    graphqlHost: getSafeUrlHost(config.graphqlUrl),
  });

  if (authUrl && !isAuthEndpointUrl(authUrl)) {
    console.warn("Nhost auth URL appears to point to a non-auth endpoint.");
  }

  if (authUrl?.includes(".storage.")) {
    console.warn("Nhost auth URL appears to point to storage endpoint.");
  }

  if (storageUrl && !isStorageEndpointUrl(storageUrl)) {
    console.warn("Nhost storage URL appears to point to a non-storage endpoint.");
  }

  if (storageUrl?.includes(".auth.")) {
    console.warn("Nhost storage URL appears to point to auth endpoint.");
  }
}
