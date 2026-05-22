import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";
import { getReadinessVisualState } from "@/lib/readiness-visual-state";
import { cn } from "@/lib/utils";

type DashboardModuleCompletion = {
  name: string;
  completed: number;
  total: number;
  percent: number;
};

type OverallReadinessCardProps = {
  readiness: number;
  label: string;
  lastUpdated: string;
  modules: DashboardModuleCompletion[];
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

export function OverallReadinessCard({
  readiness,
  label,
  lastUpdated,
  modules,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: OverallReadinessCardProps) {
  const visualState = getReadinessVisualState(readiness);

  return (
    <SectionCard
      title={labels.overallReadiness}
      description={labels.readinessDescription}
      className={cn(
        "h-full shadow-sm",
        visualState.cardClassName,
        visualState.isComplete ? "shadow-[0_0_28px_rgba(16,185,129,0.22)]" : "",
      )}
      contentClassName="flex flex-col gap-4"
    >
      <div className="grid gap-4 rounded-2xl bg-white/70 p-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <ProgressRing
          value={readiness}
          label={labels.ready}
          helper={labels.vsme}
          size={124}
          stroke={11}
          className={cn(
            "rounded-full bg-white",
            visualState.isComplete ? "shadow-[0_0_22px_rgba(16,185,129,0.3)]" : "shadow-sm",
          )}
          trackClassName={visualState.trackClassName}
          progressClassName={visualState.progressClassName}
          valueClassName={visualState.valueClassName}
          labelClassName={visualState.labelClassName}
          helperClassName={visualState.helperClassName}
        />
        <div>
          <p className={cn("text-xl font-semibold tracking-tight", visualState.valueClassName)}>
            {label}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            {labels.readinessHelper}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {modules.length ? modules.map((module) => (
          <div
            key={module.name}
            className="grid gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-slate-950">
                {labels.modules[module.name] ?? module.name}
              </span>
              <span className="whitespace-nowrap text-slate-500">
                {module.completed}/{module.total} -{" "}
                <span className="font-semibold text-slate-950">{module.percent}%</span>
              </span>
            </div>
            <Progress value={module.percent} className="h-2" />
          </div>
        )) : (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.setupChecklist.neutralFallback}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm font-medium sm:flex-row sm:items-center sm:justify-between",
          visualState.footerClassName,
        )}
      >
        <span>{labels.lastUpdated}: {lastUpdated}</span>
        <Link
          href={`${localePrefix}/dashboard/questionnaire`}
          className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {labels.viewAllSections}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </SectionCard>
  );
}
