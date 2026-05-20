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
  CommercialPlan,
  CommercialSegment,
  CommercialStatus,
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
  const [portfolioFilter, setPortfolioFilter] = useState("__all");
  const [commercialPlanFilter, setCommercialPlanFilter] = useState<CommercialPlan | "__all">("__all");
  const [commercialSegmentFilter, setCommercialSegmentFilter] = useState<CommercialSegment | "__all">("__all");
  const [commercialStatusFilter, setCommercialStatusFilter] = useState<CommercialStatus | "__all">("__all");
  const [triageFilter, setTriageFilter] = useState<AdminTriageStatus | "__all">("__all");
  const [conciergeStatusFilter, setConciergeStatusFilter] = useState<ConciergeStatus | "__all">("__all");
  const [priorityFilter, setPriorityFilter] = useState<ConciergePriority | "__all">("__all");
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const filteredOrganizations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter((organization) => {
      const portfolio = organization.concierge?.portfolioLabel ?? "";
      const searchMatch =
        !normalized ||
        organization.name.toLowerCase().includes(normalized) ||
        portfolio.toLowerCase().includes(normalized) ||
        (organization.concierge?.partnerLabel ?? "").toLowerCase().includes(normalized);
      const portfolioMatch =
        portfolioFilter === "__all" ||
        (portfolioFilter === "__none" ? !portfolio : portfolio === portfolioFilter);
      const triageMatch = triageFilter === "__all" || organization.triageStatus === triageFilter;
      const commercialPlanMatch =
        commercialPlanFilter === "__all" || organization.concierge?.commercialPlan === commercialPlanFilter;
      const commercialSegmentMatch =
        commercialSegmentFilter === "__all" || organization.concierge?.commercialSegment === commercialSegmentFilter;
      const commercialStatusMatch =
        commercialStatusFilter === "__all" || organization.concierge?.commercialStatus === commercialStatusFilter;
      const conciergeStatusMatch =
        conciergeStatusFilter === "__all" ||
        (organization.concierge?.status ?? "not_started") === conciergeStatusFilter;
      const priorityMatch = priorityFilter === "__all" || (organization.concierge?.priority ?? "normal") === priorityFilter;

      return (
        searchMatch &&
        portfolioMatch &&
        triageMatch &&
        commercialPlanMatch &&
        commercialSegmentMatch &&
        commercialStatusMatch &&
        conciergeStatusMatch &&
        priorityMatch
      );
    });
  }, [
    commercialPlanFilter,
    commercialSegmentFilter,
    commercialStatusFilter,
    conciergeStatusFilter,
    organizations,
    portfolioFilter,
    priorityFilter,
    query,
    triageFilter,
  ]);
  const portfolioOptions = useMemo(() => {
    return Array.from(
      new Set(organizations.map((organization) => organization.concierge?.portfolioLabel).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
  }, [organizations]);
  const portfolioSummaries = useMemo(() => {
    const summaries = new Map<
      string,
      {
        label: string;
        filterValue: string;
        count: number;
        readinessSum: number;
        demoReady: number;
        waiting: number;
        atRisk: number;
        highPriority: number;
        upcomingFollowUps: number;
      }
    >();
    for (const organization of organizations) {
      const label = organization.concierge?.portfolioLabel || labels.noPortfolioAssigned;
      const current = summaries.get(label) ?? {
        label,
        filterValue: organization.concierge?.portfolioLabel || "__none",
        count: 0,
        readinessSum: 0,
        demoReady: 0,
        waiting: 0,
        atRisk: 0,
        highPriority: 0,
        upcomingFollowUps: 0,
      };
      current.count += 1;
      current.readinessSum += organization.readinessPercent;
      if (organization.triageStatus === "demo_ready") {
        current.demoReady += 1;
      }
      if (organization.concierge?.onboardingStatus === "waiting_on_supplier") {
        current.waiting += 1;
      }
      if (organization.concierge?.priority === "high") {
        current.highPriority += 1;
      }
      if (organization.triageStatus === "at_risk") {
        current.atRisk += 1;
      }
      const followUpState = getFollowUpState(organization.concierge?.nextFollowUpDate ?? null, organization.concierge);
      if (followUpState === "overdue" || followUpState === "today" || followUpState === "soon") {
        current.upcomingFollowUps += 1;
      }
      summaries.set(label, current);
    }

    return Array.from(summaries.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [labels.noPortfolioAssigned, organizations]);

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
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_180px_180px_160px]">
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
          <select
            value={portfolioFilter}
            onChange={(event) => setPortfolioFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.allPortfolios}</option>
            <option value="__none">{labels.noPortfolioAssigned}</option>
            {portfolioOptions.map((portfolio) => (
              <option key={portfolio} value={portfolio}>
                {portfolio}
              </option>
            ))}
          </select>
          <select
            value={triageFilter}
            onChange={(event) => setTriageFilter(event.target.value as AdminTriageStatus | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.allTriage}</option>
            <option value="needs_attention">{labels.triageNeedsAttention}</option>
            <option value="in_progress">{labels.triageInProgress}</option>
            <option value="demo_ready">{labels.triageDemoReady}</option>
            <option value="at_risk">{labels.triageAtRisk}</option>
          </select>
          <select
            value={commercialPlanFilter}
            onChange={(event) => setCommercialPlanFilter(event.target.value as CommercialPlan | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.allPlans}</option>
            <option value="starter">{labels.commercialPlanStarter}</option>
            <option value="supplier_pro">{labels.commercialPlanSupplierPro}</option>
            <option value="partner">{labels.commercialPlanPartner}</option>
            <option value="buyer_pilot">{labels.commercialPlanBuyerPilot}</option>
            <option value="buyer_pro_future">{labels.commercialPlanBuyerProFuture}</option>
          </select>
          <select
            value={commercialSegmentFilter}
            onChange={(event) => setCommercialSegmentFilter(event.target.value as CommercialSegment | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.allSegments}</option>
            <option value="supplier">{labels.commercialSegmentSupplier}</option>
            <option value="partner">{labels.commercialSegmentPartner}</option>
            <option value="buyer">{labels.commercialSegmentBuyer}</option>
            <option value="consultant">{labels.commercialSegmentConsultant}</option>
            <option value="internal_demo">{labels.commercialSegmentInternalDemo}</option>
          </select>
          <select
            value={commercialStatusFilter}
            onChange={(event) => setCommercialStatusFilter(event.target.value as CommercialStatus | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.commercialStatus}</option>
            <option value="lead">{labels.commercialStatusLead}</option>
            <option value="pilot">{labels.commercialStatusPilot}</option>
            <option value="active">{labels.commercialStatusActive}</option>
            <option value="paused">{labels.commercialStatusPaused}</option>
            <option value="churn_risk">{labels.commercialStatusChurnRisk}</option>
            <option value="closed">{labels.commercialStatusClosed}</option>
          </select>
          <select
            value={conciergeStatusFilter}
            onChange={(event) => setConciergeStatusFilter(event.target.value as ConciergeStatus | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.allStatus}</option>
            <option value="not_started">{labels.statusNotStarted}</option>
            <option value="onboarding">{labels.statusOnboarding}</option>
            <option value="waiting_on_supplier">{labels.statusWaitingOnSupplier}</option>
            <option value="ready_for_review">{labels.statusReadyForReview}</option>
            <option value="demo_ready">{labels.statusDemoReady}</option>
            <option value="paused">{labels.statusPaused}</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as ConciergePriority | "__all")}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
          >
            <option value="__all">{labels.priority}</option>
            <option value="low">{labels.priorityLow}</option>
            <option value="normal">{labels.priorityNormal}</option>
            <option value="high">{labels.priorityHigh}</option>
          </select>
        </div>
      </section>

      {portfolioSummaries.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label={labels.totalPortfolios} value={portfolioOptions.length} />
          <SummaryCard label={labels.totalOrganizations} value={organizations.length} />
          <SummaryCard label={labels.triageDemoReady} value={organizations.filter((item) => item.triageStatus === "demo_ready").length} />
          <SummaryCard label={labels.statusWaitingOnSupplier} value={organizations.filter((item) => item.concierge?.onboardingStatus === "waiting_on_supplier").length} />
          <SummaryCard label={labels.highPriorityOrganizations} value={organizations.filter((item) => item.concierge?.priority === "high").length} />
          <SummaryCard label={labels.activePilots} value={organizations.filter((item) => item.concierge?.commercialStatus === "pilot").length} />
          <SummaryCard label={labels.leads} value={organizations.filter((item) => item.concierge?.commercialStatus === "lead").length} />
          <SummaryCard label={labels.churnRisk} value={organizations.filter((item) => item.concierge?.commercialStatus === "churn_risk").length} />
          <SummaryCard label={labels.partnerProspects} value={organizations.filter((item) => item.concierge?.commercialSegment === "partner" || item.concierge?.commercialSegment === "consultant").length} />
          <SummaryCard
            label={labels.upcomingFollowUps}
            value={
              organizations.filter((item) => {
                const followUpState = getFollowUpState(item.concierge?.nextFollowUpDate ?? null, item.concierge);
                return followUpState === "overdue" || followUpState === "today" || followUpState === "soon";
              }).length
            }
          />
          <SummaryCard label={labels.noPortfolioAssigned} value={organizations.filter((item) => !item.concierge?.portfolioLabel).length} />
          {portfolioSummaries.slice(0, 4).map((summary) => (
            <article key={summary.label} className="supplier-surface rounded-2xl border-0 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {labels.portfolioSummary}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">{summary.label}</p>
              <p className="mt-1 text-sm text-slate-600">
                {summary.count} {labels.organizations.toLowerCase()} · {summary.demoReady}{" "}
                {labels.triageDemoReady.toLowerCase()} · {summary.atRisk} {labels.triageAtRisk.toLowerCase()}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {portfolioSummaries.length ? (
        <section className="supplier-surface rounded-2xl border-0 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{labels.organizationsByPortfolio}</h2>
            <p className="mt-1 text-sm text-slate-600">{labels.assistedPortfolio}</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {portfolioSummaries.map((summary) => (
              <article key={summary.label} className="supplier-surface rounded-2xl border-0 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {labels.portfolio}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">{summary.label}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <PortfolioMetric label={labels.organizations} value={summary.count} />
                  <PortfolioMetric label={labels.completion} value={`${Math.round(summary.readinessSum / summary.count)}%`} />
                  <PortfolioMetric label={labels.highPriorityOrganizations} value={summary.highPriority} />
                  <PortfolioMetric label={labels.statusWaitingOnSupplier} value={summary.waiting} />
                  <PortfolioMetric label={labels.upcomingFollowUps} value={summary.upcomingFollowUps} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-fit rounded-xl bg-white"
                  onClick={() => setPortfolioFilter(summary.filterValue)}
                >
                  {labels.viewOrganizations}
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {labels.portfolio}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {organization.concierge?.portfolioLabel || labels.noPortfolioAssigned}
                  </p>
                  {organization.concierge?.partnerLabel ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {labels.assistedBy}: {organization.concierge.partnerLabel}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {labels.currentWorkspacePlan}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {organization.commercialPlanLabel}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {labels.commercialClassification}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatCommercialPlan(organization.concierge?.commercialPlan ?? null, labels)} ·{" "}
                    {formatCommercialSegment(organization.concierge?.commercialSegment ?? null, labels)} ·{" "}
                    {formatCommercialStatus(organization.concierge?.commercialStatus ?? null, labels)}
                  </p>
                  {organization.concierge?.pilotTargetDate ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {labels.pilotTargetDate}:{" "}
                      {formatDate(organization.concierge.pilotTargetDate, locale, labels.notProvided)}
                    </p>
                  ) : null}
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
                    {formatFollowUpLabel(organization.concierge?.nextFollowUpDate ?? null, organization.concierge, locale, labels)}
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

function formatCommercialPlan(plan: CommercialPlan | null, labels: AdminLabels) {
  if (!plan) {
    return labels.notProvided;
  }

  const planLabels: Record<CommercialPlan, string> = {
    starter: labels.commercialPlanStarter,
    supplier_pro: labels.commercialPlanSupplierPro,
    partner: labels.commercialPlanPartner,
    buyer_pilot: labels.commercialPlanBuyerPilot,
    buyer_pro_future: labels.commercialPlanBuyerProFuture,
  };

  return planLabels[plan];
}

function formatCommercialSegment(segment: CommercialSegment | null, labels: AdminLabels) {
  if (!segment) {
    return labels.notProvided;
  }

  const segmentLabels: Record<CommercialSegment, string> = {
    supplier: labels.commercialSegmentSupplier,
    partner: labels.commercialSegmentPartner,
    buyer: labels.commercialSegmentBuyer,
    consultant: labels.commercialSegmentConsultant,
    internal_demo: labels.commercialSegmentInternalDemo,
  };

  return segmentLabels[segment];
}

function formatCommercialStatus(status: CommercialStatus | null, labels: AdminLabels) {
  if (!status) {
    return labels.notProvided;
  }

  const statusLabels: Record<CommercialStatus, string> = {
    lead: labels.commercialStatusLead,
    pilot: labels.commercialStatusPilot,
    active: labels.commercialStatusActive,
    paused: labels.commercialStatusPaused,
    churn_risk: labels.commercialStatusChurnRisk,
    closed: labels.commercialStatusClosed,
  };

  return statusLabels[status];
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="supplier-surface rounded-2xl border-0 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function PortfolioMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
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

function getFollowUpState(
  value: string | null,
  concierge: AdminOrganizationSummary["concierge"],
): "none" | "overdue" | "today" | "soon" | "scheduled" {
  if (!value) {
    return "none";
  }

  if (concierge?.onboardingStatus === "completed" || concierge?.onboardingStatus === "paused" || concierge?.status === "paused") {
    return "scheduled";
  }

  const due = parseDateOnly(value);
  if (!due) {
    return "none";
  }

  const today = startOfToday();
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return "overdue";
  }

  if (diffDays === 0) {
    return "today";
  }

  if (diffDays <= 7) {
    return "soon";
  }

  return "scheduled";
}

function formatFollowUpLabel(
  value: string | null,
  concierge: AdminOrganizationSummary["concierge"],
  locale: string,
  labels: AdminLabels,
) {
  const state = getFollowUpState(value, concierge);

  if (state === "none") {
    return labels.noFollowUpScheduled;
  }

  const formattedDate = formatDate(value, locale, labels.notProvided);

  if (state === "overdue") {
    return `${labels.followUpOverdue} · ${formattedDate}`;
  }

  if (state === "today") {
    return `${labels.followUpDueToday} · ${formattedDate}`;
  }

  if (state === "soon") {
    return `${labels.followUpDueSoon} · ${formattedDate}`;
  }

  return formattedDate;
}

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
