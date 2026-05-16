import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportReadinessModule } from "@/lib/mock-data";

type PassportReadinessSummaryProps = {
  score: number;
  modules: PassportReadinessModule[];
};

export function PassportReadinessSummary({ score, modules }: PassportReadinessSummaryProps) {
  return (
    <SectionCard
      title="Readiness summary"
      description="Current VSME readiness by buyer-facing module."
    >
      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <ProgressRing value={score} label="ready" size={164} />
        </div>
        <div className="flex flex-col gap-4">
          {modules.map((module) => (
            <div key={module.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-700">{module.label}</span>
                <span className="text-sm font-semibold text-slate-950">{module.value}%</span>
              </div>
              <Progress value={module.value} className="h-2 bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
