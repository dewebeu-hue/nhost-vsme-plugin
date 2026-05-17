import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/shared/section-card";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardModuleCompletion } from "@/lib/mock-data";

type ModuleCompletionCardProps = {
  modules: DashboardModuleCompletion[];
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

export function ModuleCompletionCard({
  modules,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: ModuleCompletionCardProps) {
  return (
    <SectionCard
      title={labels.moduleCompletion}
      description={labels.moduleDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-4">
        {modules.map((module) => (
          <div key={module.name} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-950">
                {labels.modules[module.name] ?? module.name}
              </span>
              <span className="text-slate-500">
                {module.completed}/{module.total} - {module.percent}%
              </span>
            </div>
            <Progress value={module.percent} className="h-2" />
          </div>
        ))}
        <Link
          href={`${localePrefix}/dashboard/questionnaire`}
          className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {labels.viewAllSections}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </SectionCard>
  );
}
