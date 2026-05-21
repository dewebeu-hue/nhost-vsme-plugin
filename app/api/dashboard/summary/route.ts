import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSetupSummaryForOrganization } from "@/lib/data/dashboard";
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
    const summary = await getDashboardSetupSummaryForOrganization(organization);

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: null, source: "unavailable" }, { status: 502 });
  }
}
