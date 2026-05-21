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

export type CompanyQuestionnaireProfile = {
  legalName: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  industry: string | null;
  employeeCount: string | null;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type CompanyProfileResponse = {
  company_profiles: CompanyProfileBasics[];
  question_answers: CompanyProfileAnswerRecord[];
};

type GraphqlJson =
  | string
  | number
  | boolean
  | null
  | GraphqlJson[]
  | { [key: string]: GraphqlJson };

type CompanyProfileAnswerRecord = {
  value: GraphqlJson;
  question_item?: {
    code: string;
  } | null;
};

const companyProfileQuestionCodes = [
  "company_legal_name",
  "company_country",
  "company_city",
  "company_main_activity",
  "employees_total_headcount",
] as const;

const companyProfileQuery = `
  query CompanyProfile($organizationId: uuid!, $questionCodes: [String!]!) {
    company_profiles(where: { organization_id: { _eq: $organizationId } }, limit: 1) {
      id
      organization_id
      legal_name
      trade_name
      website
      industries
    }
    question_answers(
      where: {
        organization_id: { _eq: $organizationId }
        question_item: { code: { _in: $questionCodes } }
      }
      order_by: { updated_at: desc }
    ) {
      value
      question_item {
        code
      }
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
      variables: { organizationId, questionCodes: companyProfileQuestionCodes },
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

  const data = payload.data;

  if (!data) {
    return null;
  }

  return {
    profile: data.company_profiles[0] ?? null,
    questionnaire: mapQuestionnaireProfile(data.question_answers),
  };
}

function mapQuestionnaireProfile(
  answers: CompanyProfileAnswerRecord[],
): CompanyQuestionnaireProfile {
  const answersByCode = new Map<string, string>();

  for (const answer of answers) {
    const code = answer.question_item?.code;

    if (!code || answersByCode.has(code)) {
      continue;
    }

    const value = formatCompanyProfileAnswer(answer.value);

    if (value) {
      answersByCode.set(code, value);
    }
  }

  return {
    legalName: answersByCode.get("company_legal_name") ?? null,
    locationCity: answersByCode.get("company_city") ?? null,
    locationCountry: answersByCode.get("company_country") ?? null,
    industry: answersByCode.get("company_main_activity") ?? null,
    employeeCount: answersByCode.get("employees_total_headcount") ?? null,
  };
}

function formatCompanyProfileAnswer(value: GraphqlJson): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map(formatCompanyProfileAnswer)
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, GraphqlJson>;
    const displayValue = record.label ?? record.value ?? record.name ?? record.title;

    return formatCompanyProfileAnswer(displayValue ?? null);
  }

  return "";
}
