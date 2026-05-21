import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportReadinessModule } from "@/lib/mock-data";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";
import { getReadinessVisualState } from "@/lib/readiness-visual-state";
import { cn } from "@/lib/utils";

type PassportReadinessSummaryProps = {
  score: number;
  modules: PassportReadinessModule[];
  labels?: PassportLabels;
};

export function PassportReadinessSummary({
  score,
  modules,
  labels = defaultPassportLabels,
}: PassportReadinessSummaryProps) {
  const visualState = getReadinessVisualState(score);

  return (
    <SectionCard
      title={labels.readinessSummary}
      description={labels.readinessSummaryDescription}
      className={cn(
        "shadow-sm",
        visualState.cardClassName,
        visualState.isComplete ? "shadow-[0_0_28px_rgba(16,185,129,0.22)]" : "",
      )}
    >
      <div className="grid gap-6 rounded-2xl bg-white/70 p-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <ProgressRing
            value={score}
            label={labels.ready}
            size={164}
            stroke={14}
            className={cn(
              "rounded-full bg-white",
              visualState.isComplete ? "shadow-[0_0_22px_rgba(16,185,129,0.3)]" : "shadow-sm",
            )}
            trackClassName={visualState.trackClassName}
            progressClassName={visualState.progressClassName}
            valueClassName={visualState.valueClassName}
            labelClassName={visualState.labelClassName}
          />
        </div>
        <div className="flex flex-col gap-4">
          {modules.map((module) => (
            <div key={module.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-700">
                  {labels.modules[module.label] ?? module.label}
                </span>
                <span className={cn("text-sm font-semibold", getReadinessVisualState(module.value).valueClassName)}>
                  {module.value}%
                </span>
              </div>
              <Progress
                value={module.value}
                className={cn("h-2 bg-slate-100", getReadinessVisualState(module.value).barClassName)}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
