"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type ReadinessPoint = {
  day: string;
  readiness: number;
};

type ReadinessChartCardProps = {
  data: readonly ReadinessPoint[];
  improvementText: string;
  rangeLabel: string;
  endValue: number;
  labels?: DashboardOverviewLabels;
};

export function ReadinessChartCard({
  data,
  improvementText,
  rangeLabel,
  endValue,
  labels = defaultDashboardOverviewLabels,
}: ReadinessChartCardProps) {
  return (
    <SectionCard
      title={labels.readinessOverTime}
      description={improvementText}
      action={
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
          {rangeLabel}
        </Badge>
      }
      className="h-full"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{labels.endValue}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{endValue}%</p>
        </div>
      </div>
      {data.length ? (
        <div className="w-full overflow-x-auto">
          <LineChart
            width={720}
            height={288}
            data={[...data]}
            margin={{ top: 10, right: 18, bottom: 0, left: -20 }}
          >
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: "#0B5CFF", strokeOpacity: 0.18 }}
              contentStyle={{
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
              }}
            />
            <Line
              type="monotone"
              dataKey="readiness"
              stroke="#0B5CFF"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0B5CFF", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
          {labels.noReadinessTrend}
        </p>
      )}
    </SectionCard>
  );
}
