import { setRequestLocale } from "next-intl/server";
import { PricingPageContent } from "@/components/pricing/pricing-page-content";
import type { AppLocale } from "@/i18n/routing";

type PricingPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PricingPageContent />;
}
