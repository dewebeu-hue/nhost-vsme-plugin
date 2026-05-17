import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardMissingDataItem } from "@/lib/mock-data";

type MissingDataSummaryCardProps = {
  total: number;
  items: DashboardMissingDataItem[];
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

export function MissingDataSummaryCard({
  total,
  items,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: MissingDataSummaryCardProps) {
  return (
    <SectionCard
      title={labels.missingDataSummary}
      description={labels.missingDataDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
          <p className="text-sm font-medium text-amber-700">{labels.totalMissingData}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            {total} {labels.items}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.area}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="text-sm font-semibold text-slate-950">
                {labels.modules[item.area] ?? item.area}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {item.items} {labels.items}
              </span>
            </div>
          ))}
        </div>
        <Link
          href={`${localePrefix}/dashboard/missing-data`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {labels.goToMissingData}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </SectionCard>
  );
}
