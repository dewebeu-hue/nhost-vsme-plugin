import "server-only";

import { getNhostAdminSecret, getNhostGraphqlUrl } from "@/lib/nhost/config";
import { executeHasuraGraphql } from "@/lib/graphql/client";

export type OrganizationBasics = {
  id: string;
  name: string;
  slug: string;
  is_verified: boolean;
  vat_id?: string | null;
  industry?: string | null;
  employee_count_range?: string | null;
  headquarters_city?: string | null;
  headquarters_country?: string | null;
  countries_served?: string[] | null;
  plan_key?: string;
  billing_interval?: string;
  subscription_status?: string;
};

export type CreateOrganizationWithOwnerInput = {
  userId: string;
  companyLegalName: string;
  companyName?: string;
  vatId?: string;
  industry?: string;
  employeeCountRange?: string;
  headquartersCity?: string;
  headquartersCountry?: string;
  website?: string;
};

export type WorkspaceInput = Omit<CreateOrganizationWithOwnerInput, "companyLegalName"> & {
  companyLegalName?: string;
  legalName?: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type CreateWorkspaceResponse = {
  insert_organizations_one: OrganizationBasics | null;
  insert_organization_members_one: { id: string } | null;
  insert_company_profiles_one: { id: string } | null;
};

type CurrentOrganizationResponse = {
  organizations: OrganizationBasics[];
};

type CurrentOrganizationMembershipResponse = {
  organization_members: Array<{
    organization_id: string;
    organization: OrganizationBasics | null;
  }>;
};

type OrganizationBySlugResponse = {
  organizations: Array<{
    id: string;
  }>;
};

const createWorkspaceMutation = `
  mutation CreateSupplierWorkspace(
    $organization: organizations_insert_input!
    $member: organization_members_insert_input!
    $profile: company_profiles_insert_input!
  ) {
    insert_organizations_one(object: $organization) {
      id
      name
      slug
      is_verified
    }
    insert_organization_members_one(object: $member) {
      id
    }
    insert_company_profiles_one(object: $profile) {
      id
    }
  }
`;

const currentOrganizationsQuery = `
  query CurrentOrganizations($userId: uuid!) {
    organizations(
      where: { organization_members: { user_id: { _eq: $userId } } }
      order_by: { created_at: asc }
    ) {
      id
      name
      slug
      is_verified
    }
  }
`;

const primaryOrganizationQuery = `
  query PrimaryOrganization($userId: uuid!) {
    organizations(
      where: { organization_members: { user_id: { _eq: $userId } } }
      order_by: { created_at: asc }
      limit: 1
    ) {
      id
      name
      slug
      is_verified
    }
  }
`;

const primaryOrganizationByMembershipAdminQuery = `
  query PrimaryOrganizationByMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: asc }
      limit: 1
    ) {
      organization_id
      organization {
        id
        name
        slug
        vat_id
        industry
        employee_count_range
        headquarters_city
        headquarters_country
        countries_served
        is_verified
        plan_key
        billing_interval
        subscription_status
        created_at
        updated_at
      }
    }
  }
`;

type OrganizationByIdResponse = {
  organizations_by_pk: OrganizationBasics | null;
};

const organizationByIdAdminQuery = `
  query OrganizationById($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
      slug
      vat_id
      industry
      employee_count_range
      headquarters_city
      headquarters_country
      countries_served
      is_verified
      plan_key
      billing_interval
      subscription_status
      created_at
      updated_at
    }
  }
`;

const organizationBySlugQuery = `
  query OrganizationBySlug($slug: String!) {
    organizations(where: { slug: { _eq: $slug } }, limit: 1) {
      id
    }
  }
`;

export function isWorkspaceBackendConfigured() {
  return Boolean(getNhostGraphqlUrl() && getNhostAdminSecret());
}

export async function createOrganizationWithOwner(input: CreateOrganizationWithOwnerInput) {
  const organizationId = crypto.randomUUID();
  const legalName = input.companyLegalName.trim();
  const tradeName = input.companyName?.trim() || legalName;
  const slug = await createUniqueSlug(legalName);
  const organization: Record<string, unknown> = {
    id: organizationId,
    name: legalName,
    slug,
    vat_id: input.vatId || null,
    industry: input.industry || null,
    employee_count_range: input.employeeCountRange || null,
    headquarters_city: input.headquartersCity || null,
    headquarters_country: input.headquartersCountry || null,
    countries_served: input.headquartersCountry ? [input.headquartersCountry] : [],
    is_verified: false,
    plan_key: "starter",
    billing_interval: "monthly",
    subscription_status: "trialing",
  };

  const member = {
    organization_id: organizationId,
    user_id: input.userId,
    role: "owner",
  };

  const profile = {
    organization_id: organizationId,
    legal_name: legalName,
    trade_name: tradeName,
    vat_id: input.vatId || null,
    website: input.website || null,
    industries: input.industry ? [input.industry] : [],
    employee_count_range: input.employeeCountRange || null,
    countries_served: input.headquartersCountry ? [input.headquartersCountry] : [],
  };

  const data = await executeAdminGraphql<CreateWorkspaceResponse>(createWorkspaceMutation, {
    organization,
    member,
    profile,
  });

  if (!data.insert_organizations_one) {
    throw new Error("Workspace could not be created.");
  }

  if (!data.insert_organization_members_one) {
    throw new Error("Organization member owner record could not be created.");
  }

  if (!data.insert_company_profiles_one) {
    throw new Error("Company profile could not be created.");
  }

  return data.insert_organizations_one;
}

export async function createSupplierWorkspace(input: WorkspaceInput) {
  return createOrganizationWithOwner({
    ...input,
    companyLegalName: input.companyLegalName ?? input.legalName ?? "",
  });
}

export async function getCurrentUserOrganizations(userId: string, accessToken?: string) {
  const data = await executeOrganizationGraphql<CurrentOrganizationResponse>(
    currentOrganizationsQuery,
    { userId },
    accessToken,
  );

  return data.organizations;
}

export async function getPrimaryOrganizationForUser(userId: string, accessToken?: string) {
  const data = await executeOrganizationGraphql<CurrentOrganizationResponse>(
    primaryOrganizationQuery,
    { userId },
    accessToken,
  );

  return data.organizations[0] ?? null;
}

export async function getPrimaryOrganizationForUserWithAdmin(userId: string) {
  const data = await executeAdminGraphql<CurrentOrganizationMembershipResponse>(
    primaryOrganizationByMembershipAdminQuery,
    { userId },
  );

  const membership = data.organization_members[0];

  if (!membership) {
    return null;
  }

  if (membership.organization) {
    return membership.organization;
  }

  const organizationData = await executeAdminGraphql<OrganizationByIdResponse>(
    organizationByIdAdminQuery,
    { organizationId: membership.organization_id },
  );

  if (!organizationData.organizations_by_pk) {
    throw new Error("organization_not_found");
  }

  return organizationData.organizations_by_pk;
}

export async function getCurrentOrganizationForUser(userId: string, accessToken?: string) {
  return getPrimaryOrganizationForUser(userId, accessToken);
}

async function executeOrganizationGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string,
): Promise<TData> {
  if (accessToken) {
    return executeHasuraGraphql<TData>(query, variables, { accessToken });
  }

  return executeAdminGraphql<TData>(query, variables);
}

async function executeAdminGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const graphqlUrl = getNhostGraphqlUrl();
  const adminSecret = getNhostAdminSecret();

  if (!graphqlUrl || !adminSecret) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Nhost GraphQL request failed.");
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Nhost GraphQL returned an error.");
  }

  if (!payload.data) {
    throw new Error("Nhost GraphQL returned no data.");
  }

  return payload.data;
}

async function createUniqueSlug(value: string) {
  const base = createSlugBase(value);

  if (!(await slugExists(base))) {
    return base;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function slugExists(slug: string) {
  const data = await executeAdminGraphql<OrganizationBySlugResponse>(organizationBySlugQuery, {
    slug,
  });

  return data.organizations.length > 0;
}

function createSlugBase(value: string) {
  return (
    value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)+/g, "") || "organization"
  );
}
