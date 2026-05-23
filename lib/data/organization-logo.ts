import "server-only";

import { createAPIClient } from "@nhost/nhost-js/storage";
import type { FileMetadata } from "@nhost/nhost-js/storage";
import { deflateSync, inflateSync } from "node:zlib";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostAdminSecret, getNhostStorageUrl } from "@/lib/nhost/config";
import type { PdfLogoImage } from "@/lib/pdf/simple-pdf";

export const organizationLogoMaxBytes = 2 * 1024 * 1024;
export const organizationLogoMimeTypes = ["image/png", "image/jpeg", "image/webp"] as const;

export type OrganizationLogoMimeType = (typeof organizationLogoMimeTypes)[number];

export type OrganizationLogoMetadata = {
  logo_file_id?: string | null;
  logo_content_type?: string | null;
  logo_uploaded_at?: string | null;
  logo_alt_text?: string | null;
};

type OrganizationLogoResponse = {
  organizations_by_pk: (OrganizationLogoMetadata & { id: string; name: string }) | null;
};

type UpdateOrganizationLogoResponse = {
  update_organizations_by_pk: (OrganizationLogoMetadata & { id: string; name: string }) | null;
};

const getOrganizationLogoQuery = `
  query GetOrganizationLogo($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
      logo_file_id
      logo_content_type
      logo_uploaded_at
      logo_alt_text
    }
  }
`;

const updateOrganizationLogoMutation = `
  mutation UpdateOrganizationLogo($organizationId: uuid!, $set: organizations_set_input!) {
    update_organizations_by_pk(pk_columns: { id: $organizationId }, _set: $set) {
      id
      name
      logo_file_id
      logo_content_type
      logo_uploaded_at
      logo_alt_text
    }
  }
`;

export function isAllowedOrganizationLogoMimeType(value: string): value is OrganizationLogoMimeType {
  return organizationLogoMimeTypes.includes(value as OrganizationLogoMimeType);
}

export function createOrganizationLogoDisplayUrl(organizationId: string, uploadedAt?: string | null) {
  const params = new URLSearchParams({ organizationId });

  if (uploadedAt) {
    params.set("version", uploadedAt);
  }

  return `/api/organization/logo?${params.toString()}`;
}

export function createPublicOrganizationLogoDisplayUrl(token: string, uploadedAt?: string | null) {
  const params = new URLSearchParams({ token });

  if (uploadedAt) {
    params.set("version", uploadedAt);
  }

  return `/api/passport/logo?${params.toString()}`;
}

export async function getOrganizationLogoMetadata(organizationId: string) {
  const data = await executeHasuraGraphql<OrganizationLogoResponse>(
    getOrganizationLogoQuery,
    { organizationId },
    { useAdminSecret: true },
  );

  return data.organizations_by_pk;
}

export async function updateOrganizationLogoMetadata({
  altText,
  contentType,
  fileId,
  organizationId,
}: {
  altText?: string | null;
  contentType: string;
  fileId: string;
  organizationId: string;
}) {
  const uploadedAt = new Date().toISOString();
  const data = await executeHasuraGraphql<UpdateOrganizationLogoResponse>(
    updateOrganizationLogoMutation,
    {
      organizationId,
      set: {
        logo_file_id: fileId,
        logo_content_type: contentType,
        logo_uploaded_at: uploadedAt,
        logo_alt_text: altText || null,
      },
    },
    { useAdminSecret: true },
  );

  if (!data.update_organizations_by_pk) {
    throw new Error("Organization logo metadata could not be updated.");
  }

  return data.update_organizations_by_pk;
}

export async function clearOrganizationLogoMetadata(organizationId: string) {
  const data = await executeHasuraGraphql<UpdateOrganizationLogoResponse>(
    updateOrganizationLogoMutation,
    {
      organizationId,
      set: {
        logo_file_id: null,
        logo_content_type: null,
        logo_uploaded_at: null,
        logo_alt_text: null,
      },
    },
    { useAdminSecret: true },
  );

  if (!data.update_organizations_by_pk) {
    throw new Error("Organization logo metadata could not be cleared.");
  }

  return data.update_organizations_by_pk;
}

export async function uploadOrganizationLogoFile({
  altText,
  file,
  organizationId,
}: {
  altText?: string | null;
  file: File;
  organizationId: string;
}): Promise<FileMetadata> {
  const storageUrl = getNhostStorageUrl();
  const adminSecret = getNhostAdminSecret();

  if (!storageUrl || !adminSecret) {
    throw new Error("Nhost Storage is not configured.");
  }

  const storage = createAPIClient(storageUrl);
  const response = await storage.uploadFiles(
    {
      "file[]": [file],
      "metadata[]": [
        {
          name: file.name,
          metadata: {
            organizationId,
            assetType: "organization_logo",
            altText: altText || undefined,
          },
        },
      ],
    },
    {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    },
  );
  const uploadedFile = response.body.processedFiles[0];

  if (!uploadedFile?.id) {
    throw new Error("Nhost Storage did not return a logo file identifier.");
  }

  return uploadedFile;
}

export async function getOrganizationLogoFile(fileId: string) {
  const storageUrl = getNhostStorageUrl();
  const adminSecret = getNhostAdminSecret();

  if (!storageUrl || !adminSecret) {
    throw new Error("Nhost Storage is not configured.");
  }

  const storage = createAPIClient(storageUrl);

  return storage.getFile(fileId, undefined, {
    headers: {
      "x-hasura-admin-secret": adminSecret,
    },
  });
}

export async function getOrganizationLogoPdfImage(
  logo: OrganizationLogoMetadata | null | undefined,
): Promise<PdfLogoImage | null> {
  if (!logo?.logo_file_id) {
    return null;
  }

  try {
    const file = await getOrganizationLogoFile(logo.logo_file_id);
    const contentType = file.headers.get("content-type") || logo.logo_content_type || "";

    const bytes = Buffer.from(await file.body.arrayBuffer());

    if (contentType.toLowerCase().includes("png")) {
      return readPngPdfImage(bytes);
    }

    if (!contentType.toLowerCase().includes("jpeg") && !contentType.toLowerCase().includes("jpg")) {
      return null;
    }

    const dimensions = readJpegDimensions(bytes);

    if (!dimensions) {
      return null;
    }

    return {
      bytes,
      format: "jpeg",
      height: dimensions.height,
      width: dimensions.width,
    };
  } catch {
    console.warn("Organization logo PDF image could not be prepared", {
      stage: "organization_logo_pdf_image",
      reason: "logo_image_unavailable",
    });
    return null;
  }
}

function readPngPdfImage(bytes: Buffer): PdfLogoImage | null {
  const pngSignature = "89504e470d0a1a0a";

  if (bytes.subarray(0, 8).toString("hex") !== pngSignature) {
    return null;
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (!width || !height || bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    return null;
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const scanlineLength = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rgb = Buffer.alloc(width * height * 3);
  let sourceOffset = 0;
  let targetOffset = 0;
  let previous = Buffer.alloc(scanlineLength);

  for (let row = 0; row < height; row += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const current = Buffer.from(inflated.subarray(sourceOffset, sourceOffset + scanlineLength));
    sourceOffset += scanlineLength;
    unfilterPngScanline(current, previous, bytesPerPixel, filter);

    for (let x = 0; x < width; x += 1) {
      const pixelOffset = x * bytesPerPixel;
      const red = current[pixelOffset];
      const green = current[pixelOffset + 1];
      const blue = current[pixelOffset + 2];

      if (colorType === 6) {
        const alpha = current[pixelOffset + 3] / 255;
        rgb[targetOffset] = Math.round(red * alpha + 255 * (1 - alpha));
        rgb[targetOffset + 1] = Math.round(green * alpha + 255 * (1 - alpha));
        rgb[targetOffset + 2] = Math.round(blue * alpha + 255 * (1 - alpha));
      } else {
        rgb[targetOffset] = red;
        rgb[targetOffset + 1] = green;
        rgb[targetOffset + 2] = blue;
      }

      targetOffset += 3;
    }

    previous = current;
  }

  return {
    bytes: deflateSync(rgb),
    format: "rgb",
    height,
    width,
  };
}

function unfilterPngScanline(
  current: Buffer,
  previous: Buffer,
  bytesPerPixel: number,
  filter: number,
) {
  for (let index = 0; index < current.length; index += 1) {
    const left = index >= bytesPerPixel ? current[index - bytesPerPixel] : 0;
    const up = previous[index] ?? 0;
    const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] ?? 0 : 0;

    if (filter === 1) {
      current[index] = (current[index] + left) & 0xff;
    } else if (filter === 2) {
      current[index] = (current[index] + up) & 0xff;
    } else if (filter === 3) {
      current[index] = (current[index] + Math.floor((left + up) / 2)) & 0xff;
    } else if (filter === 4) {
      current[index] = (current[index] + paethPredictor(left, up, upperLeft)) & 0xff;
    }
  }
}

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) {
    return left;
  }

  if (upDistance <= upperLeftDistance) {
    return up;
  }

  return upperLeft;
}

function readJpegDimensions(bytes: Buffer) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}
