import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";

type DashboardMissingDataItem = {
  code: string;
  area: string;
  items: number;
};

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
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-sm font-medium text-amber-700">{labels.totalMissingData}</p>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-950">
            {total} {labels.items}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {items.length ? items.map((item) => (
            <Link
              key={item.area}
              href={`${localePrefix}/dashboard/questionnaire?section=${encodeURIComponent(item.code)}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-950">
                  {labels.modules[item.area] ?? item.area}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
                  {item.items} {labels.items}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                {labels.resolve}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
            </Link>
          )) : (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
              {labels.setupChecklist.neutralFallback}
            </p>
          )}
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
