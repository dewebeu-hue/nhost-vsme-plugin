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

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${dashboardOverview.userName} 👋`}
        subtitle="Here’s an overview of your VSME readiness and recent activity."
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr_0.8fr]">
        <OverallReadinessCard
          readiness={dashboardOverview.readiness}
          label={dashboardOverview.readinessLabel}
          lastUpdated={dashboardOverview.lastUpdated}
          modules={dashboardModuleCompletion}
        />
        <ModuleCompletionCard modules={dashboardModuleCompletion} />
        <MissingDataSummaryCard
          total={dashboardMissingDataSummary.total}
          items={dashboardMissingDataSummary.items}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <BuyerRequestsCard requests={dashboardBuyerRequests} />
        <RecentUploadsCard uploads={dashboardRecentUploads} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TasksCard tasks={dashboardTasks} />
        <ReadinessChartCard
          data={dashboardReadinessOverTime}
          improvementText={dashboardOverview.improvementText}
          rangeLabel={dashboardOverview.chartRange}
          endValue={dashboardOverview.readiness}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActiveShareLinksCard links={dashboardActiveShareLinks} />
        <RecentActivityCard activity={dashboardRecentActivity} />
      </section>
    </div>
  );
}
