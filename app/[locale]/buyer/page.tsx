import { setRequestLocale } from "next-intl/server";
import { BuyerPortalLanding } from "@/components/buyer/buyer-portal-pages";
import type { AppLocale } from "@/i18n/routing";

type BuyerPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export function generateMetadata() {
  return {
    title: "Buyer Portal",
    description: "Review Supplier Passport summaries shared by suppliers.",
  };
}

export default async function BuyerPage({ params }: BuyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuyerPortalLanding />;
}
