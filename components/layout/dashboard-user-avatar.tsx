"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";

type DashboardUserAvatarProps = {
  fallbackLabel: string;
};

export function DashboardUserAvatar({ fallbackLabel }: DashboardUserAvatarProps) {
  const [initials, setInitials] = useState(createInitials(fallbackLabel));

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

  return (
    <Avatar className="size-10 border border-slate-200">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

function createInitials(value: string) {
  const parts = value
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean);

  return (parts[0]?.[0] ?? "A").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
