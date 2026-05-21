import { redirect } from "next/navigation";
import { CompanyProfileClient } from "@/components/company-profile/company-profile-client";
import { getCurrentUser } from "@/lib/auth/session";
import { getCompanyProfileForOrganization } from "@/lib/data/company-profile";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import {
  defaultCompanyProfileLabels,
  type CompanyProfileLabels,
} from "@/lib/operational-labels";

export const dynamic = "force-dynamic";

type CompanyProfilePageContentProps = {
  labels?: CompanyProfileLabels;
  localePrefix?: string;
};

export async function CompanyProfilePageContent({
  labels = defaultCompanyProfileLabels,
  localePrefix = "/en",
}: CompanyProfilePageContentProps) {
  const user = await getCurrentUser();
  const organization = user
    ? await getPrimaryOrganizationForUserWithAdmin(user.id).catch(() => null)
    : null;
  let loadFailed = false;
  const companyProfile = organization
    ? await getCompanyProfileForOrganization(organization.id, organization).catch(() => {
      loadFailed = true;
      return null;
    })
    : null;

  if (process.env.NODE_ENV !== "production") {
    const summary = companyProfile?.summary ?? null;
    console.info("[company-profile-page]", {
      companyProfileSummaryLoaded: Boolean(summary),
      hasIndustry: Boolean(summary?.industry),
      hasCountry: Boolean(summary?.country),
      hasHeadquarters: Boolean(summary?.headquarters),
      hasEmployeeCount: Boolean(summary?.employeeCount),
    });
  }

  return (
    <CompanyProfileClient
      initialSummary={companyProfile?.summary ?? null}
      initialLoadFailed={loadFailed}
      labels={labels}
      localePrefix={localePrefix}
    />
  );
}

export default function CompanyProfilePage() {
  redirect("/en/dashboard/company-profile");
}
