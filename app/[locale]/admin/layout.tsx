import type { ReactNode } from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AdminLayout } from "@/components/admin/admin-layout";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminRouteLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminRouteLayout({ children, params }: AdminRouteLayoutProps) {
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

  return (
    <AdminLayout labels={labels} localePrefix={`/${locale}`}>
      {children}
    </AdminLayout>
  );
}
