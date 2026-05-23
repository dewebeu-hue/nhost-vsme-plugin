import Link from "next/link";
import { Building2 } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardBuyerRequest = {
  id: string;
  buyer: string;
  module: string;
  status: "In progress" | "Requested" | "Not started" | "Shared" | "Completed";
  dueDate: string | null;
};

type BuyerRequestsCardProps = {
  requests: DashboardBuyerRequest[];
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
  compact?: boolean;
};

const statusTone: Record<DashboardBuyerRequest["status"], "blue" | "amber" | "slate"> = {
  "In progress": "blue",
  Requested: "amber",
  "Not started": "slate",
  Shared: "blue",
  Completed: "slate",
};

export function BuyerRequestsCard({
  requests,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
  compact = false,
}: BuyerRequestsCardProps) {
  return (
    <SectionCard
      title={labels.recentBuyerRequests}
      description={compact ? undefined : labels.buyerRequestsDescription}
      className="h-full"
      action={compact ? (
        <Link
          href={`${localePrefix}/dashboard/buyer-requests`}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          {labels.viewAll}
        </Link>
      ) : undefined}
    >
      <div className="flex flex-col divide-y divide-slate-100">
        {requests.length ? requests.slice(0, compact ? 3 : requests.length).map((request) => (
          <Link
            key={request.id}
            href={`${localePrefix}/dashboard/buyer-requests/${request.id}`}
            className="grid gap-3 rounded-xl px-2 py-3 transition first:pt-0 last:pb-0 hover:bg-blue-50/50 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-semibold text-slate-950">{request.buyer}</p>
              <p className="mt-1 text-sm text-slate-500">{request.module}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <DashboardStatusPill tone={statusTone[request.status]}>
                {labels.statuses[request.status] ?? request.status}
              </DashboardStatusPill>
              {request.dueDate ? (
                <span className="text-sm font-medium text-slate-500">
                  {labels.due} {formatDate(request.dueDate)}
                </span>
              ) : null}
            </div>
          </Link>
        )) : (
          <div className="premium-empty-state flex gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Building2 aria-hidden="true" className="size-4" />
            </span>
            <span>{labels.noBuyerRequests}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
