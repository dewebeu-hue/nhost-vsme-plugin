import { NextResponse } from "next/server";
import { AdminUnauthorizedError } from "@/lib/admin-workspace";
import { getAdminSupportRequests } from "@/lib/support-requests";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requests = await getAdminSupportRequests(request);

    return NextResponse.json({ ok: true, requests });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin support requests API failed", {
      stage: "admin_support_requests",
      reason: "admin_support_requests_failed",
    });

    return NextResponse.json(
      { ok: false, error: "Unable to load support requests." },
      { status: 500 },
    );
  }
}
