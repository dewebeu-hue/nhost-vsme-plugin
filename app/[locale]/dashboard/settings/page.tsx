import { getMessages, setRequestLocale } from "next-intl/server";
import { SettingsPageContent } from "@/app/dashboard/settings/page";
import { defaultSettingsLabels, type SettingsLabels } from "@/lib/operational-labels";

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { settings?: Partial<SettingsLabels> };

  return <SettingsPageContent labels={{ ...defaultSettingsLabels, ...(messages.settings ?? {}) }} />;
}
