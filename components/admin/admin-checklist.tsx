import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import type { AdminChecklistItem, AdminChecklistStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminChecklistProps = {
  items: AdminChecklistItem[];
  labels?: AdminLabels;
};

const statusConfig: Record<
  AdminChecklistStatus,
  { icon: typeof CheckCircle2; className: string; textClassName: string }
> = {
  Completed: {
    icon: CheckCircle2,
    className: "bg-teal-50 text-teal-700 ring-teal-100",
    textClassName: "text-teal-700",
  },
  "In progress": {
    icon: Clock3,
    className: "bg-blue-50 text-blue-700 ring-blue-100",
    textClassName: "text-blue-700",
  },
  Pending: {
    icon: Circle,
    className: "bg-slate-50 text-slate-500 ring-slate-100",
    textClassName: "text-slate-500",
  },
};

export function AdminChecklist({ items, labels = defaultAdminLabels }: AdminChecklistProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const config = statusConfig[item.status];
        const Icon = config.icon;

        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full ring-1",
                  config.className,
                )}
              >
                <Icon aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {labels.checklistLabels[item.label] ?? item.label}
              </span>
            </div>
            <span className={cn("text-xs font-semibold", config.textClassName)}>
              {labels.statuses[item.status] ?? item.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
