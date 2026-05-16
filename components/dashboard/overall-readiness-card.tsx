import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import type { DashboardModuleCompletion } from "@/lib/mock-data";

type OverallReadinessCardProps = {
  readiness: number;
  label: string;
  lastUpdated: string;
  modules: DashboardModuleCompletion[];
};

export function OverallReadinessCard({
  readiness,
  label,
  lastUpdated,
  modules,
}: OverallReadinessCardProps) {
  return (
    <SectionCard
      title="Overall readiness"
      description="Your current VSME readiness snapshot."
      className="h-full"
      contentClassName="flex flex-col gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <ProgressRing value={readiness} label="Ready" helper="VSME" size={142} />
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep closing evidence gaps to move this passport toward buyer-ready review.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((module) => (
          <div key={module.name} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{module.name}</span>
              <span className="font-semibold text-slate-950">{module.percent}%</span>
            </div>
            <Progress value={module.percent} className="h-2" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
        Last updated: {lastUpdated}
      </div>
    </SectionCard>
  );
}
