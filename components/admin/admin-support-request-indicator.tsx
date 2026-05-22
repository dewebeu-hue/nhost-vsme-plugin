"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { cn } from "@/lib/utils";

type AdminSupportRequestIndicatorProps = {
  href: string;
  label: string;
  mode?: "badge" | "bell";
};

type SupportRequestsPayload = {
  requests?: Array<{ status: string }>;
};

export function AdminSupportRequestIndicator({
  href,
  label,
  mode = "badge",
}: AdminSupportRequestIndicatorProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      const session = await getFreshBrowserNhostSession();

      if (!session?.accessToken) {
        return;
      }

      try {
        const response = await fetch("/api/admin/support-requests", {
          headers: { authorization: `Bearer ${session.accessToken}` },
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as SupportRequestsPayload;
        const openCount = payload.requests?.filter((request) => request.status === "open").length ?? 0;

        if (!cancelled) {
          setCount(openCount);
        }
      } catch {
        // Keep the notification indicator quiet if the admin API is unavailable.
      }
    }

    void loadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === "bell") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="admin-secondary-action relative rounded-xl bg-white"
        aria-label={label}
        title={label}
        render={<Link href={href} />}
      >
        <Bell aria-hidden="true" />
        {count > 0 ? <CountBubble count={count} className="-right-1 -top-1" /> : null}
      </Button>
    );
  }

  return count > 0 ? <CountBubble count={count} /> : null;
}

function CountBubble({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
