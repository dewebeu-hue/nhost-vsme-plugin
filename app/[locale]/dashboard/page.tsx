import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardOverviewPage } from "@/components/dashboard/dashboard-overview-page";
import type { DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.overview");
  const statuses = await getTranslations("statuses");

  const labels: DashboardOverviewLabels = {
    title: t("welcome", { name: "{name}" }),
    subtitle: t("subtitle"),
    overallReadiness: t("overallReadiness"),
    readinessDescription: t("readinessDescription"),
    goodProgress: t("goodProgress"),
    ready: t("ready"),
    vsme: t("vsme"),
    readinessHelper: t("readinessHelper"),
    lastUpdated: t("lastUpdated"),
    moduleCompletion: t("moduleCompletion"),
    moduleDescription: t("moduleDescription"),
    viewAllSections: t("viewAllSections"),
    missingDataSummary: t("missingDataSummary"),
    missingDataDescription: t("missingDataDescription"),
    totalMissingData: t("totalMissingData"),
    items: t("items"),
    goToMissingData: t("goToMissingData"),
    recentBuyerRequests: t("recentBuyerRequests"),
    buyerRequestsDescription: t("buyerRequestsDescription"),
    due: t("due"),
    recentUploads: t("recentUploads"),
    recentUploadsDescription: t("recentUploadsDescription"),
    yourTasks: t("yourTasks"),
    tasksDescription: t("tasksDescription"),
    readinessOverTime: t("readinessOverTime"),
    endValue: t("endValue"),
    activeShareLinks: t("activeShareLinks"),
    activeShareLinksDescription: t("activeShareLinksDescription"),
    expires: t("expires"),
    recentActivity: t("recentActivity"),
    recentActivityDescription: t("recentActivityDescription"),
    modules: {
      "Basic Information": t("modules.basicInformation"),
      Environment: t("modules.environment"),
      Social: t("modules.social"),
      Governance: t("modules.governance"),
    },
    statuses: {
      "Not started": statuses("notStarted"),
      "In progress": statuses("inProgress"),
      Completed: statuses("completed"),
      Reviewed: statuses("reviewed"),
      Uploaded: statuses("uploaded"),
      Linked: statuses("linked"),
      Active: statuses("active"),
    },
  };

  return <DashboardOverviewPage labels={labels} localePrefix={`/${locale}`} />;
}
