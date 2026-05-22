import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { DashboardOrganizationSelector } from "@/components/layout/dashboard-organization-selector";
import { DashboardUserAvatar } from "@/components/layout/dashboard-user-avatar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { type DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardTopbarProps = {
  labels: DashboardShellLabels;
};

export function DashboardTopbar({ labels }: DashboardTopbarProps) {
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
          <DashboardOrganizationSelector fallbackName={labels.workspace} />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden xl:inline-flex" />
          <DashboardUserAvatar fallbackLabel={labels.account} logoutLabel={labels.logOut} />
        </div>
      </div>
    </header>
  );
}
