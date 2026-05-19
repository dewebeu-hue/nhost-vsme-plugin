"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import type {
  AdminConciergeNote,
  AdminOrganizationDetail,
  AdminTriageStatus,
  ConciergePriority,
  ConciergeStatus,
} from "@/lib/admin-workspace";
import { cn } from "@/lib/utils";

type DetailPayload = {
  ok?: boolean;
  organization?: AdminOrganizationDetail;
  error?: string;
};

export function AdminOrganizationDetailClient({
  organizationId,
  labels = defaultAdminLabels,
}: {
  organizationId: string;
  labels?: AdminLabels;
}) {
  const locale = useLocale();
  const [organization, setOrganization] = useState<AdminOrganizationDetail | null>(null);
  const [conciergeStatus, setConciergeStatus] = useState<ConciergeStatus>("not_started");
  const [priority, setPriority] = useState<ConciergePriority>("normal");
  const [internalNote, setInternalNote] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  function hydrateConciergeForm(concierge: AdminConciergeNote | null) {
    setConciergeStatus(concierge?.status ?? "not_started");
    setPriority(concierge?.priority ?? "normal");
    setInternalNote(concierge?.internalNote ?? "");
    setNextFollowUpDate(concierge?.nextFollowUpDate ?? "");
  }

  async function loadOrganization() {
    setStatus("loading");
    setMessage(null);

    const response = await fetchWithAuth(`/api/admin/organizations/${organizationId}`);

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

    const payload = (await response.json()) as DetailPayload;
    const nextOrganization = payload.organization ?? null;
    setOrganization(nextOrganization);
    hydrateConciergeForm(nextOrganization?.concierge ?? null);
    setStatus("ready");
  }

  async function saveConciergeStatus(markReviewed = false) {
    setIsSaving(true);
    setMessage(null);

    const response = await fetchWithAuth(`/api/admin/organizations/${organizationId}/concierge`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: conciergeStatus,
        priority,
        internalNote,
        nextFollowUpDate,
        markReviewed,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setMessage(labels.conciergeSaveError);
      return;
    }

    const payload = (await response.json()) as { concierge?: AdminConciergeNote };
    const concierge = payload.concierge ?? null;
    setOrganization((current) => (current ? { ...current, concierge } : current));
    hydrateConciergeForm(concierge);
    setMessage(labels.conciergeSaved);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrganization();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const summaryCards = useMemo(() => {
    if (!organization) {
      return [];
    }

    return [
      { label: labels.completion, value: `${organization.readinessPercent}%` },
      { label: labels.documents, value: String(organization.documentCount) },
      { label: labels.linkedEvidence, value: String(organization.linkedEvidenceCount) },
      { label: labels.buyerRequests, value: String(organization.buyerRequestCount) },
      { label: labels.certificateExpiryWarnings, value: String(organization.certificateWarningCount) },
      { label: labels.missingSteps, value: String(organization.missingActionCount) },
    ];
  }, [labels, organization]);
  const supportChecklist = useMemo(() => {
    if (!organization) {
      return [];
    }

    return [
      { label: labels.checklistQuestionnaireStarted, done: organization.answeredQuestions > 0 },
      { label: labels.checklistEvidenceUploaded, done: organization.documentCount > 0 },
      { label: labels.checklistEvidenceLinked, done: organization.linkedEvidenceCount > 0 },
      { label: labels.checklistPassportReviewed, done: organization.readinessPercent > 0 },
      { label: labels.checklistPublicLinkActive, done: organization.activeShareLink },
      { label: labels.checklistBuyerRequestsReviewed, done: organization.overdueBuyerRequestCount === 0 },
      { label: labels.checklistCertificateExpiryChecked, done: organization.certificateWarningCount === 0 },
      { label: labels.checklistPdfExportAvailable, done: true },
    ];
  }, [labels, organization]);

  if (status === "unauthorized") {
    return <AdminStateCard title={labels.unauthorizedTitle} description={message ?? labels.unauthorizedDescription} />;
  }

  if (status === "error") {
    return (
      <AdminStateCard title={labels.loadError} description={message ?? labels.loadError}>
        <Button type="button" onClick={loadOrganization} variant="outline" className="mt-4">
          <RefreshCw data-icon="inline-start" />
          {labels.retry}
        </Button>
      </AdminStateCard>
    );
  }

  if (status === "loading" || !organization) {
    return <AdminStateCard title={labels.loading} description={labels.loading} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href={`/${locale}/admin/organizations`}
          className={cn(buttonVariants({ variant: "ghost" }), "w-fit")}
        >
          <ArrowLeft data-icon="inline-start" />
          {labels.backToOrganizations}
        </Link>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {organization.name}
              </h1>
              <TriageBadge status={organization.triageStatus} labels={labels} />
            </div>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
              {labels.conciergeDashboard}
            </p>
          </div>
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
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="supplier-surface rounded-2xl border-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="supplier-surface rounded-2xl border-0 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{labels.overview}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {organization.answeredQuestions}/{organization.totalQuestions} {labels.completion.toLowerCase()}
            </p>
          </div>
          <p className="text-lg font-semibold text-slate-950">{organization.readinessPercent}%</p>
        </div>
        <Progress value={organization.readinessPercent} className="mt-4 h-2" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="supplier-surface rounded-2xl border-0 p-5">
          <h2 className="text-lg font-semibold text-slate-950">{labels.sectionReadiness}</h2>
          <div className="mt-4 grid gap-3">
            {organization.sections.map((section) => (
              <article key={section.code} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-slate-950">{section.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {section.answeredQuestions}/{section.totalQuestions} • {labels.linkedEvidence}:{" "}
                      {section.evidenceLinkedCount}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">{section.completionPercent}%</p>
                </div>
                <Progress value={section.completionPercent} className="mt-3 h-2" />
              </article>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.conciergeStatus}</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.conciergeStatus}
                <Select
                  value={conciergeStatus}
                  onValueChange={(value) => setConciergeStatus(value as ConciergeStatus)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(["not_started", "onboarding", "waiting_on_supplier", "ready_for_review", "demo_ready", "paused"] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatConciergeStatus(value, labels)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.priority}
                <Select value={priority} onValueChange={(value) => setPriority(value as ConciergePriority)}>
                  <SelectTrigger className="h-10 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(["low", "normal", "high"] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatPriority(value, labels)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.nextFollowUp}
                <Input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(event) => setNextFollowUpDate(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.internalNote}
                <Textarea
                  value={internalNote}
                  onChange={(event) => setInternalNote(event.target.value)}
                  rows={4}
                  className="rounded-xl bg-white"
                />
              </label>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void saveConciergeStatus(false)}
                  disabled={isSaving}
                  className="w-fit rounded-xl"
                >
                  <Save data-icon="inline-start" />
                  {labels.saveConciergeStatus}
                </Button>
                <Button
                  type="button"
                  onClick={() => void saveConciergeStatus(true)}
                  disabled={isSaving}
                  variant="outline"
                  className="w-fit rounded-xl bg-white"
                >
                  {labels.markReviewed}
                </Button>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-950">
                  {organization.concierge?.reviewedAt ? labels.reviewedInternally : labels.notReviewedYet}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{labels.internalReviewDisclaimer}</p>
              </div>
            </div>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.supportChecklist}</h2>
            <div className="mt-4 flex flex-col gap-2">
              {supportChecklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <Badge
                    variant="outline"
                    className={
                      item.done
                        ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "rounded-full border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {item.done ? labels.statusReadyForReview : labels.triageNeedsAttention}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              {labels.supportAcknowledgementDeferred}
            </p>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.buyerRequestSummary}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {organization.buyerRequests.length ? (
                organization.buyerRequests.slice(0, 5).map((request) => (
                  <article key={request.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-950">{request.requestTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.buyerName} • {request.status}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-600">{labels.notProvided}</p>
              )}
            </div>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.missingSteps}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {organization.missingActions.length ? (
                organization.missingActions.map((action) => (
                  <article key={action.id} className="rounded-xl bg-slate-50 p-3">
                    <Badge
                      variant="outline"
                      className={
                        action.severity === "critical"
                          ? "rounded-full border-red-200 bg-red-50 text-red-700"
                          : "rounded-full border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {action.severity === "critical" ? labels.critical : labels.warning}
                    </Badge>
                    <p className="mt-2 text-sm font-medium text-slate-700">{action.label}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-600">{labels.noMissingSteps}</p>
              )}
            </div>
          </section>
        </aside>
      </div>
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

function formatConciergeStatus(status: ConciergeStatus, labels: AdminLabels) {
  const statusLabels: Record<ConciergeStatus, string> = {
    not_started: labels.statusNotStarted,
    onboarding: labels.statusOnboarding,
    waiting_on_supplier: labels.statusWaitingOnSupplier,
    ready_for_review: labels.statusReadyForReview,
    demo_ready: labels.statusDemoReady,
    paused: labels.statusPaused,
  };

  return statusLabels[status];
}

function formatPriority(priority: ConciergePriority, labels: AdminLabels) {
  const priorityLabels: Record<ConciergePriority, string> = {
    low: labels.priorityLow,
    normal: labels.priorityNormal,
    high: labels.priorityHigh,
  };

  return priorityLabels[priority];
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
