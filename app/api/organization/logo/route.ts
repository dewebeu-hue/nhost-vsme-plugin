import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  requireCurrentUser,
} from "@/lib/auth/session";
import { logSafeDiagnostic } from "@/lib/diagnostics/server-env";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import {
  clearOrganizationLogoMetadata,
  createOrganizationLogoDisplayUrl,
  getOrganizationLogoFile,
  getOrganizationLogoMetadata,
  isAllowedOrganizationLogoMimeType,
  organizationLogoMaxBytes,
  updateOrganizationLogoMetadata,
  uploadOrganizationLogoFile,
} from "@/lib/data/organization-logo";

export const runtime = "nodejs";

type MembershipRecord = {
  organization_id: string;
  role: string;
};

type OrganizationMembershipResponse = {
  organization_members: MembershipRecord[];
};

const writableRoles = new Set(["owner", "editor", "admin"]);

const getMembershipQuery = `
  query GetOrganizationLogoMembership($userId: uuid!) {
    organization_members(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: asc }
      limit: 1
    ) {
      organization_id
      role
    }
  }
`;

export async function GET(request: Request) {
  try {
    const publicOrganizationId = new URL(request.url).searchParams.get("organizationId")?.trim();
    const organizationId = publicOrganizationId || (await resolveMembership(request)).organization_id;
    const logo = await getOrganizationLogoMetadata(organizationId);

    if (!logo?.logo_file_id) {
      return NextResponse.json({ error: "Logo not found." }, { status: 404 });
    }

    const file = await getOrganizationLogoFile(logo.logo_file_id);
    const headers = new Headers();
    const contentType =
      file.headers.get("content-type") ||
      logo.logo_content_type ||
      "application/octet-stream";
    const contentLength = file.headers.get("content-length");

    headers.set("content-type", contentType);
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new Response(file.body.stream(), {
      status: file.status,
      headers,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to view this logo." }, { status: 401 });
    }

    logSafeDiagnostic("organization_logo_get_failed", {
      category: "organization_logo_unavailable",
    });

    return NextResponse.json({ error: "Logo is not available." }, { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    const membership = await resolveMembership(request);

    if (!writableRoles.has(membership.role)) {
      return NextResponse.json({ error: "You cannot update this organization logo." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo");
    const altText = readOptionalText(formData.get("altText"), 160);

    if (!(file instanceof File) || file.size === 0) {
      return logoError("logo_missing", "validation", 400);
    }

    if (file.size > organizationLogoMaxBytes) {
      return logoError("logo_too_large", "validation", 400);
    }

    if (!isAllowedOrganizationLogoMimeType(file.type)) {
      return logoError("logo_type_not_allowed", "validation", 400);
    }

    const uploadedFile = await uploadOrganizationLogoFile({
      altText,
      file,
      organizationId: membership.organization_id,
    });
    const metadata = await updateOrganizationLogoMetadata({
      altText,
      contentType: uploadedFile.mimeType || file.type,
      fileId: uploadedFile.id,
      organizationId: membership.organization_id,
    });

    return NextResponse.json({
      logo: {
        url: createOrganizationLogoDisplayUrl(membership.organization_id, metadata.logo_uploaded_at),
        uploadedAt: metadata.logo_uploaded_at,
        altText: metadata.logo_alt_text,
        contentType: metadata.logo_content_type,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to upload a logo." }, { status: 401 });
    }

    console.error("Organization logo upload failed", {
      stage: "organization_logo_upload",
      reason: "logo_upload_failed",
      message: error instanceof Error ? error.message : "unknown",
    });

    return logoError("logo_upload_failed", "upload", 502);
  }
}

export async function DELETE(request: Request) {
  try {
    const membership = await resolveMembership(request);

    if (!writableRoles.has(membership.role)) {
      return NextResponse.json({ error: "You cannot update this organization logo." }, { status: 403 });
    }

    await clearOrganizationLogoMetadata(membership.organization_id);

    return NextResponse.json({ logo: null });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in to remove a logo." }, { status: 401 });
    }

    return logoError("logo_remove_failed", "metadata_update", 502);
  }
}

async function resolveMembership(request: Request) {
  const user = await requireCurrentUser(request);
  const data = await executeHasuraGraphql<OrganizationMembershipResponse>(
    getMembershipQuery,
    { userId: user.id },
    { useAdminSecret: true },
  );
  const membership = data.organization_members[0];

  if (!membership) {
    throw new Error("organization_membership_not_found");
  }

  return membership;
}

function readOptionalText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function logoError(category: string, stage: string, status: number) {
  logSafeDiagnostic("organization_logo_failed", {
    category,
    stage,
  });

  return NextResponse.json(
    {
      error: "We could not update the company logo right now.",
      category,
      stage,
    },
    { status },
  );
}
