import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { AdminNavItem } from "@/components/admin/admin-nav-item";
import { adminNavigation } from "@/lib/admin-navigation";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

export function AdminSidebar({
  labels = defaultAdminLabels,
  localePrefix = "",
}: {
  labels?: AdminLabels;
  localePrefix?: string;
}) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <div>
          <Badge
            variant="outline"
            className="mb-3 rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-500"
          >
            {labels.admin}
          </Badge>
          <nav className="flex flex-col gap-1.5">
            {adminNavigation.map((item) => (
              <AdminNavItem
                key={item.href}
                {...item}
                href={`${localePrefix}${item.href}`}
                label={labels.navigation[item.label] ?? item.label}
              />
            ))}
          </nav>
          <Link
            href={`${localePrefix}/dashboard`}
            className="admin-ghost-link mt-4 flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            {labels.backToDashboard}
          </Link>
        </div>

        <section className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{labels.conciergeDashboard}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{labels.adminWorkspace}</p>
        </section>
      </div>
    </aside>
  );
}
