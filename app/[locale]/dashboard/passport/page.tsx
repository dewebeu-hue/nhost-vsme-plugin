import { getMessages, setRequestLocale } from "next-intl/server";
import { PassportPageContent } from "@/app/dashboard/passport/page";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

type PassportPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PassportPage({ params }: PassportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { passport?: Partial<PassportLabels> };
  const source = messages.passport ?? {};
  const labels: PassportLabels = {
    ...defaultPassportLabels,
    ...source,
    modules: { ...defaultPassportLabels.modules, ...source.modules },
    settings: { ...defaultPassportLabels.settings, ...source.settings },
    settingValues: { ...defaultPassportLabels.settingValues, ...source.settingValues },
    checklist: { ...defaultPassportLabels.checklist, ...source.checklist },
    contextualHelp: { ...defaultPassportLabels.contextualHelp, ...source.contextualHelp },
    documentCategories: {
      ...defaultPassportLabels.documentCategories,
      ...source.documentCategories,
    },
    evidenceMissingBySection: {
      ...defaultPassportLabels.evidenceMissingBySection,
      ...source.evidenceMissingBySection,
    },
  };

  return <PassportPageContent labels={labels} />;
}
