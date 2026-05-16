import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PassportSection } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PassportSectionCardProps = {
  section: PassportSection;
};

export function PassportSectionCard({ section }: PassportSectionCardProps) {
  const shared = section.visibility === "Shared";
  const VisibilityIcon = shared ? Eye : EyeOff;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-950">
            {section.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{section.completion}% completion</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-2.5 py-1 font-medium",
            shared
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          <VisibilityIcon aria-hidden="true" />
          {section.visibility}
        </Badge>
      </div>

      <Progress value={section.completion} className="mt-5 h-2 bg-slate-100" />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {section.approvedAnswers}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            approved answers
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-2xl font-semibold tracking-tight text-blue-700">
            {section.linkedDocuments}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
            linked documents
          </p>
        </div>
      </div>
    </article>
  );
}
