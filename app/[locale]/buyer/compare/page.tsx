import { setRequestLocale } from "next-intl/server";
import { BuyerComparePage } from "@/components/buyer/buyer-compare-page";
import type { AppLocale } from "@/i18n/routing";

type BuyerCompareRouteProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export function generateMetadata() {
  return {
    title: "Buyer Supplier Comparison",
    description: "Compare buyer-safe Supplier Passport summaries shared by suppliers.",
  };
}

export default async function BuyerCompareRoute({ params }: BuyerCompareRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuyerComparePage />;
}
