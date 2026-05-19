import { getMessages, setRequestLocale } from "next-intl/server";
import {
  ActivityPageContent,
  type ActivityPageLabels,
} from "@/app/dashboard/activity/page";

type ActivityPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { activity?: Partial<ActivityPageLabels> };

  return <ActivityPageContent labels={messages.activity as ActivityPageLabels | undefined} />;
}
