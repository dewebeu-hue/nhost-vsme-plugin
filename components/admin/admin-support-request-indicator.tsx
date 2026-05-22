"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { type AdminLabels, defaultAdminLabels } from "@/lib/operational-labels";
import type { SupportRequestSummary } from "@/lib/support-requests";
import { cn } from "@/lib/utils";

type AdminSupportRequestIndicatorProps = {
  href: string;
  label: string;
  labels?: AdminLabels;
  mode?: "badge" | "bell";
};

type SupportRequestsPayload = {
  requests?: SupportRequestSummary[];
};

export function AdminSupportRequestIndicator({
  href,
  label,
  labels = defaultAdminLabels,
  mode = "badge",
}: AdminSupportRequestIndicatorProps) {
  const [requests, setRequests] = useState<SupportRequestSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const openRequests = useMemo(
    () =>
      requests
        .filter((request) => request.status === "open")
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [requests],
  );
  const count = openRequests.length;
  const recentRequests = openRequests.slice(0, 5);

  const loadRequests = useCallback(async () => {
    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      return;
    }

    try {
      const response = await fetch("/api/admin/support-requests", {
        headers: { authorization: `Bearer ${session.accessToken}` },
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as SupportRequestsPayload;
      setRequests(payload.requests ?? []);
    } catch {
      // Keep the notification indicator quiet if the admin API is unavailable.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialRequests() {
      if (cancelled) {
        return;
      }

      await loadRequests();
    }

    void loadInitialRequests();

    return () => {
      cancelled = true;
    };
  }, [loadRequests]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (mode === "bell") {
    return (
      <div ref={dropdownRef} className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="admin-secondary-action relative rounded-xl bg-white"
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          title={label}
          onClick={() => {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);

            if (nextOpen) {
              void loadRequests();
            }
          }}
        >
          <Bell aria-hidden="true" />
          {count > 0 ? <CountBubble count={count} className="-right-1 -top-1" /> : null}
        </Button>

        {isOpen ? (
          <div
            role="dialog"
            aria-label={labels.supportNotificationTitle}
            className="admin-notification-popover absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">
                  {labels.supportNotificationTitle}
                </p>
                {count > 0 ? <Badge variant="secondary">{count}</Badge> : null}
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {count > 0 ? labels.supportNotificationRecent : labels.openSupportRequests}
              </p>
            </div>

            {recentRequests.length ? (
              <div className="max-h-[22rem] overflow-y-auto py-1">
                {recentRequests.map((request) => (
                  <SupportNotificationItem
                    key={request.id}
                    href={`${href}?requestId=${encodeURIComponent(request.id)}`}
                    labels={labels}
                    request={request}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm font-medium text-slate-500">
                {labels.supportNotificationEmpty}
              </p>
            )}

            <div className="border-t border-slate-100 p-2">
              <Link
                href={href}
                className="flex rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setIsOpen(false)}
              >
                {labels.supportNotificationViewAll}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return count > 0 ? <CountBubble count={count} /> : null;
}

function SupportNotificationItem({
  href,
  labels,
  request,
  onClick,
}: {
  href: string;
  labels: AdminLabels;
  request: SupportRequestSummary;
  onClick: () => void;
}) {
  const requester = request.requesterName || request.requesterEmail;
  const preview = request.subject || request.message;

  return (
    <Link
      href={href}
      className="block border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {request.organizationName}
          </p>
          {requester ? (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{requester}</p>
          ) : null}
        </div>
        <Badge className="shrink-0" variant="secondary">
          {labels.supportStatuses[request.status]}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {request.category ? (
          <span>{labels.supportCategories[request.category] ?? request.category}</span>
        ) : null}
        <span>{formatShortDate(request.createdAt)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-700">
        {createExcerpt(preview)}
      </p>
    </Link>
  );
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

function createExcerpt(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 100) {
    return normalized;
  }

  return `${normalized.slice(0, 97)}...`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
