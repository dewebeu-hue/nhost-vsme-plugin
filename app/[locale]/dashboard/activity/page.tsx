import { setRequestLocale } from "next-intl/server";
import { ActivityPageContent } from "@/app/dashboard/activity/page";

type ActivityPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ActivityPageContent />;
}
