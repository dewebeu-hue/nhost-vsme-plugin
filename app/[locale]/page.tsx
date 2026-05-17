import { setRequestLocale } from "next-intl/server";
import { LandingPageContent } from "@/components/landing/landing-page-content";
import type { AppLocale } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingPageContent />;
}
