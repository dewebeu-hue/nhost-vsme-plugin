import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardBuyerRequest = {
  buyer: string;
  module: string;
  status: "In progress" | "Requested" | "Not started";
  dueDate: string;
};

type BuyerRequestsCardProps = {
  requests: DashboardBuyerRequest[];
  labels?: DashboardOverviewLabels;
};

const statusTone: Record<DashboardBuyerRequest["status"], "blue" | "amber" | "slate"> = {
  "In progress": "blue",
  Requested: "amber",
  "Not started": "slate",
};

export function BuyerRequestsCard({
  requests,
  labels = defaultDashboardOverviewLabels,
}: BuyerRequestsCardProps) {
  return (
    <SectionCard
      title={labels.recentBuyerRequests}
      description={labels.buyerRequestsDescription}
      className="h-full"
    >
      <div className="flex flex-col divide-y divide-slate-100">
        {requests.length ? requests.map((request) => (
          <div key={`${request.buyer}-${request.dueDate}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold text-slate-950">{request.buyer}</p>
              <p className="mt-1 text-sm text-slate-500">{request.module}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <DashboardStatusPill tone={statusTone[request.status]}>
                {labels.statuses[request.status] ?? request.status}
              </DashboardStatusPill>
              <span className="text-sm font-medium text-slate-500">
                {labels.due} {request.dueDate}
              </span>
            </div>
          </div>
        )) : (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.noBuyerRequests}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
