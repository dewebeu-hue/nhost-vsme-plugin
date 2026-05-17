import { setRequestLocale } from "next-intl/server";
import { ShareLinksPageContent } from "@/app/dashboard/share-links/page";

type ShareLinksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ShareLinksPage({ params }: ShareLinksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ShareLinksPageContent />;
}
