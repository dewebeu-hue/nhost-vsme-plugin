import { cn } from "@/lib/utils";

type DashboardStatusPillProps = {
  children: string;
  tone?: "blue" | "teal" | "green" | "amber" | "slate";
};

const toneStyles: Record<NonNullable<DashboardStatusPillProps["tone"]>, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export function DashboardStatusPill({
  children,
  tone = "slate",
}: DashboardStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}
