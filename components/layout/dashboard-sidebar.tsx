import {
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { DashboardNavItem } from "@/components/layout/dashboard-nav-item";
import { currentOrganization } from "@/lib/mock-data";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout" },
  { href: "/dashboard/company", label: "Company Profile", icon: "building" },
  { href: "/dashboard/questionnaire", label: "Questionnaire", icon: "clipboard-check" },
  { href: "/dashboard/documents", label: "Evidence Room", icon: "file-text" },
  { href: "/dashboard/passport", label: "Passport", icon: "shield" },
  { href: "/dashboard/share-links", label: "Share Links", icon: "link" },
  { href: "/dashboard/activity", label: "Activity", icon: "activity" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <nav className="flex flex-col gap-1.5">
          {navigation.map((item) => (
            <DashboardNavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold leading-5 text-slate-950">
                  {currentOrganization.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Plan: {currentOrganization.plan}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                Verified
              </Badge>
            </div>
            <p className="text-xs font-medium text-slate-500">Renewal: May 12, 2025</p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <HelpCircle aria-hidden="true" className="size-5" />
            </div>
            <p className="text-sm font-semibold text-slate-950">Need help?</p>
            <p className="mt-1 text-sm text-slate-600">Visit our Help Center</p>
          </section>
        </div>
      </div>
    </aside>
  );
}
