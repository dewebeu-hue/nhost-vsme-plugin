import { NextResponse } from "next/server";
import { AdminUnauthorizedError } from "@/lib/admin-workspace";
import { SupportRequestValidationError, updateAdminSupportRequest } from "@/lib/support-requests";

export const dynamic = "force-dynamic";

type AdminSupportRequestRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: AdminSupportRequestRouteContext) {
  const { id } = await context.params;

  try {
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const supportRequest = await updateAdminSupportRequest(request, id, payload);

    if (!supportRequest) {
      return NextResponse.json({ ok: false, error: "Support request not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, request: supportRequest });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    if (error instanceof SupportRequestValidationError) {
      return NextResponse.json({ ok: false, error: "Invalid support request update." }, { status: 400 });
    }

    console.error("Admin support request update failed", {
      stage: "admin_support_request_update",
      reason: "admin_support_request_update_failed",
    });

    return NextResponse.json(
      { ok: false, error: "Unable to update support request." },
      { status: 500 },
    );
  }
}
