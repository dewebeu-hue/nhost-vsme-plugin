import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeSupplierToken } from "@/lib/buyer-token";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";
import type { publicSharePassport } from "@/lib/mock-data";

const MAX_COMPARE_TOKENS = 10;

type CompareRequestBody = {
  tokens?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CompareRequestBody;
    const tokens = Array.isArray(body.tokens)
      ? body.tokens
          .filter((token): token is string => typeof token === "string")
          .map((token) => normalizeSupplierToken(token))
          .filter((token): token is string => Boolean(token))
          .slice(0, MAX_COMPARE_TOKENS)
      : [];

    if (!tokens.length) {
      return NextResponse.json({ items: [], maxSuppliers: MAX_COMPARE_TOKENS });
    }

    const cookieStore = await cookies();
    const items = await Promise.all(
      tokens.map(async (token, index) => {
        try {
          const verificationCookieValue = cookieStore.get(getShareVerificationCookieName(token))?.value;
          const result = await getPublicShareByToken(token, { verificationCookieValue });

          if (!result || result.source === "mock" || result.state === "expired" || result.state === "inactive") {
            return createUnavailableCompareItem(index);
          }

          if (result.state === "password") {
            return { index, state: "password_required" as const };
          }

          return createCompareItem(index, result.share);
        } catch (error) {
          console.error("Buyer comparison lookup failed", {
            stage: "buyer_compare_lookup",
            index,
            message: error instanceof Error ? error.message : "Unknown buyer comparison lookup error",
          });
          return createUnavailableCompareItem(index);
        }
      }),
    );

    return NextResponse.json({ items, maxSuppliers: MAX_COMPARE_TOKENS });
  } catch (error) {
    console.error("Buyer comparison API failed", {
      stage: "buyer_compare",
      message: error instanceof Error ? error.message : "Unknown buyer comparison error",
    });
    return NextResponse.json({ error: "Unable to load buyer comparison." }, { status: 500 });
  }
}

function createCompareItem(index: number, passport: typeof publicSharePassport) {
  const evidenceSection = passport.sections.find((section) => section.title === "Evidence summary");

  return {
    index,
    state: "ok" as const,
    organizationName: passport.company.name,
    readinessScore: passport.readinessScore,
    certificateStatus: passport.certificateStatus ?? "none",
    lastUpdated: passport.lastUpdated,
    evidenceCount: evidenceSection?.metricValue ?? "0",
    sections: passport.sections
      .filter((section) => section.title !== "Evidence summary")
      .map((section) => ({
        title: section.title,
        metricValue: section.metricValue,
        actionLabel: section.actionLabel,
      })),
  };
}

function createUnavailableCompareItem(index: number) {
  return { index, state: "unavailable" as const };
}
