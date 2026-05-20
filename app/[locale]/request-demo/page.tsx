import { setRequestLocale } from "next-intl/server";
import { RequestDemoPageContent } from "@/components/landing/request-demo-page-content";
import type { AppLocale } from "@/i18n/routing";

type RequestDemoPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function RequestDemoPage({ params }: RequestDemoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RequestDemoPageContent />;
}
