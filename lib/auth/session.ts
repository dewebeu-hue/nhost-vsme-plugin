import "server-only";

import { getNhostAuthUrl } from "@/lib/nhost/config";
import { getServerNhostClient } from "@/lib/nhost/server";

export type AuthenticatedUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  metadata?: Record<string, unknown> | null;
};

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export async function getCurrentUser(request?: Request) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return verifyNhostAccessToken(bearerToken);
  }

  const nhost = getServerNhostClient();
  const session = nhost?.getUserSession();

  if (!session?.user?.id) {
    return null;
  }

  return normalizeUser(session.user);
}

export async function requireCurrentUser(request?: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new AuthenticationRequiredError();
  }

  return user;
}

export async function getCurrentUserId(request?: Request) {
  return (await getCurrentUser(request))?.id ?? null;
}

export async function isAuthenticated(request?: Request) {
  return (await getCurrentUser(request)) !== null;
}

export async function getAuthTokenForGraphQL(request?: Request) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return bearerToken;
  }

  return getServerNhostClient()?.getUserSession()?.accessToken ?? null;
}

function getBearerToken(request?: Request) {
  const header = request?.headers.get("authorization");

  if (!header?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice("bearer ".length).trim() || null;
}

async function verifyNhostAccessToken(token: string) {
  const authUrl = getNhostAuthUrl();

  if (!authUrl) {
    return null;
  }

  try {
    const response = await fetch(`${authUrl}/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return normalizeUser(await response.json());
  } catch (error) {
    console.error("Unable to verify Nhost session", error);
    return null;
  }
}

function normalizeUser(value: unknown): AuthenticatedUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybeUser = value as {
    id?: unknown;
    email?: unknown;
    displayName?: unknown;
    display_name?: unknown;
    metadata?: unknown;
  };

  if (typeof maybeUser.id !== "string") {
    return null;
  }

  return {
    id: maybeUser.id,
    email: typeof maybeUser.email === "string" ? maybeUser.email : null,
    displayName:
      typeof maybeUser.displayName === "string"
        ? maybeUser.displayName
        : typeof maybeUser.display_name === "string"
          ? maybeUser.display_name
          : null,
    metadata:
      maybeUser.metadata && typeof maybeUser.metadata === "object"
        ? (maybeUser.metadata as Record<string, unknown>)
        : null,
  };
}
