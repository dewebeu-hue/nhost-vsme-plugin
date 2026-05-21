import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PassportSection } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

type PassportSectionCardProps = {
  section: PassportSection;
  labels?: PassportLabels;
};

export function PassportSectionCard({
  section,
  labels = defaultPassportLabels,
}: PassportSectionCardProps) {
  const shared = section.visibility === "Shared";
  const VisibilityIcon = shared ? Eye : EyeOff;

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-slate-950 break-words">
            {labels.modules[section.title] ?? section.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {section.completion}% {labels.completion}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "max-w-[48%] shrink-0 whitespace-normal rounded-2xl px-2.5 py-1 text-left font-medium leading-5 break-words",
            shared
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          <VisibilityIcon aria-hidden="true" />
          {shared ? labels.shared : labels.hidden}
        </Badge>
      </div>

      <Progress value={section.completion} className="mt-5 h-2 bg-slate-100" />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {section.approvedAnswers}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 break-words">
            {labels.approvedAnswers}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-2xl font-semibold tracking-tight text-blue-700">
            {section.linkedDocuments}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 break-words">
            {labels.linkedDocuments}
          </p>
        </div>
      </div>
    </article>
  );
}
