import { NextResponse } from "next/server";
import { AuthenticationRequiredError, requireCurrentUser } from "@/lib/auth/session";
import {
  getPrimaryOrganizationForUser,
  isWorkspaceBackendConfigured,
} from "@/lib/data/organizations";

export async function POST(request: Request) {
  if (!isWorkspaceBackendConfigured()) {
    return NextResponse.json({ configured: false, organization: null });
  }

  try {
    const user = await requireCurrentUser(request);
    const organization = await getPrimaryOrganizationForUser(user.id);

    if (!organization) {
      return NextResponse.json({ configured: true, organization: null }, { status: 404 });
    }

    return NextResponse.json({ configured: true, organization });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "A valid authenticated user is required." }, { status: 401 });
    }

    console.error("Unable to load current organization", error);
    return NextResponse.json(
      { error: "We could not load your workspace right now." },
      { status: 500 },
    );
  }
}
