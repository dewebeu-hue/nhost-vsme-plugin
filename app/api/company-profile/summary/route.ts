import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCompanyProfileForOrganization } from "@/lib/data/company-profile";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getNhostGraphqlUrl()) {
    return NextResponse.json({ summary: null, source: "unavailable" }, { status: 503 });
  }

  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ summary: null, error: "authentication_required" }, { status: 401 });
  }

  const organization = await getPrimaryOrganizationForUserWithAdmin(user.id);

  if (!organization) {
    return NextResponse.json({ summary: null, error: "organization_not_found" }, { status: 404 });
  }

  try {
    const companyProfile = await getCompanyProfileForOrganization(organization.id, organization);
    const summary = companyProfile?.summary ?? null;

    if (process.env.NODE_ENV !== "production") {
      console.info("[company-profile-summary]", {
        companyProfileSummaryLoaded: Boolean(summary),
        hasIndustry: Boolean(summary?.industry),
        hasCountry: Boolean(summary?.country),
        hasHeadquarters: Boolean(summary?.headquarters),
        hasEmployeeCount: Boolean(summary?.employeeCount),
      });
    }

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: null, source: "unavailable" }, { status: 502 });
  }
}
