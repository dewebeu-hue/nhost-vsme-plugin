import {
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DashboardNavItem } from "@/components/layout/dashboard-nav-item";
import { DashboardSidebarWorkspaceCard } from "@/components/layout/dashboard-sidebar-workspace-card";
import { dashboardNavigation } from "@/lib/dashboard-navigation";
import { type DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardSidebarProps = {
  labels: DashboardShellLabels;
  localePrefix?: string;
};

export function DashboardSidebar({ labels, localePrefix = "" }: DashboardSidebarProps) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <nav className="flex flex-col gap-1.5">
          {dashboardNavigation.map((item) => (
            <DashboardNavItem
              key={item.href}
              href={`${localePrefix}${item.href}`}
              label={labels.navigation[item.labelKey]}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <DashboardSidebarWorkspaceCard labels={labels} />

          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <HelpCircle aria-hidden="true" className="size-5" />
            </div>
            <p className="text-sm font-semibold text-slate-950">{labels.needHelp}</p>
            <p className="mt-1 text-sm text-slate-600">{labels.helpCenter}</p>
          </section>
        </div>
      </div>
    </aside>
  );
}
