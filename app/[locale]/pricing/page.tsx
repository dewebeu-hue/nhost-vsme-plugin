import { setRequestLocale } from "next-intl/server";
import { PricingPageContent } from "@/components/pricing/pricing-page-content";
import type { AppLocale } from "@/i18n/routing";
import type { BillingCycle } from "@/lib/pricing";

type PricingPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
  searchParams?: Promise<{
    billing?: string;
  }>;
};

export default async function PricingPage({ params, searchParams }: PricingPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const initialBillingCycle: BillingCycle =
    query?.billing === "annual" ? "annual" : "monthly";

  return <PricingPageContent initialBillingCycle={initialBillingCycle} />;
}
