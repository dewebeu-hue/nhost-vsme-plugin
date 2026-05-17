import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, DatabaseZap, FileText, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateCardTone = "info" | "success" | "warning" | "error" | "empty" | "secure";

type StateCardProps = {
  title: string;
  description: string;
  tone?: StateCardTone;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const toneStyles: Record<StateCardTone, string> = {
  info: "border-blue-100 bg-blue-50/70 text-blue-700",
  success: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  warning: "border-amber-100 bg-amber-50/80 text-amber-700",
  error: "border-red-100 bg-red-50/80 text-red-700",
  empty: "border-slate-200 bg-slate-50 text-slate-500",
  secure: "border-teal-100 bg-teal-50/70 text-teal-700",
};

const defaultIcons: Record<StateCardTone, LucideIcon> = {
  info: DatabaseZap,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  empty: FileText,
  secure: LockKeyhole,
};

export function StateCard({
  title,
  description,
  tone = "empty",
  icon,
  actionLabel,
  onAction,
  className,
}: StateCardProps) {
  const Icon = icon ?? defaultIcons[tone];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm shadow-slate-200/70",
        className,
      )}
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              toneStyles[tone],
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-950">{title}</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>
        {actionLabel ? (
          <Button variant="outline" className="w-fit shrink-0 bg-white" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
