import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import type { DashboardBuyerRequest } from "@/lib/mock-data";

type BuyerRequestsCardProps = {
  requests: DashboardBuyerRequest[];
};

const statusTone: Record<DashboardBuyerRequest["status"], "blue" | "amber" | "slate"> = {
  "In progress": "blue",
  Requested: "amber",
  "Not started": "slate",
};

export function BuyerRequestsCard({ requests }: BuyerRequestsCardProps) {
  return (
    <SectionCard
      title="Recent buyer requests"
      description="Latest buyer requests and deadlines."
      className="h-full"
    >
      <div className="flex flex-col divide-y divide-slate-100">
        {requests.map((request) => (
          <div key={`${request.buyer}-${request.dueDate}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold text-slate-950">{request.buyer}</p>
              <p className="mt-1 text-sm text-slate-500">{request.module}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <DashboardStatusPill tone={statusTone[request.status]}>
                {request.status}
              </DashboardStatusPill>
              <span className="text-sm font-medium text-slate-500">Due {request.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
