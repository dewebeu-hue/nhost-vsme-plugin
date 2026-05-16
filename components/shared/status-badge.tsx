import { Badge } from "@/components/ui/badge";
import type { DocumentStatus, QuestionAnswerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type StatusTone = QuestionAnswerStatus | DocumentStatus;

const statusStyles: Record<StatusTone, string> = {
  not_started: "border-slate-200 bg-slate-50 text-slate-600",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_evidence: "border-amber-200 bg-amber-50 text-amber-700",
  reviewed: "border-teal-200 bg-teal-50 text-teal-700",
  uploaded: "border-blue-200 bg-blue-50 text-blue-700",
  linked: "border-violet-200 bg-violet-50 text-violet-700",
  expiring_soon: "border-amber-200 bg-amber-50 text-amber-700",
  needs_review: "border-red-200 bg-red-50 text-red-700",
};

const statusLabels: Record<StatusTone, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  needs_evidence: "Needs evidence",
  reviewed: "Reviewed",
  uploaded: "Uploaded",
  linked: "Linked",
  expiring_soon: "Expiring soon",
  needs_review: "Needs review",
};

type StatusBadgeProps = {
  status: StatusTone;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 font-medium",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
