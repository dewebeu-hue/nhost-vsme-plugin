"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearCurrentOrganizationCache } from "@/lib/current-organization-client";
import { getBrowserNhostClient, getFreshBrowserNhostSession } from "@/lib/nhost/client";

type DashboardUserAvatarProps = {
  fallbackLabel: string;
  logoutLabel: string;
};

export function DashboardUserAvatar({ fallbackLabel, logoutLabel }: DashboardUserAvatarProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [initials, setInitials] = useState(createInitials(fallbackLabel));
  const menuRef = useRef<HTMLDivElement | null>(null);

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

      setInitials(
        createInitials(
          user.displayName ||
            user.metadata?.displayName ||
            user.metadata?.fullName ||
            user.metadata?.name ||
            user.email ||
            fallbackLabel,
        ),
      );
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [fallbackLabel]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
    setIsOpen(false);
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Avatar className="size-10 border border-slate-200">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="size-4" />
            {logoutLabel}
          </button>
        </div>
      ) : null}
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
