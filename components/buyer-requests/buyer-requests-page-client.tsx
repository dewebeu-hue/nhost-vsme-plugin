"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { CalendarDays, Plus, Send } from "lucide-react";
import { ContextualHelpCard } from "@/components/onboarding/contextual-help";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buyerRequestSectionCodes,
  type BuyerRequest,
  type BuyerRequestInput,
  type BuyerRequestSectionCode,
} from "@/lib/buyer-requests";
import {
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import {
  defaultBuyerRequestLabels,
  formatBuyerRequestLabel,
  type BuyerRequestLabels,
} from "@/components/buyer-requests/buyer-request-labels";

type BuyerRequestsPayload = {
  ok?: boolean;
  requests?: BuyerRequest[];
  request?: BuyerRequest;
  error?: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type BuyerRequestsPageClientProps = {
  labels?: BuyerRequestLabels;
};

const emptyForm = {
  buyerName: "",
  buyerContactName: "",
  buyerContactEmail: "",
  requestTitle: "",
  requestDescription: "",
  dueDate: "",
  notes: "",
};

export function BuyerRequestsPageClient({
  labels = defaultBuyerRequestLabels,
}: BuyerRequestsPageClientProps) {
  const locale = useLocale();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedSections, setSelectedSections] = useState<BuyerRequestSectionCode[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      const response = await fetchWithAuth("/api/buyer-requests", { method: "GET" });

      if (cancelled) {
        return;
      }

      if (!response) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as BuyerRequestsPayload;

      if (!response.ok || !payload.requests) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      setRequests(payload.requests);
      setMessage(null);
      setIsLoading(false);
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [labels.loadError]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((left, right) => {
        if (!left.due_date && !right.due_date) return 0;
        if (!left.due_date) return 1;
        if (!right.due_date) return -1;
        return left.due_date.localeCompare(right.due_date);
      }),
    [requests],
  );

  async function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.buyerName.trim() || !form.requestTitle.trim()) {
      setMessage({ tone: "error", text: labels.validationRequired });
      return;
    }

    if (form.buyerContactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerContactEmail.trim())) {
      setMessage({ tone: "error", text: labels.validationEmail });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    const input: BuyerRequestInput = {
      buyerName: form.buyerName,
      buyerContactName: form.buyerContactName,
      buyerContactEmail: form.buyerContactEmail,
      requestTitle: form.requestTitle,
      requestDescription: form.requestDescription,
      dueDate: form.dueDate,
      requestedSections: selectedSections,
      notes: form.notes,
      status: "draft",
    };
    const response = await fetchWithAuth("/api/buyer-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    setIsCreating(false);

    if (!response) {
      setMessage({ tone: "error", text: labels.createError });
      return;
    }

    const payload = (await response.json()) as BuyerRequestsPayload;

    if (!response.ok || !payload.request) {
      setMessage({ tone: "error", text: labels.createError });
      return;
    }

    setRequests((current) => [payload.request as BuyerRequest, ...current]);
    setForm(emptyForm);
    setSelectedSections([]);
    setMessage({ tone: "success", text: labels.createRequest });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>
      </header>

      {message ? <BuyerRequestMessage message={message} /> : null}

      <ContextualHelpCard
        title={labels.contextualHelpTitle}
        text={`${labels.contextualHelpText} ${labels.noEmailHelpText}`}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="supplier-surface overflow-hidden rounded-2xl border-0">
          {isLoading ? (
            <div className="p-6 text-sm font-medium text-slate-500">{labels.loading}</div>
          ) : sortedRequests.length ? (
            <div className="divide-y divide-slate-100">
              {sortedRequests.map((request) => (
                <article key={request.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {labels.statuses[request.status]}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {formatDueLabel(request.due_date, request.status, locale, labels)}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                      {request.request_title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {request.buyer_name}
                      {request.buyer_contact_name ? ` - ${request.buyer_contact_name}` : ""}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {formatBuyerRequestLabel(labels.sectionCount, {
                        count: request.requested_sections.length,
                      })}{" "}
                      - {formatBuyerRequestLabel(labels.lastUpdated, {
                        date: formatDate(request.updated_at.slice(0, 10), locale),
                      })}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {labels.requestReadiness}: {request.readiness?.readinessPercent ?? 0}%
                      {" - "}
                      {formatBuyerRequestLabel(labels.missingActionsSummary, {
                        count: request.readiness?.missingActionsCount ?? 0,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-fit bg-white"
                    render={<Link href={`/${locale}/dashboard/buyer-requests/${request.id}`} prefetch={false} />}
                  >
                    {labels.openRequest}
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {labels.emptyTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {labels.emptyDescription}
              </p>
            </div>
          )}
        </div>

        <form className="supplier-surface rounded-2xl border-0 p-5" onSubmit={handleCreateRequest}>
          <div className="mb-5 flex items-center gap-2">
            <Plus aria-hidden="true" className="size-5 text-blue-700" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.createRequest}
            </h2>
          </div>
          <div className="grid gap-4">
            <Field label={labels.buyerName} name="buyerName" value={form.buyerName} onChange={setFormValue} />
            <Field label={labels.buyerContactName} name="buyerContactName" value={form.buyerContactName} onChange={setFormValue} />
            <Field label={labels.buyerContactEmail} name="buyerContactEmail" type="email" value={form.buyerContactEmail} onChange={setFormValue} />
            <Field label={labels.requestTitle} name="requestTitle" value={form.requestTitle} onChange={setFormValue} />
            <Field label={labels.dueDate} name="dueDate" type="date" value={form.dueDate} onChange={setFormValue} />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {labels.requestDescription}
              <Textarea
                name="requestDescription"
                value={form.requestDescription}
                onChange={(event) => setFormValue("requestDescription", event.target.value)}
                className="min-h-24 bg-white"
              />
            </label>
            <section>
              <p className="mb-3 text-sm font-semibold text-slate-700">{labels.requestedSections}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {buyerRequestSectionCodes.map((code) => (
                  <label key={code} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">
                    <Checkbox
                      name="requestedSections"
                      checked={selectedSections.includes(code)}
                      onCheckedChange={(checked) => {
                        setSelectedSections((current) =>
                          checked ? [...current, code] : current.filter((item) => item !== code),
                        );
                      }}
                    />
                    {labels.sections[code]}
                  </label>
                ))}
              </div>
            </section>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {labels.notes}
              <Textarea
                name="notes"
                value={form.notes}
                onChange={(event) => setFormValue("notes", event.target.value)}
                className="min-h-24 bg-white"
              />
            </label>
            <Button type="submit" disabled={isCreating}>
              <Send data-icon="inline-start" />
              {isCreating ? labels.creating : labels.saveRequest}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );

  function setFormValue(name: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }
}

function Field({
  label,
  name,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  name: keyof typeof emptyForm;
  value: string;
  type?: string;
  onChange: (name: keyof typeof emptyForm, value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="bg-white"
      />
    </label>
  );
}

function BuyerRequestMessage({ message }: { message: MessageState }) {
  const styles = {
    info: "border-blue-100 bg-blue-50 text-blue-800",
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    error: "border-red-100 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[message.tone]}`}>
      {message.text}
    </div>
  );
}

async function fetchWithAuth(input: string, init: RequestInit) {
  const session = await getFreshBrowserNhostSession();

  if (!session?.accessToken) {
    return null;
  }

  let response = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await forceRefreshBrowserNhostSession();

    if (refreshed?.accessToken) {
      response = await fetch(input, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    }
  }

  return response;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDueLabel(
  value: string | null,
  status: BuyerRequest["status"],
  locale: string,
  labels: BuyerRequestLabels,
) {
  if (!value) {
    return labels.noDueDate;
  }

  const dueState = getDueState(value, status);

  if (dueState.state === "overdue") {
    return `${formatBuyerRequestLabel(labels.overdueByDays, { count: dueState.days })} - ${formatDate(value, locale)}`;
  }

  if (dueState.state === "today") {
    return `${labels.dueToday} - ${formatDate(value, locale)}`;
  }

  if (dueState.state === "dueSoon") {
    return `${formatBuyerRequestLabel(labels.dueInDays, { count: dueState.days })} - ${formatDate(value, locale)}`;
  }

  return formatDate(value, locale);
}

function getDueState(value: string, status: BuyerRequest["status"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value}T00:00:00`);

  if (Number.isNaN(due.getTime())) {
    return { state: "none", days: 0 };
  }

  if (status === "closed") {
    return { state: "ok", days: 0 };
  }

  const dayDifference = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (dayDifference === 0) {
    return { state: "today", days: 0 };
  }

  if (due < today) {
    return { state: "overdue", days: Math.abs(dayDifference) };
  }

  return dayDifference <= 7
    ? { state: "dueSoon", days: dayDifference }
    : { state: "ok", days: dayDifference };
}
