import type { ReactNode } from "react";
import { AdminAccountControls } from "@/components/admin/admin-account-controls";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider";
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
    <AdminThemeProvider>
      <div className="flex min-h-screen">
        <AdminSidebar labels={labels} localePrefix={localePrefix} />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
            <AdminAccountControls labels={labels} />
          </header>
          <main className="px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
