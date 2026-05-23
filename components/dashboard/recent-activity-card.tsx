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
  compact?: boolean;
};

export function RecentActivityCard({
  activity,
  labels = defaultDashboardOverviewLabels,
  compact = false,
}: RecentActivityCardProps) {
  return (
    <SectionCard
      title={labels.recentActivity}
      description={compact ? undefined : labels.recentActivityDescription}
      className="h-full"
    >
      <div className={compact ? "flex flex-col gap-2.5" : "flex flex-col gap-3"}>
        {activity.length ? activity.slice(0, compact ? 3 : activity.length).map((item) => (
          <div key={item.kind} className="premium-surface-interactive flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Activity aria-hidden="true" className="size-4" />
            </div>
            <p className="text-sm font-medium leading-6 text-slate-700">
              {formatActivity(item, labels)}
            </p>
          </div>
        )) : (
          <div className="premium-empty-state flex gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Activity aria-hidden="true" className="size-4" />
            </span>
            <span>{labels.noRecentActivity}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function formatActivity(item: DashboardActivity, labels: DashboardOverviewLabels) {
  return labels.activity[item.kind].replace("{count}", String(item.count));
}
