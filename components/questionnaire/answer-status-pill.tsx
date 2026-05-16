import type { QuestionnaireAnswerStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type AnswerStatusPillProps = {
  status: QuestionnaireAnswerStatus;
};

const statusStyles: Record<QuestionnaireAnswerStatus, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "In progress": "border-blue-200 bg-blue-50 text-blue-700",
  "Needs evidence": "border-amber-200 bg-amber-50 text-amber-700",
  Reviewed: "border-teal-200 bg-teal-50 text-teal-700",
  "Not started": "border-slate-200 bg-slate-50 text-slate-600",
};

export function AnswerStatusPill({ status }: AnswerStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
