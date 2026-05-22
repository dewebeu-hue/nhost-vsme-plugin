import { getMessages, setRequestLocale } from "next-intl/server";
import { AdminSupportRequestsClient } from "@/components/admin/admin-support-requests-client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminSupportRequestsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminSupportRequestsPage({
  params,
}: AdminSupportRequestsPageProps) {
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

  return <AdminSupportRequestsClient labels={labels} />;
}
