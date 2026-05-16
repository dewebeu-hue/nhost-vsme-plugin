import { AlertTriangle, FileCheck2, Files, Link2 } from "lucide-react";
import type { EvidenceRoomMetric } from "@/lib/mock-data";

type DocumentsMetricCardsProps = {
  metrics: EvidenceRoomMetric[];
};

const icons = [Files, Link2, FileCheck2, AlertTriangle] as const;

export function DocumentsMetricCards({ metrics }: DocumentsMetricCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons[index];

        return (
          <article
            key={metric.label}
            className="supplier-surface rounded-2xl border-0 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {metric.value}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon aria-hidden="true" className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{metric.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
