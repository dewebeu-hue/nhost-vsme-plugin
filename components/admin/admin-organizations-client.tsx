"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import type {
  AdminOrganizationSummary,
  AdminTriageStatus,
  ConciergePriority,
  ConciergeStatus,
  OnboardingStatus,
} from "@/lib/admin-workspace";
import { cn } from "@/lib/utils";

type OrganizationsPayload = {
  ok?: boolean;
  organizations?: AdminOrganizationSummary[];
  error?: string;
};

type AdminOrganizationsClientProps = {
  labels?: AdminLabels;
};

export function AdminOrganizationsClient({ labels = defaultAdminLabels }: AdminOrganizationsClientProps) {
  const locale = useLocale();
  const [organizations, setOrganizations] = useState<AdminOrganizationSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const filteredOrganizations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return organizations;
    }

    return organizations.filter((organization) => organization.name.toLowerCase().includes(normalized));
  }, [organizations, query]);

  async function loadOrganizations() {
    setStatus("loading");
    setMessage(null);

    const response = await fetchWithAuth("/api/admin/organizations");

    if (response.status === 401 || response.status === 403) {
      setStatus("unauthorized");
      setMessage(labels.unauthorizedDescription);
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(labels.loadError);
      return;
    }

    const payload = (await response.json()) as OrganizationsPayload;

    setOrganizations(payload.organizations ?? []);
    setStatus("ready");
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrganizations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "unauthorized") {
    return (
      <AdminStateCard
        title={labels.unauthorizedTitle}
        description={message ?? labels.unauthorizedDescription}
      />
    );
  }

  if (status === "error") {
    return (
      <AdminStateCard title={labels.loadError} description={message ?? labels.loadError}>
        <Button type="button" onClick={loadOrganizations} variant="outline" className="mt-4">
          <RefreshCw data-icon="inline-start" />
          {labels.retry}
        </Button>
      </AdminStateCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.organizations}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin`}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 w-fit rounded-xl bg-white")}
        >
          {labels.adminWorkspace}
        </Link>
      </div>

      <section className="supplier-surface rounded-2xl border-0 p-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchOrganizations}
            className="h-11 rounded-xl bg-slate-50 pl-10"
          />
        </div>
      </section>

      {status === "loading" ? (
        <AdminStateCard title={labels.loading} description={labels.loading} />
      ) : (
        <section className="supplier-surface overflow-hidden rounded-2xl border-0">
          <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100">
            {filteredOrganizations.map((organization) => (
              <article
                key={organization.id}
                className="grid gap-4 p-5 xl:grid-cols-[minmax(220px,1.4fr)_180px_130px_130px_130px_130px_150px_auto] xl:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">{organization.name}</h2>
                    <TriageBadge status={organization.triageStatus} labels={labels} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {labels.clientSince.replace(
                      "{date}",
                      formatDate(organization.createdAt, locale, labels.notProvided),
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-950">
                    <span>{labels.completion}</span>
                    <span>{organization.readinessPercent}%</span>
                  </div>
                  <Progress value={organization.readinessPercent} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-slate-500">
                    {organization.answeredQuestions}/{organization.totalQuestions}
                  </p>
                </div>

                <Metric label={labels.documents} value={organization.documentCount} />
                <Metric label={labels.linkedEvidence} value={organization.linkedEvidenceCount} />
                <Metric label={labels.buyerRequests} value={organization.buyerRequestCount} />
                <Metric label={labels.certificateExpiryWarnings} value={organization.certificateWarningCount} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {labels.conciergeStatus}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatConciergeStatus(organization.concierge?.status, labels)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {labels.priority}: {formatPriority(organization.concierge?.priority, labels)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {labels.onboardingStatus}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatOnboardingStatus(organization.concierge?.onboardingStatus, labels)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {labels.onboardingProgress}: {organization.onboardingChecklistDone}/
                    {organization.onboardingChecklistTotal}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {labels.nextFollowUp}:{" "}
                    {formatDate(organization.concierge?.nextFollowUpDate ?? null, locale, labels.notProvided)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 xl:items-end">
                  <Badge
                    variant="outline"
                    className={
                      organization.activeShareLink
                        ? "w-fit rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "w-fit rounded-full border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {organization.activeShareLink ? labels.activePublicLink : labels.noActivePublicLink}
                  </Badge>
                  <Link
                    href={`/${locale}/admin/organizations/${organization.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "w-fit rounded-xl bg-white")}
                  >
                    {labels.openDetail}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatConciergeStatus(status: ConciergeStatus | undefined, labels: AdminLabels) {
  const statusLabels: Record<ConciergeStatus, string> = {
    not_started: labels.statusNotStarted,
    onboarding: labels.statusOnboarding,
    waiting_on_supplier: labels.statusWaitingOnSupplier,
    ready_for_review: labels.statusReadyForReview,
    demo_ready: labels.statusDemoReady,
    paused: labels.statusPaused,
  };

  return status ? statusLabels[status] : labels.statusNotStarted;
}

function formatPriority(priority: ConciergePriority | undefined, labels: AdminLabels) {
  const priorityLabels: Record<ConciergePriority, string> = {
    low: labels.priorityLow,
    normal: labels.priorityNormal,
    high: labels.priorityHigh,
  };

  return priority ? priorityLabels[priority] : labels.priorityNormal;
}

function formatOnboardingStatus(status: OnboardingStatus | undefined, labels: AdminLabels) {
  const statusLabels: Record<OnboardingStatus, string> = {
    not_started: labels.statusNotStarted,
    invited: labels.statusInvited,
    setup_in_progress: labels.statusSetupInProgress,
    waiting_on_supplier: labels.statusWaitingOnSupplier,
    ready_for_review: labels.statusReadyForReview,
    demo_ready: labels.statusDemoReady,
    completed: labels.statusCompleted,
    paused: labels.statusPaused,
  };

  return status ? statusLabels[status] : labels.statusNotStarted;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TriageBadge({ status, labels }: { status: AdminTriageStatus; labels: AdminLabels }) {
  const text = {
    needs_attention: labels.triageNeedsAttention,
    in_progress: labels.triageInProgress,
    demo_ready: labels.triageDemoReady,
    at_risk: labels.triageAtRisk,
  }[status];
  const className = {
    needs_attention: "border-amber-200 bg-amber-50 text-amber-700",
    in_progress: "border-blue-200 bg-blue-50 text-blue-700",
    demo_ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    at_risk: "border-red-200 bg-red-50 text-red-700",
  }[status];

  return (
    <Badge variant="outline" className={`rounded-full ${className}`}>
      {text}
    </Badge>
  );
}

function AdminStateCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="supplier-surface rounded-2xl border-0 p-6">
      <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {children}
    </section>
  );
}

async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  let session = await getFreshBrowserNhostSession();
  let response = await fetchWithSession(input, init, session?.accessToken ?? null);

  if (response.status === 401) {
    session = await forceRefreshBrowserNhostSession();
    response = await fetchWithSession(input, init, session?.accessToken ?? null);
  }

  return response;
}

async function fetchWithSession(input: RequestInfo | URL, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(date);
}
