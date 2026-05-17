import "server-only";

import { createServerClient, withServerSideSessionMiddleware } from "@nhost/nhost-js";
import type { NhostClient } from "@nhost/nhost-js";
import { getNhostPublicConfig } from "@/lib/nhost/public-config";

export function getServerNhostClient(): NhostClient | null {
  const config = getNhostPublicConfig();

  if (!config) {
    return null;
  }

  return createServerClient({
    ...config,
    storage: {
      get: () => null,
      set: () => undefined,
      remove: () => undefined,
    },
    configure: [withServerSideSessionMiddleware],
  });
}
