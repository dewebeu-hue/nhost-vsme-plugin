"use client";

import { createClient, withClientSideSessionMiddleware } from "@nhost/nhost-js";
import type { NhostClient } from "@nhost/nhost-js";
import { getNhostPublicConfig } from "@/lib/nhost/public-config";

let browserClient: NhostClient | null = null;

export function getBrowserNhostClient() {
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  browserClient ??= createClient({
    ...config,
    configure: [withClientSideSessionMiddleware],
  });

  return browserClient;
}
