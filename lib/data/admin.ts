import "server-only";

import { adminNotes, adminOrganizations, adminReviews } from "@/lib/mock-data";

export function isAdminBackendConfigured() {
  return false;
}

export async function getAdminOrganizations() {
  return {
    organizations: adminOrganizations,
    source: "mock" as const,
  };
}

export async function getAdminReviews() {
  return {
    reviews: adminReviews,
    source: "mock" as const,
  };
}

export async function getAdminNotes() {
  return {
    notes: adminNotes,
    source: "mock" as const,
  };
}
