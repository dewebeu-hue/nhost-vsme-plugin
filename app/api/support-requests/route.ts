import { NextResponse } from "next/server";
import { AuthenticationRequiredError } from "@/lib/auth/session";
import { createSupportRequest, SupportRequestValidationError } from "@/lib/support-requests";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const supportRequest = await createSupportRequest(request, payload);

    return NextResponse.json({ ok: true, request: supportRequest });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    if (error instanceof SupportRequestValidationError) {
      return NextResponse.json({ ok: false, error: "Invalid support request." }, { status: 400 });
    }

    console.error("Support request create failed", {
      stage: "support_request_create",
      reason: "support_request_create_failed",
    });

    return NextResponse.json(
      { ok: false, error: "Unable to create support request." },
      { status: 500 },
    );
  }
}
