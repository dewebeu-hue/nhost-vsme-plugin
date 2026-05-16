import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStatsWidgetData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type AdminStatsWidgetProps = {
  widget: AdminStatsWidgetData;
};

const toneStyles: Record<AdminStatsWidgetData["items"][number]["tone"], string> = {
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

export function AdminStatsWidget({ widget }: AdminStatsWidgetProps) {
  return (
    <Card className="supplier-surface rounded-2xl border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight text-slate-950">
          {widget.title}
        </CardTitle>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{widget.total}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {widget.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
          >
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-sm font-semibold",
                toneStyles[item.tone],
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
