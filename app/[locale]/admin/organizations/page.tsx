import { getMessages, setRequestLocale } from "next-intl/server";
import { AdminOrganizationsPageContent } from "@/app/admin/organizations/page";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminOrganizationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrganizationsPage({ params }: AdminOrganizationsPageProps) {
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
  };

  return <AdminOrganizationsPageContent labels={labels} />;
}
