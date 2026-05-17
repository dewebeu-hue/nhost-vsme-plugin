import { setRequestLocale } from "next-intl/server";
import { MissingDataPageContent } from "@/app/dashboard/missing-data/page";

type MissingDataPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MissingDataPage({ params }: MissingDataPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MissingDataPageContent />;
}
