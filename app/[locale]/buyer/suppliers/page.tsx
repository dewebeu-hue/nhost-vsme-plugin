import { setRequestLocale } from "next-intl/server";
import { BuyerSuppliersNeutralPage } from "@/components/buyer/buyer-portal-pages";
import type { AppLocale } from "@/i18n/routing";

type BuyerSuppliersPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export function generateMetadata() {
  return {
    title: "Buyer Supplier Summaries",
    description: "Open a supplier link to view a shared Supplier Passport summary.",
  };
}

export default async function BuyerSuppliersPage({ params }: BuyerSuppliersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuyerSuppliersNeutralPage />;
}
