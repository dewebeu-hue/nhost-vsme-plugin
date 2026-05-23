import { type NextRequest, NextResponse } from "next/server";
import {
  getShareLinkByToken,
  getShareVerificationCookieName,
  isValidShareVerificationCookie,
} from "@/lib/data/share-links";
import {
  getOrganizationLogoFile,
  getOrganizationLogoMetadata,
} from "@/lib/data/organization-logo";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ error: "Logo is not available." }, { status: 404 });
  }

  try {
    const shareLink = await getShareLinkByToken(token);

    if (!shareLink || !shareLink.is_active) {
      return NextResponse.json({ error: "Logo is not available." }, { status: 404 });
    }

    if (shareLink.expires_at && new Date(shareLink.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Logo is not available." }, { status: 403 });
    }

    if (shareLink.password_hash) {
      const verificationCookieValue = request.cookies.get(getShareVerificationCookieName(token))?.value;

      if (!isValidShareVerificationCookie(token, shareLink, verificationCookieValue)) {
        return NextResponse.json({ error: "Logo is not available." }, { status: 403 });
      }
    }

    const logo = await getOrganizationLogoMetadata(shareLink.organization_id);

    if (!logo?.logo_file_id) {
      return NextResponse.json({ error: "Logo is not available." }, { status: 404 });
    }

    const file = await getOrganizationLogoFile(logo.logo_file_id);
    const headers = new Headers();
    const contentType =
      file.headers.get("content-type") ||
      logo.logo_content_type ||
      "application/octet-stream";
    const contentLength = file.headers.get("content-length");

    headers.set("content-type", contentType);
    headers.set("cache-control", "public, max-age=300, stale-while-revalidate=86400");
    headers.set("x-content-type-options", "nosniff");

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new Response(file.body.stream(), {
      status: file.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Logo is not available." }, { status: 404 });
  }
}
