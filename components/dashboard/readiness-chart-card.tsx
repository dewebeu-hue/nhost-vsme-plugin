"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type ReadinessPoint = {
  date: string;
  dayLabel: string;
  readinessPercent: number;
};

type ReadinessChartCardProps = {
  data: readonly ReadinessPoint[];
  latestValue: number;
  lastUpdated: string;
  labels?: DashboardOverviewLabels;
};

export function ReadinessChartCard({
  data,
  latestValue,
  lastUpdated,
  labels = defaultDashboardOverviewLabels,
}: ReadinessChartCardProps) {
  const hasMultiplePoints = data.length > 1;

  return (
    <SectionCard
      title={labels.readinessOverTime}
      description={labels.readinessHistoryDescription}
      action={
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
          {lastUpdated}
        </Badge>
      }
      className="h-full"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{labels.currentReadiness}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{latestValue}%</p>
        </div>
      </div>

      {hasMultiplePoints ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...data]} margin={{ top: 10, right: 18, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                minTickGap={20}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "#0B5CFF", strokeOpacity: 0.18 }}
                formatter={(value) => [`${value}%`, labels.currentReadiness]}
                labelFormatter={(_, payload) => payload[0]?.payload?.date ?? ""}
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
                }}
              />
              <Line
                type="monotone"
                dataKey="readinessPercent"
                name={labels.currentReadiness}
                stroke="#0B5CFF"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0B5CFF", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : data.length === 1 ? (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">{data[0].date}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {data[0].readinessPercent}%
              </p>
            </div>
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-semibold text-blue-700">
              {labels.currentReadiness}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {labels.readinessHistoryStartsToday}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
          {labels.noReadinessTrend}
        </p>
      )}
    </SectionCard>
  );
}
