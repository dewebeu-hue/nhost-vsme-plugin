import { AlertCircle, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportChecklistItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MissingDataChecklistProps = {
  items: PassportChecklistItem[];
};

const checklistStyles: Record<
  PassportChecklistItem["status"],
  { icon: typeof AlertCircle; className: string }
> = {
  warning: {
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  review: {
    icon: Clock3,
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  recommended: {
    icon: RefreshCw,
    className: "bg-slate-50 text-slate-600 ring-slate-100",
  },
  approved: {
    icon: CheckCircle2,
    className: "bg-teal-50 text-teal-700 ring-teal-100",
  },
};

export function MissingDataChecklist({ items }: MissingDataChecklistProps) {
  return (
    <SectionCard
      title="Missing data checklist"
      description="Open items before this passport is shared externally."
    >
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const style = checklistStyles[item.status];
          const Icon = style.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full ring-1",
                  style.className,
                )}
              >
                <Icon aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold leading-6 text-slate-700">{item.label}</span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
