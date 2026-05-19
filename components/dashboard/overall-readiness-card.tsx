import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

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
  return (
    <SectionCard
      title={labels.overallReadiness}
      description={labels.readinessDescription}
      className="h-full"
      contentClassName="flex flex-col gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <ProgressRing value={readiness} label={labels.ready} helper={labels.vsme} size={142} />
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{label}</p>
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
        {labels.lastUpdated}: {lastUpdated}
      </div>
    </SectionCard>
  );
}
