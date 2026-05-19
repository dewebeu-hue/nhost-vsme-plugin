import { getMessages, setRequestLocale } from "next-intl/server";
import { BuyerRequestsPageClient } from "@/components/buyer-requests/buyer-requests-page-client";
import {
  defaultBuyerRequestLabels,
  type BuyerRequestLabels,
} from "@/components/buyer-requests/buyer-request-labels";

type BuyerRequestsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuyerRequestsPage({ params }: BuyerRequestsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { buyerRequests?: Partial<BuyerRequestLabels> };
  const source = messages.buyerRequests ?? {};

  const labels: BuyerRequestLabels = {
    ...defaultBuyerRequestLabels,
    ...source,
    statuses: { ...defaultBuyerRequestLabels.statuses, ...source.statuses },
    sections: { ...defaultBuyerRequestLabels.sections, ...source.sections },
  };

  return <BuyerRequestsPageClient labels={labels} />;
}
