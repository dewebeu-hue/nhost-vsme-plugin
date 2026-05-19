import { NextResponse } from "next/server";
import { AdminUnauthorizedError, getAdminOrganizations } from "@/lib/admin-workspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const organizations = await getAdminOrganizations(request);
    return NextResponse.json({ ok: true, organizations });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin organizations API failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false, error: "Unable to load admin organizations." }, { status: 500 });
  }
}
