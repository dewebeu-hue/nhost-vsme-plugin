import "server-only";

import { getNhostAdminSecret, getNhostGraphqlUrl } from "@/lib/nhost/config";

export type CompanyProfileBasics = {
  id: string;
  organization_id: string;
  legal_name: string | null;
  trade_name: string | null;
  website: string | null;
  industries: string[] | null;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type CompanyProfileResponse = {
  company_profiles: CompanyProfileBasics[];
};

const companyProfileQuery = `
  query CompanyProfile($organizationId: uuid!) {
    company_profiles(where: { organization_id: { _eq: $organizationId } }, limit: 1) {
      id
      organization_id
      legal_name
      trade_name
      website
      industries
    }
  }
`;

export async function getCompanyProfileForOrganization(organizationId: string) {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = getNhostAdminSecret();

  if (!graphqlUrl || !adminSecret) {
    return null;
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({
      query: companyProfileQuery,
      variables: { organizationId },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Company profile request failed.");
  }

  const payload = (await response.json()) as GraphqlResponse<CompanyProfileResponse>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Company profile request failed.");
  }

  return payload.data?.company_profiles[0] ?? null;
}
