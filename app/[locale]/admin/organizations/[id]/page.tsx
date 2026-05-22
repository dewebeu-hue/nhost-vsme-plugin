import { getMessages, setRequestLocale } from "next-intl/server";
import { AdminOrganizationDetailClient } from "@/components/admin/admin-organization-detail-client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminOrganizationDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminOrganizationDetailPage({ params }: AdminOrganizationDetailPageProps) {
  const { locale, id } = await params;
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

  return <AdminOrganizationDetailClient organizationId={id} labels={labels} />;
}
