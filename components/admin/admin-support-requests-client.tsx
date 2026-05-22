"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, LifeBuoy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { type AdminLabels, defaultAdminLabels } from "@/lib/operational-labels";
import type {
  SupportRequestPriority,
  SupportRequestStatus,
  SupportRequestSummary,
} from "@/lib/support-requests";
import { cn } from "@/lib/utils";

type AdminSupportRequestsClientProps = {
  labels?: AdminLabels;
};

type SupportRequestsPayload = {
  ok?: boolean;
  requests?: SupportRequestSummary[];
  request?: SupportRequestSummary;
};

const statusOptions = ["all", "open", "in_progress", "resolved", "closed"] as const;
const priorityOptions = ["low", "normal", "high"] as const;

export function AdminSupportRequestsClient({
  labels = defaultAdminLabels,
}: AdminSupportRequestsClientProps) {
  const [requests, setRequests] = useState<SupportRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      const response = await fetchAdminSupportRequests();

      if (cancelled) {
        return;
      }

      if (!response?.ok) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as SupportRequestsPayload;
      setRequests(payload.requests ?? []);
      setIsLoading(false);
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, [labels.loadError]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const statusMatches = statusFilter === "all" || request.status === statusFilter;
      const searchMatches =
        !normalizedSearch ||
        [
          request.organizationName,
          request.requesterName,
          request.requesterEmail,
          request.subject,
          request.message,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch));

      return statusMatches && searchMatches;
    });
  }, [requests, search, statusFilter]);

  const groupedRequests = useMemo(() => {
    const groups = new Map<string, SupportRequestSummary[]>();

    filteredRequests.forEach((request) => {
      const group = groups.get(request.organizationName) ?? [];
      group.push(request);
      groups.set(request.organizationName, group);
    });

    return Array.from(groups.entries());
  }, [filteredRequests]);

  const openCount = requests.filter((request) => request.status === "open").length;
  const inProgressCount = requests.filter((request) => request.status === "in_progress").length;
  const resolvedCount = requests.filter((request) => request.status === "resolved").length;
  const highPriorityCount = requests.filter((request) => request.priority === "high").length;

  function updateRequestInState(updated: SupportRequestSummary) {
    setRequests((current) =>
      current.map((request) => (request.id === updated.id ? updated : request)),
    );
  }

  async function handleUpdate(
    requestId: string,
    changes: Partial<{
      status: SupportRequestStatus;
      priority: SupportRequestPriority;
      adminNote: string | null;
    }>,
  ) {
    setMessage(null);
    const response = await fetchAdminSupportRequests(`/${requestId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!response?.ok) {
      setMessage({ tone: "error", text: labels.supportUpdateError });
      return;
    }

    const payload = (await response.json()) as SupportRequestsPayload;

    if (payload.request) {
      updateRequestInState(payload.request);
      setMessage({ tone: "success", text: labels.supportUpdated });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <LifeBuoy aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.supportRequests}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.supportRequestsSubtitle}
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <SupportStat label={labels.supportRequestCount} value={openCount} />
        <SupportStat label={labels.supportRequestInProgressCount} value={inProgressCount} />
        <SupportStat label={labels.supportRequestResolvedCount} value={resolvedCount} />
        <SupportStat label={labels.supportRequestHighPriorityCount} value={highPriorityCount} />
      </section>

      <section className="supplier-surface rounded-2xl border-0 p-4">
        <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="h-11 w-full bg-white">
              <SelectValue>
                {statusFilter === "all"
                  ? labels.supportFilterAll
                  : labels.supportStatuses[statusFilter]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? labels.supportFilterAll : labels.supportStatuses[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="relative">
            <span className="sr-only">{labels.supportSearchPlaceholder}</span>
            <Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              value={search}
              className="h-11 bg-white pl-9"
              placeholder={labels.supportSearchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      {message ? (
        <p
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-semibold",
            message.tone === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700",
          )}
        >
          {message.text}
        </p>
      ) : null}

      {isLoading ? (
        <section className="supplier-surface rounded-2xl border-0 p-6 text-sm font-medium text-slate-500">
          {labels.loading}
        </section>
      ) : groupedRequests.length ? (
        <section className="grid gap-5">
          {groupedRequests.map(([organizationName, group]) => (
            <div key={organizationName} className="supplier-surface rounded-2xl border-0 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950">{organizationName}</h2>
                <Badge variant="secondary">{group.length}</Badge>
              </div>
              <div className="grid gap-4">
                {group.map((request) => (
                  <SupportRequestCard
                    key={request.id}
                    request={request}
                    labels={labels}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="supplier-surface rounded-2xl border-0 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            {labels.supportRequestInboxEmpty}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {labels.supportRequestInboxEmptyDescription}
          </p>
        </section>
      )}
    </div>
  );
}

function SupportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="supplier-surface rounded-2xl border-0 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function SupportRequestCard({
  request,
  labels,
  onUpdate,
}: {
  request: SupportRequestSummary;
  labels: AdminLabels;
  onUpdate: (
    requestId: string,
    changes: Partial<{
      status: SupportRequestStatus;
      priority: SupportRequestPriority;
      adminNote: string | null;
    }>,
  ) => Promise<void>;
}) {
  const [note, setNote] = useState(request.adminNote ?? "");
  const requester = request.requesterName || request.requesterEmail || labels.notProvided;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{labels.supportStatuses[request.status]}</Badge>
            <Badge variant={request.priority === "high" ? "destructive" : "secondary"}>
              {labels.supportPriorities[request.priority]}
            </Badge>
            {request.category ? (
              <Badge variant="outline">{labels.supportCategories[request.category]}</Badge>
            ) : null}
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-950">
            {request.subject || labels.supportSubject}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {labels.supportRequester}: {requester}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {formatDate(request.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            disabled={request.status === "in_progress"}
            onClick={() => void onUpdate(request.id, { status: "in_progress" })}
          >
            {labels.supportMarkInProgress}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            disabled={request.status === "resolved"}
            onClick={() => void onUpdate(request.id, { status: "resolved" })}
          >
            {labels.supportMarkResolved}
          </Button>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        {request.message}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-end">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          {labels.supportPriority}
          <Select
            value={request.priority}
            onValueChange={(value) =>
              void onUpdate(request.id, { priority: value as SupportRequestPriority })
            }
          >
            <SelectTrigger className="h-10 w-full bg-white">
              <SelectValue>{labels.supportPriorities[request.priority]}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {priorityOptions.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {labels.supportPriorities[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          {labels.supportAdminNote}
          <Textarea value={note} rows={2} onChange={(event) => setNote(event.target.value)} />
        </label>
        <Button
          type="button"
          className="md:mb-0.5"
          onClick={() => void onUpdate(request.id, { adminNote: note })}
        >
          {labels.supportSaveNote}
        </Button>
      </div>
    </article>
  );
}

async function fetchAdminSupportRequests(path = "", init: RequestInit = {}) {
  const session = await getFreshBrowserNhostSession();

  if (!session?.accessToken) {
    return null;
  }

  return fetch(`/api/admin/support-requests${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
