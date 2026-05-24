import Link from "next/link";
import { Link2 } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";

type DashboardShareLink = {
  buyer: string;
  module: string;
  status: "Active";
  expires: string;
  publicPath?: string;
};

type ActiveShareLinksCardProps = {
  links: DashboardShareLink[];
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
  compact?: boolean;
};

export function ActiveShareLinksCard({
  links,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
  compact = false,
}: ActiveShareLinksCardProps) {
  return (
    <SectionCard
      title={labels.activeShareLinks}
      description={compact ? undefined : labels.activeShareLinksDescription}
      className="h-full"
      contentClassName={compact ? "pt-0" : undefined}
      action={compact ? (
        <Link
          href={`${localePrefix}/dashboard/share`}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          {labels.setupChecklist.sharePublicLinkCta}
        </Link>
      ) : undefined}
    >
      <div className={compact ? "flex flex-col gap-2.5" : "flex flex-col gap-3"}>
        {links.length ? links.slice(0, compact ? 3 : links.length).map((link) => (
          <div
            key={`${link.buyer}-${link.expires}`}
            className="premium-surface-interactive flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Link2 aria-hidden="true" className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">
                  {link.buyer === "public_supplier_passport"
                    ? labels.publicSupplierPassport
                    : link.buyer}
                </p>
                <DashboardStatusPill tone="green">
                  {labels.statuses[link.status] ?? link.status}
                </DashboardStatusPill>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {link.module} - {labels.expires} {formatExpiry(link.expires, labels)}
              </p>
            </div>
          </div>
        )) : (
          <div className="premium-empty-state flex gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Link2 aria-hidden="true" className="size-4" />
            </span>
            <span>{labels.noActiveShareLinks}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function formatExpiry(value: string, labels: DashboardOverviewLabels) {
  if (!value) {
    return labels.noExpiry;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
