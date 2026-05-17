import { AlertTriangle, FileCheck2, Files, Link2 } from "lucide-react";
import type { EvidenceRoomMetric } from "@/lib/mock-data";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

type DocumentsMetricCardsProps = {
  metrics: EvidenceRoomMetric[];
  labels?: DocumentsLabels;
};

const icons = [Files, Link2, FileCheck2, AlertTriangle] as const;

export function DocumentsMetricCards({
  metrics,
  labels = defaultDocumentsLabels,
}: DocumentsMetricCardsProps) {
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
                <p className="text-sm font-medium text-slate-500">
                  {translateMetricLabel(metric.label, labels)}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {metric.value}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon aria-hidden="true" className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {translateMetricDetail(metric.detail, labels)}
            </p>
          </article>
        );
      })}
    </section>
  );
}

function translateMetricLabel(label: string, labels: DocumentsLabels) {
  const map: Record<string, string> = {
    "Total documents": labels.totalDocuments,
    "Linked to answers": labels.linkedToAnswers,
    "Needs review": labels.needsReview,
    "Expiring soon": labels.expiringSoon,
  };

  return map[label] ?? label;
}

function translateMetricDetail(detail: string, labels: DocumentsLabels) {
  if (detail === "Next 90 days") {
    return labels.next90Days;
  }

  if (detail === "Live evidence files") {
    return labels.liveEvidenceFiles;
  }

  if (detail === "Awaiting validation") {
    return labels.awaitingValidation;
  }

  const thisMonth = detail.match(/^\+(\d+) this month$/);
  if (thisMonth) {
    return labels.thisMonth.replace("{count}", thisMonth[1]);
  }

  const percent = detail.match(/^(\d+)% of total$/);
  if (percent) {
    return labels.percentOfTotal.replace("{percent}", percent[1]);
  }

  return detail;
}
