type CurrentOrganizationPayload = {
  configured?: boolean;
  organization?: {
    id?: string;
    name?: string;
    slug?: string;
    plan_key?: string;
    is_verified?: boolean;
  } | null;
  error?: string;
  category?: string;
};

type CurrentOrganizationResult = {
  ok: boolean;
  status: number;
  payload: CurrentOrganizationPayload;
};

let cachedRequest:
  | {
      accessToken: string;
      promise: Promise<CurrentOrganizationResult>;
    }
  | null = null;

export function clearCurrentOrganizationCache() {
  cachedRequest = null;
}

export function fetchCurrentOrganizationCached(accessToken: string, force = false) {
  if (!force && cachedRequest?.accessToken === accessToken) {
    return cachedRequest.promise;
  }

  const promise = fetch("/api/organizations/current", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  }).then(async (response) => ({
    ok: response.ok,
    status: response.status,
    payload: (await response.json()) as CurrentOrganizationPayload,
  }));

  cachedRequest = { accessToken, promise };
  return promise;
}
