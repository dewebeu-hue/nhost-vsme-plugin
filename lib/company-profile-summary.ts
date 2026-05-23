export type CompanySummaryOrganization = {
  name?: string | null;
  id?: string | null;
  industry?: string | null;
  employee_count_range?: string | null;
  headquarters_city?: string | null;
  headquarters_country?: string | null;
  countries_served?: string[] | null;
  logo_file_id?: string | null;
  logo_uploaded_at?: string | null;
  logo_alt_text?: string | null;
};

export type CompanySummaryProfile = {
  legal_name?: string | null;
  website?: string | null;
  industries?: string[] | null;
  employee_count_range?: string | null;
  countries_served?: string[] | null;
};

export type CompanyProfileSummary = {
  organizationName: string | null;
  legalCompanyName: string | null;
  country: string | null;
  city: string | null;
  headquarters: string | null;
  industry: string | null;
  employeeCount: string | null;
  website: string | null;
  reportingYear: string | null;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  countriesServed: string | null;
  keyCertifications: string[];
  logoUrl: string | null;
  logoAltText: string | null;
};

export const companyProfileSummaryQuestionCodes = [
  "company_reporting_year",
  "company_period_start",
  "company_period_end",
  "company_legal_name",
  "company_country",
  "company_city",
  "company_main_activity",
  "employees_total_headcount",
  "cert_iso_9001",
  "cert_iso_14001",
  "cert_iso_45001",
  "cert_iso_50001",
  "cert_esg_rating",
  "cert_industry_specific",
] as const;

type BuildCompanyProfileSummaryInput = {
  organization: CompanySummaryOrganization | null | undefined;
  profile?: CompanySummaryProfile | null;
  answersByCode?: Map<string, unknown>;
};

export function buildCompanyProfileSummary({
  organization,
  profile = null,
  answersByCode = new Map(),
}: BuildCompanyProfileSummaryInput): CompanyProfileSummary {
  const country = firstText(
    readCompanyAnswerText(answersByCode.get("company_country")),
    organization?.headquarters_country,
  );
  const city = firstText(
    readCompanyAnswerText(answersByCode.get("company_city")),
    organization?.headquarters_city,
  );
  const industry = firstText(
    readCompanyAnswerText(answersByCode.get("company_main_activity")),
    organization?.industry,
    profile?.industries?.filter(Boolean).join(", "),
  );
  const employeeCount = firstText(
    readCompanyAnswerText(answersByCode.get("employees_total_headcount")),
    organization?.employee_count_range,
    profile?.employee_count_range,
  );
  const countriesServed = firstText(
    organization?.countries_served?.filter(Boolean).join(", "),
    profile?.countries_served?.filter(Boolean).join(", "),
    country,
  );

  return {
    organizationName: firstText(organization?.name),
    legalCompanyName: firstText(
      readCompanyAnswerText(answersByCode.get("company_legal_name")),
      profile?.legal_name,
      organization?.name,
    ),
    country,
    city,
    headquarters: [city, country].filter(Boolean).join(", ") || null,
    industry,
    employeeCount,
    website: firstText(profile?.website),
    reportingYear: readCompanyAnswerText(answersByCode.get("company_reporting_year")),
    reportingPeriodStart: readCompanyAnswerText(answersByCode.get("company_period_start")),
    reportingPeriodEnd: readCompanyAnswerText(answersByCode.get("company_period_end")),
    countriesServed,
    keyCertifications: createCertificationList(answersByCode),
    logoUrl: organization?.logo_file_id
      ? `/api/organization/logo?organizationId=${encodeURIComponent(
        organization.id ?? "",
      )}&version=${encodeURIComponent(
        organization.logo_uploaded_at ?? organization.name ?? "logo",
      )}`
      : null,
    logoAltText: organization?.logo_alt_text || organization?.name || null,
  };
}

export function readCompanyAnswerText(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return firstText(value.map(readCompanyAnswerText).filter(Boolean).join(", "));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return readCompanyAnswerText(record.label ?? record.value ?? record.name ?? record.title);
  }

  return null;
}

function createCertificationList(answersByCode: Map<string, unknown>) {
  const certifications = [
    ["cert_iso_9001", "ISO 9001"],
    ["cert_iso_14001", "ISO 14001"],
    ["cert_iso_45001", "ISO 45001"],
    ["cert_iso_50001", "ISO 50001"],
  ] as const;
  const booleanCertifications = certifications
    .filter(([code]) => answersByCode.get(code) === true)
    .map(([, label]) => label);
  const rating = readCompanyAnswerText(answersByCode.get("cert_esg_rating"));
  const industrySpecific = readCompanyAnswerText(answersByCode.get("cert_industry_specific"));

  return [...booleanCertifications, rating, industrySpecific].filter(
    (value): value is string => Boolean(value),
  );
}

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";

    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}
