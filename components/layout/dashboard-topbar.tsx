import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { DashboardOrganizationSelector } from "@/components/layout/dashboard-organization-selector";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { type DashboardShellLabels } from "@/lib/dashboard-labels";
import { currentOrganization, currentUser } from "@/lib/mock-data";

type DashboardTopbarProps = {
  labels: DashboardShellLabels;
};

export function DashboardTopbar({ labels }: DashboardTopbarProps) {
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
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={labels.openNavigation}>
            <Menu />
          </Button>
          <DashboardOrganizationSelector fallbackName={currentOrganization.name} />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden xl:inline-flex" />
          <Badge
            variant="outline"
            className="hidden rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 md:inline-flex"
          >
            {labels.verifiedSupplier}
          </Badge>
          <Button variant="outline" size="icon" aria-label={labels.notifications}>
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
