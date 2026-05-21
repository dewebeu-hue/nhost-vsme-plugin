import "server-only";

import {
  buildCompanyProfileSummary,
  companyProfileSummaryQuestionCodes,
  type CompanySummaryOrganization,
} from "@/lib/company-profile-summary";
import { getNhostAdminSecret, getNhostGraphqlUrl } from "@/lib/nhost/config";

export type CompanyProfileBasics = {
  id: string;
  organization_id: string;
  legal_name: string | null;
  trade_name: string | null;
  website: string | null;
  industries: string[] | null;
  employee_count_range?: string | null;
  countries_served?: string[] | null;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type CompanyProfileResponse = {
  company_profiles: CompanyProfileBasics[];
  question_answers: CompanyProfileQuestionAnswerRecord[];
};

type GraphqlJson =
  | string
  | number
  | boolean
  | null
  | GraphqlJson[]
  | { [key: string]: GraphqlJson };

type CompanyProfileQuestionAnswerRecord = {
  value: GraphqlJson;
  question_item: {
    code: string;
  } | null;
};

const companyProfileQuery = `
  query CompanyProfile($organizationId: uuid!, $questionCodes: [String!]!) {
    company_profiles(where: { organization_id: { _eq: $organizationId } }, limit: 1) {
      id
      organization_id
      legal_name
      trade_name
      website
      industries
      employee_count_range
      countries_served
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

export async function getCompanyProfileForOrganization(
  organizationId: string,
  organization?: CompanySummaryOrganization | null,
) {
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
      variables: { organizationId, questionCodes: companyProfileSummaryQuestionCodes },
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
    summary: buildCompanyProfileSummary({
      organization: organization ?? null,
      profile: data.company_profiles[0] ?? null,
      answersByCode: mapQuestionnaireAnswersByCode(data.question_answers),
    }),
  };
}

function mapQuestionnaireAnswersByCode(answers: CompanyProfileQuestionAnswerRecord[]) {
  const answersByCode = new Map<string, unknown>();

  for (const answer of answers) {
    const code = answer.question_item?.code;

    if (!code || answersByCode.has(code)) {
      continue;
    }

    if (answer.value !== null && answer.value !== undefined) {
      answersByCode.set(code, answer.value);
    }
  }

  return answersByCode;
}
