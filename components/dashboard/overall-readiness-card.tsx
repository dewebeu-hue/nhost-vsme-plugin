import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";
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

function getReadinessVisualState(readiness: number) {
  const normalizedReadiness = Math.max(0, Math.min(100, readiness));
  const isComplete = normalizedReadiness === 100;

  if (normalizedReadiness < 100 / 3) {
    return {
      isComplete,
      cardClassName: "bg-gradient-to-br from-white via-red-50/80 to-white ring-1 ring-red-200",
      trackClassName: "stroke-red-100",
      progressClassName: "stroke-red-500",
      valueClassName: "text-red-700",
      labelClassName: "text-red-600",
      helperClassName: "text-red-500",
      footerClassName: "border-red-100 bg-red-50 text-red-700",
    };
  }

  if (normalizedReadiness <= 200 / 3) {
    return {
      isComplete,
      cardClassName: "bg-gradient-to-br from-white via-amber-50/80 to-white ring-1 ring-amber-200",
      trackClassName: "stroke-amber-100",
      progressClassName: "stroke-amber-500",
      valueClassName: "text-amber-700",
      labelClassName: "text-amber-600",
      helperClassName: "text-amber-500",
      footerClassName: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    isComplete,
    cardClassName: "bg-gradient-to-br from-white via-emerald-50/80 to-white ring-1 ring-emerald-200",
    trackClassName: "stroke-emerald-100",
    progressClassName: "stroke-emerald-500",
    valueClassName: "text-emerald-700",
    labelClassName: "text-emerald-600",
    helperClassName: "text-emerald-500",
    footerClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };
}
