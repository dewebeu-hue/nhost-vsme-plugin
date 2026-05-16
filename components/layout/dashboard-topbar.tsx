import { Bell, ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { currentOrganization, currentUser } from "@/lib/mock-data";

export function DashboardTopbar() {
  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <Menu />
          </Button>
          <button className="hidden min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition-colors hover:bg-slate-50 sm:flex">
            <span className="min-w-0 truncate text-sm font-semibold text-slate-950">
              {currentOrganization.name}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 md:inline-flex"
          >
            Verified supplier
          </Badge>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell />
          </Button>
          <Avatar className="size-10 border border-slate-200">
            <AvatarImage src={currentUser.avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
