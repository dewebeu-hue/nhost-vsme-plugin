"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { AdminThemeToggle } from "@/components/admin/admin-theme-provider";
import { getBrowserNhostClient, getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import { cn } from "@/lib/utils";

export function AdminAccountControls({ labels = defaultAdminLabels }: { labels?: AdminLabels }) {
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [initials, setInitials] = useState("A");

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

    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Link
        href={`/${locale}/dashboard`}
        className={cn(buttonVariants({ variant: "outline" }), "admin-secondary-action rounded-xl bg-white")}
      >
        {labels.backToDashboard}
      </Link>
      <AdminThemeToggle labels={labels} />
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
  );
}

function createInitials(value: string) {
  const parts = value
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean);

  return (parts[0]?.[0] ?? "A").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
