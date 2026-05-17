import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

type AdminLayoutProps = {
  children: ReactNode;
  labels?: AdminLabels;
  localePrefix?: string;
};

export function AdminLayout({
  children,
  labels = defaultAdminLabels,
  localePrefix = "",
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar labels={labels} localePrefix={localePrefix} />
        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
