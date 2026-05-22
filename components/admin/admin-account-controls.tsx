"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { AdminNavItem } from "@/components/admin/admin-nav-item";
import { AdminSupportRequestIndicator } from "@/components/admin/admin-support-request-indicator";
import { AdminThemeToggle } from "@/components/admin/admin-theme-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminNavigation } from "@/lib/admin-navigation";
import { clearCurrentOrganizationCache } from "@/lib/current-organization-client";
import { getBrowserNhostClient, getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import { cn } from "@/lib/utils";

export function AdminAccountControls({ labels = defaultAdminLabels }: { labels?: AdminLabels }) {
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [initials, setInitials] = useState("A");
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const session = await getFreshBrowserNhostSession();
      const user = session?.user as
        | {
            displayName?: string | null;
            email?: string | null;
            metadata?: { displayName?: string; name?: string; fullName?: string };
          }
        | undefined;

      if (!user || cancelled) {
        return;
      }

      const label =
        user.displayName ||
        user.metadata?.displayName ||
        user.metadata?.fullName ||
        user.metadata?.name ||
        user.email ||
        labels.adminAccount;

      setEmail(user.email ?? null);
      setInitials(createInitials(label));
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [labels.adminAccount]);

  async function handleSignOut() {
    const nhost = getBrowserNhostClient();

    if (nhost) {
      const session = nhost.getUserSession();

      try {
        if (session?.refreshToken) {
          await nhost.auth.signOut({ refreshToken: session.refreshToken });
        }
      } finally {
        nhost.clearSession();
      }
    }

    clearCurrentOrganizationCache();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="admin-secondary-action rounded-xl bg-white lg:hidden"
              aria-label={labels.adminWorkspace}
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(22rem,calc(100vw-2rem))] bg-white p-0">
          <SheetHeader className="border-b border-slate-200 px-5 py-4">
            <SheetTitle>{labels.adminWorkspace}</SheetTitle>
            <SheetDescription>{labels.conciergeDashboard}</SheetDescription>
          </SheetHeader>
          <nav className="grid gap-1.5 overflow-y-auto px-4 py-5">
            {adminNavigation.map((item) => (
              <AdminNavItem
                key={item.href}
                href={`/${locale}${item.href}`}
                label={labels.navigation[item.label] ?? item.label}
                icon={item.icon}
                badge={
                  item.label === "Support requests" ? (
                    <AdminSupportRequestIndicator
                      href={`/${locale}/admin/support-requests`}
                      label={labels.openSupportRequests}
                    />
                  ) : undefined
                }
                onClick={() => setIsNavigationOpen(false)}
              />
            ))}
            <Link
              href={`/${locale}/dashboard`}
              onClick={() => setIsNavigationOpen(false)}
              className="admin-ghost-link mt-2 flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {labels.backToDashboard}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
      <Link
        href={`/${locale}/dashboard`}
        className={cn(buttonVariants({ variant: "outline" }), "admin-secondary-action hidden rounded-xl bg-white sm:inline-flex")}
      >
        {labels.backToDashboard}
      </Link>
      <AdminThemeToggle labels={labels} />
      <AdminSupportRequestIndicator
        href={`/${locale}/admin/support-requests`}
        label={labels.openSupportRequests}
        mode="bell"
      />
      <div className="admin-account-pill flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
        <Avatar className="size-9 border border-slate-200">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{labels.signedInAs}</p>
          <p className="max-w-56 truncate text-sm font-semibold text-slate-950">
            {email ?? labels.adminAccount}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="admin-secondary-action rounded-xl bg-white"
        onClick={() => void handleSignOut()}
      >
        <LogOut data-icon="inline-start" />
        {labels.logOut}
      </Button>
      </div>
    </div>
  );
}

function createInitials(value: string) {
  const parts = value
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean);

  return (parts[0]?.[0] ?? "A").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
