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
};

export function OverallReadinessCard({
  readiness,
  label,
  lastUpdated,
  modules,
  labels = defaultDashboardOverviewLabels,
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
      contentClassName="flex flex-col gap-6"
    >
      <div className="grid gap-6 rounded-2xl bg-white/70 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <ProgressRing
          value={readiness}
          label={labels.ready}
          helper={labels.vsme}
          size={152}
          stroke={14}
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
          <p className={cn("text-2xl font-semibold tracking-tight", visualState.valueClassName)}>
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {labels.readinessHelper}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {modules.length ? modules.map((module) => (
          <div key={module.name} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">
                {labels.modules[module.name] ?? module.name}
              </span>
              <span className="font-semibold text-slate-950">{module.percent}%</span>
            </div>
            <Progress value={module.percent} className="h-2" />
          </div>
        )) : (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.setupChecklist.neutralFallback}
          </p>
        )}
      </div>

      <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", visualState.footerClassName)}>
        {labels.lastUpdated}: {lastUpdated}
      </div>
    </SectionCard>
  );
}
