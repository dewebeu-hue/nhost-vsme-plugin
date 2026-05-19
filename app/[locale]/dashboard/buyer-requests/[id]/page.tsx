import { getMessages, setRequestLocale } from "next-intl/server";
import { BuyerRequestDetailClient } from "@/components/buyer-requests/buyer-request-detail-client";
import {
  defaultBuyerRequestLabels,
  type BuyerRequestLabels,
} from "@/components/buyer-requests/buyer-request-labels";

type BuyerRequestDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BuyerRequestDetailPage({ params }: BuyerRequestDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { buyerRequests?: Partial<BuyerRequestLabels> };
  const source = messages.buyerRequests ?? {};

  const labels: BuyerRequestLabels = {
    ...defaultBuyerRequestLabels,
    ...source,
    statuses: { ...defaultBuyerRequestLabels.statuses, ...source.statuses },
    sections: { ...defaultBuyerRequestLabels.sections, ...source.sections },
  };

  return <BuyerRequestDetailClient requestId={id} labels={labels} />;
}
