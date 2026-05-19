import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardRouteLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardRouteLayout({
  children,
  params,
}: DashboardRouteLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations("navigation");
  const statuses = await getTranslations("statuses");
  const shell = await getTranslations("dashboard.shell");

  const labels: DashboardShellLabels = {
    navigation: {
      dashboard: nav("dashboard"),
      companyProfile: nav("companyProfile"),
      buyerRequests: nav("buyerRequests"),
      questionnaire: nav("questionnaire"),
      evidenceRoom: nav("evidenceRoom"),
      passport: nav("passport"),
      share: nav("share"),
      shareLinks: nav("shareLinks"),
      activity: nav("activity"),
      settings: nav("settings"),
    },
    verified: statuses("verified"),
    verifiedSupplier: shell("verifiedSupplier"),
    plan: shell("plan"),
    renewal: shell("renewal"),
    workspace: shell("workspace"),
    account: shell("account"),
    logOut: shell("logOut"),
    needHelp: shell("needHelp"),
    helpCenter: shell("helpCenter"),
    openNavigation: shell("openNavigation"),
    notifications: shell("notifications"),
    notificationsUnavailable: shell("notificationsUnavailable"),
  };

  return (
    <DashboardLayout labels={labels} localePrefix={`/${locale}`}>
      {children}
    </DashboardLayout>
  );
}
