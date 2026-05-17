import { setRequestLocale } from "next-intl/server";
import { CompanyProfilePageContent } from "@/app/dashboard/company/page";

type CompanyProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CompanyProfilePageContent />;
}
