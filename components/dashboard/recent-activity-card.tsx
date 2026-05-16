import { Activity } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import type { DashboardActivity } from "@/lib/mock-data";

type RecentActivityCardProps = {
  activity: DashboardActivity[];
};

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <SectionCard
      title="Recent activity"
      description="A concise audit trail of the latest workspace events."
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {activity.map((item) => (
          <div key={item.text} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Activity aria-hidden="true" className="size-4" />
            </div>
            <p className="text-sm font-medium leading-6 text-slate-700">{item.text}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
