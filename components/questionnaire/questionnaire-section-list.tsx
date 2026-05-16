import { CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { QuestionnaireSectionProgress } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type QuestionnaireSectionListProps = {
  completion: number;
  completedQuestions: number;
  totalQuestions: number;
  sections: QuestionnaireSectionProgress[];
};

export function QuestionnaireSectionList({
  completion,
  completedQuestions,
  totalQuestions,
  sections,
}: QuestionnaireSectionListProps) {
  return (
    <aside className="supplier-surface rounded-2xl border-0 p-5 lg:sticky lg:top-28">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-sm font-medium text-blue-700">Overall completion</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-4xl font-semibold tracking-tight text-slate-950">{completion}%</p>
          <p className="pb-1 text-sm font-medium text-slate-600">
            {completedQuestions} of {totalQuestions}
          </p>
        </div>
        <Progress value={completion} className="mt-4 h-2" />
        <p className="mt-2 text-xs font-medium text-slate-500">questions completed</p>
      </div>

      <nav className="mt-5 flex flex-col gap-1.5" aria-label="Questionnaire sections">
        {sections.map((section) => {
          const isComplete = section.completed === section.total;

          return (
            <button
              key={section.id}
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                section.isActive
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <span className="size-2 shrink-0 rounded-full bg-slate-300" />
                )}
                <span className="truncate text-sm font-semibold">{section.name}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold">
                {section.completed}/{section.total}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
