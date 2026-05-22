import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import {
  BuyerSupplierSummary,
  BuyerSupplierUnavailable,
} from "@/components/buyer/buyer-portal-pages";
import { SharePasswordForm } from "@/components/share/share-password-form";
import type { AppLocale } from "@/i18n/routing";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";

export const dynamic = "force-dynamic";

type BuyerSupplierTokenPageProps = {
  params: Promise<{
    locale: AppLocale;
    token: string;
  }>;
};

export function generateMetadata() {
  return {
    title: "Buyer Supplier Summary",
    description: "Buyer-safe Supplier Passport summary shared by a supplier.",
  };
}

export default async function BuyerSupplierTokenPage({ params }: BuyerSupplierTokenPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  let result: Awaited<ReturnType<typeof getPublicShareByToken>> = null;

  try {
    const cookieStore = await cookies();
    const verificationCookieValue = cookieStore.get(getShareVerificationCookieName(token))?.value;
    result = await getPublicShareByToken(token, { verificationCookieValue });
  } catch {
    console.error("Buyer supplier summary lookup failed", {
      stage: "buyer_supplier_lookup",
      hasToken: Boolean(token),
      tokenLength: token.length,
      reason: "buyer_supplier_lookup_failed",
    });
  }

  if (!result || result.source === "mock" || result.state === "expired" || result.state === "inactive") {
    return <BuyerSupplierUnavailable />;
  }

  if (result.state === "password") {
    return <SharePasswordForm token={token} />;
  }

  return <BuyerSupplierSummary passport={result.share} token={token} />;
}
