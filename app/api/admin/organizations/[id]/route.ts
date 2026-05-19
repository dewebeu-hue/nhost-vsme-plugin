import { NextResponse } from "next/server";
import { AdminUnauthorizedError, getAdminOrganizationDetail } from "@/lib/admin-workspace";

export const dynamic = "force-dynamic";

type AdminOrganizationDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: AdminOrganizationDetailRouteProps) {
  const { id } = await params;

  try {
    const organization = await getAdminOrganizationDetail(request, id);

    if (!organization) {
      return NextResponse.json({ ok: false, error: "Organization not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("Admin organization detail API failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false, error: "Unable to load admin organization." }, { status: 500 });
  }
}
