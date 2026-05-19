import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicShareAccessState, PublicSharePage } from "@/components/passport/public-share-page";
import { SharePasswordForm } from "@/components/share/share-password-form";
import type { AppLocale } from "@/i18n/routing";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";
import { publicSharePassport } from "@/lib/mock-data";

type PassportTokenPageProps = {
  params: Promise<{
    locale: AppLocale;
    token: string;
  }>;
};

export function generateStaticParams() {
  return ["en", "hr", "de"].map((locale) => ({
    locale,
    token: publicSharePassport.token,
  }));
}

export async function generateMetadata({ params }: PassportTokenPageProps) {
  const { token } = await params;

  if (token !== publicSharePassport.token) {
    return {
      title: "Shared Supplier Passport",
    };
  }

  return {
    title: `${publicSharePassport.company.name} | Supplier Passport`,
    description: "Secure read-only Supplier Passport shared with a buyer.",
  };
}

export default async function PassportTokenPage({ params }: PassportTokenPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const verificationCookieValue = cookieStore.get(getShareVerificationCookieName(token))?.value;
  const result = await getPublicShareByToken(token, { verificationCookieValue });

  if (!result) {
    notFound();
  }

  if (result.state === "expired") {
    const t = await getTranslations("share");

    return <PublicShareAccessState title={t("expiredTitle")} description={t("expiredText")} />;
  }

  if (result.state === "inactive") {
    const t = await getTranslations("share");

    return <PublicShareAccessState title={t("inactiveTitle")} description={t("inactiveText")} />;
  }

  if (result.state === "password") {
    return <SharePasswordForm token={token} />;
  }

  return <PublicSharePage passport={result.share} />;
}
