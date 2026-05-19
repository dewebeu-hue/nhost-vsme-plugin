"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buyerRequestSectionCodes,
  buyerRequestStatuses,
  type BuyerRequest,
  type BuyerRequestInput,
  type BuyerRequestSectionCode,
  type BuyerRequestSectionReadiness,
  type BuyerRequestStatus,
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

type BuyerRequestDetailPayload = {
  ok?: boolean;
  request?: BuyerRequest;
  sectionReadiness?: BuyerRequestSectionReadiness[];
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type BuyerRequestDetailClientProps = {
  requestId: string;
  labels?: BuyerRequestLabels;
};

export function BuyerRequestDetailClient({
  requestId,
  labels = defaultBuyerRequestLabels,
}: BuyerRequestDetailClientProps) {
  const locale = useLocale();
  const [request, setRequest] = useState<BuyerRequest | null>(null);
  const [sectionReadiness, setSectionReadiness] = useState<BuyerRequestSectionReadiness[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BuyerRequestStatus>("draft");
  const [selectedSections, setSelectedSections] = useState<BuyerRequestSectionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      const response = await fetchWithAuth(`/api/buyer-requests/${requestId}`, { method: "GET" });

      if (cancelled) {
        return;
      }

      if (!response) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as BuyerRequestDetailPayload;

      if (!response.ok || !payload.request) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      setRequest(payload.request);
      setStatus(payload.request.status);
      setNotes(payload.request.notes ?? "");
      setSelectedSections(payload.request.requested_sections);
      setSectionReadiness(payload.sectionReadiness ?? []);
      setMessage(null);
      setIsLoading(false);
    }

    loadRequest();

    return () => {
      cancelled = true;
    };
  }, [labels.loadError, requestId]);

  async function handleSave() {
    const input: BuyerRequestInput = {
      status,
      requestedSections: selectedSections,
      notes,
    };

    setIsSaving(true);
    setMessage(null);

    const response = await fetchWithAuth(`/api/buyer-requests/${requestId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    setIsSaving(false);

    if (!response) {
      setMessage({ tone: "error", text: labels.updateError });
      return;
    }

    const payload = (await response.json()) as BuyerRequestDetailPayload;

    if (!response.ok || !payload.request) {
      setMessage({ tone: "error", text: labels.updateError });
      return;
    }

    setRequest(payload.request);
    setSectionReadiness(payload.sectionReadiness ?? sectionReadiness);
    setMessage({ tone: "success", text: labels.saveRequest });
  }

  if (isLoading) {
    return <div className="text-sm font-medium text-slate-500">{labels.loadError}</div>;
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {labels.loadError}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        className="w-fit"
        render={<Link href={`/${locale}/dashboard/buyer-requests`} />}
      >
        <ArrowLeft data-icon="inline-start" />
        {labels.backToList}
      </Button>

      {message ? <BuyerRequestMessage message={message} /> : null}

      <header className="supplier-surface rounded-2xl border-0 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
              {labels.buyerName}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {request.request_title}
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              {request.buyer_name}
              {request.buyer_contact_name ? ` - ${request.buyer_contact_name}` : ""}
            </p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            {labels.statuses[request.status]}
          </span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex flex-col gap-6">
          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.requestDetails}
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label={labels.buyerContactEmail} value={request.buyer_contact_email ?? labels.notProvidedYet} />
              <DetailItem label={labels.dueDate} value={request.due_date ? formatDate(request.due_date, locale) : labels.noDueDate} />
              <DetailItem label={labels.requestDescription} value={request.request_description ?? labels.notProvidedYet} />
              <DetailItem label={labels.requestedSections} value={request.requested_sections.length ? request.requested_sections.map((code) => labels.sections[code]).join(", ") : labels.noRequestedSections} />
            </dl>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.readinessSummary}
            </h2>
            <div className="mt-4 grid gap-3">
              {sectionReadiness.length ? (
                sectionReadiness.map((section) => (
                  <article key={section.code} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {labels.sections[section.code] ?? section.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBuyerRequestLabel(labels.answeredQuestions, {
                            answered: section.answeredQuestions,
                            total: section.totalQuestions,
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">
                        {formatBuyerRequestLabel(labels.completion, { percent: section.completion })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {formatBuyerRequestLabel(labels.evidenceLinked, {
                        linked: section.evidenceLinked,
                      })}
                    </p>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {labels.noRequestedSections}
                </p>
              )}
            </div>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.notes}
            </h2>
            <Textarea
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-4 min-h-32 bg-white"
            />
          </section>
        </main>

        <aside className="flex flex-col gap-6">
          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.status}
            </h2>
            <Select
              value={status}
              onValueChange={(value) => {
                if (buyerRequestStatuses.includes(value as BuyerRequestStatus)) {
                  setStatus(value as BuyerRequestStatus);
                }
              }}
            >
              <SelectTrigger className="mt-4 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {buyerRequestStatuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {labels.statuses[item]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                {labels.requestedSections}
              </p>
              <div className="grid gap-2">
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
            </div>
            <Button className="mt-5 w-full" disabled={isSaving} onClick={handleSave}>
              <Save data-icon="inline-start" />
              {isSaving ? labels.saving : labels.saveRequest}
            </Button>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.actionsTitle}
            </h2>
            <div className="mt-4 grid gap-2">
              <ActionLink href={`/${locale}/dashboard/questionnaire`} label={labels.reviewQuestionnaire} />
              <ActionLink href={`/${locale}/dashboard/documents`} label={labels.openEvidenceRoom} />
              <ActionLink href={`/${locale}/dashboard/passport`} label={labels.openPassport} />
              <ActionLink href={`/${locale}/dashboard/share`} label={labels.openSharePage} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">{labels.downloadPdfHint}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-700">{value}</dd>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline" className="justify-between bg-white" render={<Link href={href} />}>
      {label}
      <ExternalLink data-icon="inline-end" />
    </Button>
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
