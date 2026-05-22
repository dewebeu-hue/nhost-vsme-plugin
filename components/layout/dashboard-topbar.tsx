"use client";

import { Menu } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { DashboardNavItem } from "@/components/layout/dashboard-nav-item";
import { DashboardOrganizationSelector } from "@/components/layout/dashboard-organization-selector";
import { DashboardUserAvatar } from "@/components/layout/dashboard-user-avatar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { dashboardNavigation } from "@/lib/dashboard-navigation";
import { type DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardTopbarProps = {
  labels: DashboardShellLabels;
};

export function DashboardTopbar({ labels }: DashboardTopbarProps) {
  const locale = useLocale();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden shrink-0 sm:block lg:hidden">
            <Logo />
          </div>
          <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label={labels.openNavigation}
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(22rem,calc(100vw-2rem))] bg-white p-0">
              <SheetHeader className="border-b border-slate-200 px-5 py-4">
                <Logo />
                <SheetTitle className="sr-only">{labels.openNavigation}</SheetTitle>
                <SheetDescription className="sr-only">{labels.workspace}</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-1.5 overflow-y-auto px-4 py-5">
                {dashboardNavigation.map((item) => (
                  <DashboardNavItem
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    label={labels.navigation[item.labelKey]}
                    icon={item.icon}
                    onClick={() => setIsNavigationOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <DashboardOrganizationSelector fallbackName={labels.workspace} />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden xl:inline-flex" />
          <DashboardUserAvatar fallbackLabel={labels.account} logoutLabel={labels.logOut} />
        </div>
      </div>
    </header>
  );
}
