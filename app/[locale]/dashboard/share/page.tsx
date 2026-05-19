import { getMessages, setRequestLocale } from "next-intl/server";
import {
  defaultPassportShareLabels,
  PassportShareLinkClient,
  type PassportShareLabels,
} from "@/components/passport/passport-share-link-client";

type DashboardSharePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardSharePage({ params }: DashboardSharePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { passportShare?: Partial<PassportShareLabels> };
  const labels = {
    ...defaultPassportShareLabels,
    ...messages.passportShare,
  };

  return <PassportShareLinkClient labels={labels} />;
}
