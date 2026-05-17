import { NextResponse } from "next/server";
import {
  recordShareLinkAccess,
  verifyShareLinkPassword,
} from "@/lib/data/share-links";

type VerifyPasswordContext = {
  params: Promise<{
    token: string;
  }>;
};

type VerifyPasswordPayload = {
  password?: unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request, context: VerifyPasswordContext) {
  const { token } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as VerifyPasswordPayload;
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!password) {
    return NextResponse.json(
      { error: "incorrect_password" },
      { status: 400 },
    );
  }

  try {
    const result = await verifyShareLinkPassword(token, password);

    if (!result.ok) {
      const status = result.reason === "inactive" || result.reason === "expired" ? 403 : 401;

      return NextResponse.json({ error: result.reason }, { status });
    }

    await recordShareLinkAccess({
      shareLinkId: result.shareLink.id,
      ipAddress: readForwardedIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(result.cookieName, result.cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: result.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Unable to verify share link password", error);
    return NextResponse.json(
      { error: "verification_failed" },
      { status: 500 },
    );
  }
}

function readForwardedIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}
