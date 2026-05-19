import { Activity } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardActivity = {
  kind: "answers" | "documents" | "links" | "share";
  count: number;
};

type RecentActivityCardProps = {
  activity: DashboardActivity[];
  labels?: DashboardOverviewLabels;
};

export function RecentActivityCard({
  activity,
  labels = defaultDashboardOverviewLabels,
}: RecentActivityCardProps) {
  return (
    <SectionCard
      title={labels.recentActivity}
      description={labels.recentActivityDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {activity.length ? activity.map((item) => (
          <div key={item.kind} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Activity aria-hidden="true" className="size-4" />
            </div>
            <p className="text-sm font-medium leading-6 text-slate-700">
              {formatActivity(item, labels)}
            </p>
          </div>
        )) : (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.noRecentActivity}
          </p>
        )}
      </div>
    </SectionCard>
  );
}

function formatActivity(item: DashboardActivity, labels: DashboardOverviewLabels) {
  return labels.activity[item.kind].replace("{count}", String(item.count));
}
