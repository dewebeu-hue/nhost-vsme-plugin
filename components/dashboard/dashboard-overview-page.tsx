"use client";

import { useEffect, useState } from "react";
import { ActiveShareLinksCard } from "@/components/dashboard/active-share-links-card";
import { BuyerRequestsCard } from "@/components/dashboard/buyer-requests-card";
import { MissingDataSummaryCard } from "@/components/dashboard/missing-data-summary-card";
import { ModuleCompletionCard } from "@/components/dashboard/module-completion-card";
import { OverallReadinessCard } from "@/components/dashboard/overall-readiness-card";
import { ReadinessChartCard } from "@/components/dashboard/readiness-chart-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { RecentUploadsCard } from "@/components/dashboard/recent-uploads-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { PageHeader } from "@/components/layout/page-header";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import {
  dashboardActiveShareLinks,
  dashboardBuyerRequests,
  dashboardMissingDataSummary,
  dashboardModuleCompletion,
  dashboardOverview,
  dashboardReadinessOverTime,
  dashboardRecentActivity,
  dashboardRecentUploads,
  dashboardTasks,
} from "@/lib/mock-data";

type DashboardOverviewPageProps = {
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

export function DashboardOverviewPage({
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: DashboardOverviewPageProps) {
  const [welcomeName, setWelcomeName] = useState(labels.account);

  useEffect(() => {
    let cancelled = false;

    async function loadUserName() {
      const session = await getFreshBrowserNhostSession();
      const user = session?.user as
        | {
            displayName?: string | null;
            email?: string | null;
            metadata?: { displayName?: string; name?: string; fullName?: string };
          }
        | undefined;

      if (!user || cancelled) {
        return;
      }

      setWelcomeName(getUserSafeLabel(user, labels.account));
    }

    void loadUserName();

    return () => {
      cancelled = true;
    };
  }, [labels.account]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <PageHeader
        title={`${labels.title.replace("{name}", welcomeName)} 👋`}
        subtitle={labels.subtitle}
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr_0.8fr]">
        <OverallReadinessCard
          readiness={dashboardOverview.readiness}
          label={labels.goodProgress}
          lastUpdated={dashboardOverview.lastUpdated}
          modules={dashboardModuleCompletion}
          labels={labels}
        />
        <ModuleCompletionCard
          modules={dashboardModuleCompletion}
          labels={labels}
          localePrefix={localePrefix}
        />
        <MissingDataSummaryCard
          total={dashboardMissingDataSummary.total}
          items={dashboardMissingDataSummary.items}
          labels={labels}
          localePrefix={localePrefix}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <BuyerRequestsCard requests={dashboardBuyerRequests} labels={labels} />
        <RecentUploadsCard uploads={dashboardRecentUploads} labels={labels} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TasksCard tasks={dashboardTasks} labels={labels} />
        <ReadinessChartCard
          data={dashboardReadinessOverTime}
          improvementText={dashboardOverview.improvementText}
          rangeLabel={dashboardOverview.chartRange}
          endValue={dashboardOverview.readiness}
          labels={labels}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActiveShareLinksCard links={dashboardActiveShareLinks} labels={labels} />
        <RecentActivityCard activity={dashboardRecentActivity} labels={labels} />
      </section>
    </div>
  );
}

function getUserSafeLabel(
  user: {
    displayName?: string | null;
    email?: string | null;
    metadata?: { displayName?: string; name?: string; fullName?: string };
  },
  fallbackLabel: string,
) {
  const metadataName =
    user.metadata?.displayName || user.metadata?.fullName || user.metadata?.name;
  const emailLocalPart = user.email?.split("@")[0];

  return user.displayName || metadataName || emailLocalPart || fallbackLabel;
}
