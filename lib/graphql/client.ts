import "server-only";

import { getNhostAdminSecret, getNhostGraphqlUrl } from "@/lib/nhost/config";

export type HasuraGraphqlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

export type HasuraGraphqlOptions = {
  accessToken?: string;
  useAdminSecret?: boolean;
};

export function isHasuraGraphqlConfigured() {
  return Boolean(getNhostGraphqlUrl());
}

export async function executeHasuraGraphql<TData>(
  query: string,
  variables: Record<string, unknown> = {},
  options: HasuraGraphqlOptions = {},
): Promise<TData> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = getNhostAdminSecret();

  if (!graphqlUrl) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  if (!options.accessToken && options.useAdminSecret && !adminSecret) {
    throw new Error("Nhost admin secret is not configured.");
  }

  const authHeaders: Record<string, string> = options.accessToken
    ? { authorization: `Bearer ${options.accessToken}` }
    : options.useAdminSecret
      ? { "x-hasura-admin-secret": adminSecret ?? "" }
      : {};

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Nhost GraphQL request failed.");
  }

  const payload = (await response.json()) as HasuraGraphqlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Nhost GraphQL returned an error.");
  }

  if (!payload.data) {
    throw new Error("Nhost GraphQL returned no data.");
  }

  return payload.data;
}
