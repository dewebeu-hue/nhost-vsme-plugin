import { getMessages, setRequestLocale } from "next-intl/server";
import { CompanyProfilePageContent } from "@/app/dashboard/company/page";
import {
  defaultCompanyProfileLabels,
  type CompanyProfileLabels,
} from "@/lib/operational-labels";

type CompanyProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { companyProfile?: Partial<CompanyProfileLabels> };

  return (
    <CompanyProfilePageContent
      labels={{ ...defaultCompanyProfileLabels, ...(messages.companyProfile ?? {}) }}
      localePrefix={`/${locale}`}
    />
  );
}
