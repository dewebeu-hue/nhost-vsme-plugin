import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicShareAccessState, PublicSharePage } from "@/components/passport/public-share-page";
import { SharePasswordForm } from "@/components/share/share-password-form";
import type { AppLocale } from "@/i18n/routing";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";
import { publicSharePassport } from "@/lib/mock-data";

type SharePageProps = {
  params: Promise<{
    locale: AppLocale;
    token: string;
  }>;
};

export function generateStaticParams() {
  return ["en", "hr", "de"].flatMap((locale) => [
    { locale, token: publicSharePassport.token },
    { locale, token: "expired" },
  ]);
}

export async function generateMetadata({ params }: SharePageProps) {
  const { locale, token } = await params;
  const isCroatian = locale === "hr";

  if (token === "expired") {
    return {
      title: isCroatian ? "Istekao Supplier Passport link" : "Expired Supplier Passport Link",
    };
  }

  if (token !== publicSharePassport.token) {
    return {
      title: isCroatian ? "Dijeljeni Supplier Passport" : "Shared Supplier Passport",
    };
  }

  return {
    title: `${publicSharePassport.company.name} | Supplier Passport`,
    description: isCroatian
      ? "Siguran Supplier Passport dostupan kupcu samo za pregled."
      : "Secure read-only Supplier Passport shared with a buyer.",
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  if (token === "expired") {
    const t = await getTranslations("share");

    return (
      <PublicShareAccessState
        title={t("expiredTitle")}
        description={t("expiredDescription")}
      />
    );
  }

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

  return <PublicSharePage locale={locale} passport={result.share} token={token} />;
}
