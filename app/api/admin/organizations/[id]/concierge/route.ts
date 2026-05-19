import { NextResponse } from "next/server";
import {
  AdminUnauthorizedError,
  getAdminOrganizationDetail,
  updateAdminConciergeNote,
} from "@/lib/admin-workspace";

export const dynamic = "force-dynamic";

type AdminConciergeRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: AdminConciergeRouteProps) {
  const { id } = await params;

  try {
    const organization = await getAdminOrganizationDetail(request, id);

    if (!organization) {
      return NextResponse.json({ ok: false, error: "Organization not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, concierge: organization.concierge });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin concierge status API failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false, error: "Unable to load concierge status." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: AdminConciergeRouteProps) {
  const { id } = await params;

  try {
    const input = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const concierge = await updateAdminConciergeNote(request, id, input);

    if (!concierge) {
      return NextResponse.json({ ok: false, error: "Organization not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, concierge });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin concierge status update failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false, error: "Unable to save concierge status." }, { status: 500 });
  }
}
