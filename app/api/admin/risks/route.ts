import { NextResponse } from "next/server";
import { AdminUnauthorizedError, getAdminRisks } from "@/lib/admin-workspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const risks = await getAdminRisks(request);
    return NextResponse.json({ ok: true, ...risks });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin risks API failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false, error: "Unable to load admin risks." }, { status: 500 });
  }
}
