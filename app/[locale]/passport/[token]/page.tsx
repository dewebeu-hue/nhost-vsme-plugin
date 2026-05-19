import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicShareAccessState, PublicSharePage } from "@/components/passport/public-share-page";
import { SharePasswordForm } from "@/components/share/share-password-form";
import type { AppLocale } from "@/i18n/routing";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";

export const dynamic = "force-dynamic";

type PassportTokenPageProps = {
  params: Promise<{
    locale: AppLocale;
    token: string;
  }>;
};

export async function generateMetadata() {
  return {
    title: "Shared Supplier Passport",
    description: "Secure read-only Supplier Passport shared with a buyer.",
  };
}

export default async function PassportTokenPage({ params }: PassportTokenPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("share");

  let result: Awaited<ReturnType<typeof getPublicShareByToken>> = null;

  try {
    const cookieStore = await cookies();
    const verificationCookieValue = cookieStore.get(getShareVerificationCookieName(token))?.value;
    result = await getPublicShareByToken(token, { verificationCookieValue });
  } catch (error) {
    console.error("Public Passport route failed", {
      stage: "public_passport_lookup",
      hasToken: Boolean(token),
      tokenLength: token.length,
      message: error instanceof Error ? error.message : "Unknown public Passport error",
    });
  }

  if (!result) {
    return <PublicShareAccessState title={t("unavailableTitle")} description={t("unavailableText")} />;
  }

  if (result.state === "expired") {
    return <PublicShareAccessState title={t("expiredTitle")} description={t("expiredText")} />;
  }

  if (result.state === "inactive") {
    return <PublicShareAccessState title={t("inactiveTitle")} description={t("inactiveText")} />;
  }

  if (result.state === "password") {
    return <SharePasswordForm token={token} />;
  }

  return <PublicSharePage locale={locale} passport={result.share} token={token} />;
}
