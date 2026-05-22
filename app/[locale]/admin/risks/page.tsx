import { getMessages, setRequestLocale } from "next-intl/server";
import { AdminRisksClient } from "@/components/admin/admin-risks-client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminRisksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRisksPage({ params }: AdminRisksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { admin?: Partial<AdminLabels> };
  const source = messages.admin ?? {};
  const labels: AdminLabels = {
    ...defaultAdminLabels,
    ...source,
    navigation: { ...defaultAdminLabels.navigation, ...source.navigation },
    checklistLabels: { ...defaultAdminLabels.checklistLabels, ...source.checklistLabels },
    statuses: { ...defaultAdminLabels.statuses, ...source.statuses },
    stats: { ...defaultAdminLabels.stats, ...source.stats },
    supportStatuses: { ...defaultAdminLabels.supportStatuses, ...source.supportStatuses },
    supportPriorities: { ...defaultAdminLabels.supportPriorities, ...source.supportPriorities },
    supportCategories: { ...defaultAdminLabels.supportCategories, ...source.supportCategories },
  };

  return <AdminRisksClient labels={labels} />;
}
