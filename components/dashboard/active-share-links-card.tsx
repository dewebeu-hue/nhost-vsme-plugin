import { Link2 } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardShareLink } from "@/lib/mock-data";

type ActiveShareLinksCardProps = {
  links: DashboardShareLink[];
  labels?: DashboardOverviewLabels;
};

export function ActiveShareLinksCard({
  links,
  labels = defaultDashboardOverviewLabels,
}: ActiveShareLinksCardProps) {
  return (
    <SectionCard
      title={labels.activeShareLinks}
      description={labels.activeShareLinksDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <div
            key={`${link.buyer}-${link.expires}`}
            className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Link2 aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{link.buyer}</p>
                <DashboardStatusPill tone="green">
                  {labels.statuses[link.status] ?? link.status}
                </DashboardStatusPill>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {link.module} - {labels.expires} {link.expires}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
