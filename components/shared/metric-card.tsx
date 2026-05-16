import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "blue" | "teal" | "green" | "amber" | "purple";

const toneStyles: Record<MetricTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  purple: "bg-violet-50 text-violet-700 ring-violet-100",
};

type MetricCardProps = {
  title: string;
  value: string;
  helper: string;
  trend?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  className?: string;
};

export function MetricCard({
  title,
  value,
  helper,
  trend,
  icon: Icon,
  tone = "blue",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("supplier-surface rounded-2xl border-0", className)}>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>
          <div className={cn("flex size-11 items-center justify-center rounded-xl ring-1", toneStyles[tone])}>
            <Icon aria-hidden="true" className="size-5" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{helper}</p>
          {trend ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {trend}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
