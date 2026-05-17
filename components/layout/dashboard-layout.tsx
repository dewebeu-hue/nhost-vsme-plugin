import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { defaultDashboardShellLabels, type DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardLayoutProps = {
  children: ReactNode;
  labels?: DashboardShellLabels;
  localePrefix?: string;
};

export function DashboardLayout({
  children,
  labels = defaultDashboardShellLabels,
  localePrefix = "",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <DashboardSidebar labels={labels} localePrefix={localePrefix} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar labels={labels} />
          <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
