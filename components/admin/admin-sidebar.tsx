import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { AdminNavItem } from "@/components/admin/admin-nav-item";

const adminNavigation = [
  { href: "/admin/organizations", label: "Organizations", icon: "building" },
  { href: "/admin/reviews", label: "Reviews", icon: "file-check" },
  { href: "/admin/documents", label: "Documents", icon: "file-text" },
  { href: "/admin/passports", label: "Passports", icon: "shield" },
  { href: "/admin/share-links", label: "Share Links", icon: "link" },
  { href: "/admin/notes", label: "Notes", icon: "notes" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
] as const;

export function AdminSidebar() {
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
            ADMIN
          </Badge>
          <nav className="flex flex-col gap-1.5">
            {adminNavigation.map((item) => (
              <AdminNavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <section className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback className="bg-slate-950 text-white">AM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-slate-950">Anna Müller</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Concierge Admin</p>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
