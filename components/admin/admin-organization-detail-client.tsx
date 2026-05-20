"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, ClipboardCopy, Download, RefreshCw, Save } from "lucide-react";
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
  CommercialPlan,
  CommercialSegment,
  CommercialStatus,
  ConciergePriority,
  ConciergeStatus,
  OnboardingStatus,
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
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>("not_started");
  const [onboardingNextAction, setOnboardingNextAction] = useState("");
  const [onboardingOwnerNote, setOnboardingOwnerNote] = useState("");
  const [portfolioLabel, setPortfolioLabel] = useState("");
  const [partnerLabel, setPartnerLabel] = useState("");
  const [assignedConsultantNote, setAssignedConsultantNote] = useState("");
  const [commercialPlan, setCommercialPlan] = useState<CommercialPlan | "">("");
  const [commercialSegment, setCommercialSegment] = useState<CommercialSegment | "">("");
  const [commercialStatus, setCommercialStatus] = useState<CommercialStatus | "">("");
  const [commercialNote, setCommercialNote] = useState("");
  const [pilotStartDate, setPilotStartDate] = useState("");
  const [pilotTargetDate, setPilotTargetDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  function hydrateConciergeForm(concierge: AdminConciergeNote | null) {
    setConciergeStatus(concierge?.status ?? "not_started");
    setPriority(concierge?.priority ?? "normal");
    setInternalNote(concierge?.internalNote ?? "");
    setNextFollowUpDate(concierge?.nextFollowUpDate ?? "");
    setOnboardingStatus(concierge?.onboardingStatus ?? "not_started");
    setOnboardingNextAction(concierge?.onboardingNextAction ?? "");
    setOnboardingOwnerNote(concierge?.onboardingOwnerNote ?? "");
    setPortfolioLabel(concierge?.portfolioLabel ?? "");
    setPartnerLabel(concierge?.partnerLabel ?? "");
    setAssignedConsultantNote(concierge?.assignedConsultantNote ?? "");
    setCommercialPlan(concierge?.commercialPlan ?? "");
    setCommercialSegment(concierge?.commercialSegment ?? "");
    setCommercialStatus(concierge?.commercialStatus ?? "");
    setCommercialNote(concierge?.commercialNote ?? "");
    setPilotStartDate(concierge?.pilotStartDate ?? "");
    setPilotTargetDate(concierge?.pilotTargetDate ?? "");
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

  async function saveAdminSupportState(
    markReviewed = false,
    successMessage = labels.conciergeSaved,
    errorMessage = labels.conciergeSaveError,
  ) {
    if (!organizationId) {
      setMessage(labels.missingOrganizationContext);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    let response: Response;

    try {
      response = await fetchWithAuth(`/api/admin/organizations/${organizationId}/concierge`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: conciergeStatus,
          priority,
          internalNote,
          nextFollowUpDate,
          markReviewed,
          onboardingStatus,
          onboardingNextAction,
          onboardingOwnerNote,
          portfolioLabel,
          partnerLabel,
          assignedConsultantNote,
          commercialPlan: commercialPlan || null,
          commercialSegment: commercialSegment || null,
          commercialStatus: commercialStatus || null,
          commercialNote,
          pilotStartDate,
          pilotTargetDate,
        }),
      });
    } catch {
      setIsSaving(false);
      setMessage(errorMessage);
      return;
    }

    if (!response.ok) {
      setIsSaving(false);
      setMessage(errorMessage);
      return;
    }

    const payload = (await response.json()) as { concierge?: AdminConciergeNote };
    const concierge = payload.concierge ?? null;
    setOrganization((current) => (current ? { ...current, concierge } : current));
    hydrateConciergeForm(concierge);
    setIsSaving(false);
    setMessage(successMessage);
  }

  function handlePortfolioSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveAdminSupportState(false, labels.conciergeSaved, labels.conciergeSaveError);
  }

  function handleOnboardingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveAdminSupportState(false, labels.onboardingSaved, labels.onboardingSaveError);
  }

  function handleConciergeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveAdminSupportState(false, labels.conciergeSaved, labels.conciergeSaveError);
  }

  function handleCommercialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveAdminSupportState(
      false,
      labels.commercialClassificationSaved,
      labels.commercialClassificationSaveError,
    );
  }

  function handleReviewedClick() {
    void saveAdminSupportState(true, labels.reviewedSaved, labels.reviewedSaveError);
  }

  async function handleCopyHandoffSummary() {
    if (!organization) {
      setMessage(labels.missingOrganizationContext);
      return;
    }

    const handoffText = buildHandoffSummaryText({
      organization,
      labels,
      locale,
    });

    try {
      await navigator.clipboard.writeText(handoffText);
      setMessage(labels.handoffCopied);
    } catch {
      setMessage(labels.handoffCopyError);
    }
  }

  function handleDownloadHandoffSummary() {
    if (!organization) {
      setMessage(labels.missingOrganizationContext);
      return;
    }

    const handoffText = buildHandoffSummaryText({
      organization,
      labels,
      locale,
    });
    const blob = new Blob([handoffText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `supplier-passport-handoff-${slugify(organization.name)}.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage(labels.handoffDownloaded);
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
      { label: labels.currentWorkspacePlan, value: organization.commercialPlanLabel },
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
  const onboardingChecklist = useMemo(() => {
    if (!organization) {
      return [];
    }

    return [
      { label: labels.checklistWorkspaceCreated, done: Boolean(organization.createdAt) },
      { label: labels.checklistCompanyProfileReviewed, done: organization.answeredQuestions > 0 },
      { label: labels.checklistQuestionnaireStarted, done: organization.answeredQuestions > 0 },
      { label: labels.checklistCoreQuestionnaireCompleted, done: organization.readinessPercent >= 70 },
      { label: labels.checklistEvidenceUploaded, done: organization.documentCount > 0 },
      { label: labels.checklistEvidenceLinked, done: organization.linkedEvidenceCount > 0 },
      {
        label: labels.checklistCertificateExpiryChecked,
        done: organization.documentCount > 0 && organization.certificateWarningCount === 0,
      },
      { label: labels.checklistPassportReviewed, done: organization.readinessPercent > 0 },
      { label: labels.checklistPublicLinkActive, done: organization.activeShareLink },
      { label: labels.checklistPdfExportAvailable, done: true },
      { label: labels.checklistBuyerRequestsReviewed, done: organization.buyerRequestCount > 0 },
    ];
  }, [labels, organization]);
  const onboardingDoneCount = onboardingChecklist.filter((item) => item.done).length;
  const handoffStatus = organization
    ? getHandoffStatus(organization, labels)
    : { label: labels.needsUpdate, tone: "warning" as const };
  const topMissingActions = organization?.missingActions.slice(0, 5) ?? [];

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
        {summaryCards.map((card, index) =>
          index === 0 ? (
            <ReadinessSummaryCard
              key={card.label}
              label={card.label}
              value={card.value}
              percentage={organization.readinessPercent}
            />
          ) : (
            <div key={card.label} className="supplier-surface rounded-2xl border-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
            </div>
          ),
        )}
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

      <section className="supplier-surface rounded-2xl border-0 p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">{labels.internalHandoffSummary}</h2>
              <Badge
                variant="outline"
                className={
                  handoffStatus.tone === "ready"
                    ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "rounded-full border-amber-200 bg-amber-50 text-amber-700"
                }
              >
                {handoffStatus.label}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{labels.internalUseOnly}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="w-fit rounded-xl bg-white" onClick={handleCopyHandoffSummary}>
              <ClipboardCopy data-icon="inline-start" />
              {labels.copyHandoffSummary}
            </Button>
            <Button type="button" variant="outline" className="w-fit rounded-xl bg-white" onClick={handleDownloadHandoffSummary}>
              <Download data-icon="inline-start" />
              {labels.downloadHandoffTxt}
            </Button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <HandoffMetric label={labels.portfolio} value={organization.concierge?.portfolioLabel || labels.noPortfolioAssigned} />
          <HandoffMetric label={labels.currentWorkspacePlan} value={organization.commercialPlanLabel} />
          <HandoffMetric label={labels.planPackage} value={formatCommercialPlan(organization.concierge?.commercialPlan ?? null, labels)} />
          <HandoffMetric label={labels.segment} value={formatCommercialSegment(organization.concierge?.commercialSegment ?? null, labels)} />
          <HandoffMetric label={labels.commercialStatus} value={formatCommercialStatus(organization.concierge?.commercialStatus ?? null, labels)} />
          <HandoffMetric label={labels.conciergeStatus} value={formatConciergeStatus(organization.concierge?.status ?? "not_started", labels)} />
          <HandoffMetric label={labels.priority} value={formatPriority(organization.concierge?.priority ?? "normal", labels)} />
          <HandoffMetric label={labels.onboardingStatus} value={formatOnboardingStatus(organization.concierge?.onboardingStatus ?? "not_started", labels)} />
          <HandoffMetric label={labels.completion} value={`${organization.readinessPercent}%`} />
          <HandoffMetric label={labels.evidenceSummary} value={`${organization.linkedEvidenceCount}/${organization.documentCount}`} />
          <HandoffMetric label={labels.buyerRequests} value={String(organization.buyerRequestCount)} />
          <HandoffMetric label={labels.nextFollowUp} value={formatDate(organization.concierge?.nextFollowUpDate ?? null, locale, labels.notProvided)} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{labels.onboardingNextAction}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {organization.concierge?.onboardingNextAction || labels.notProvided}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{labels.missingSteps}</p>
            <ul className="mt-2 grid gap-1 text-sm text-slate-700">
              {topMissingActions.length ? (
                topMissingActions.map((action) => <li key={action.id}>{action.label}</li>)
              ) : (
                <li>{labels.noMissingSteps}</li>
              )}
            </ul>
          </div>
        </div>
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
            <h2 className="text-lg font-semibold text-slate-950">{labels.commercialClassification}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{labels.commercialLabelsInternalNote}</p>
            <form className="mt-4 grid gap-4" onSubmit={handleCommercialSubmit}>
              <label htmlFor="admin-commercial-plan" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.planPackage}
                <select
                  id="admin-commercial-plan"
                  name="commercialPlan"
                  value={commercialPlan}
                  onChange={(event) => setCommercialPlan(event.target.value as CommercialPlan | "")}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                >
                  <option value="">{labels.notProvided}</option>
                  <option value="starter">{labels.commercialPlanStarter}</option>
                  <option value="supplier_pro">{labels.commercialPlanSupplierPro}</option>
                  <option value="partner">{labels.commercialPlanPartner}</option>
                  <option value="buyer_pilot">{labels.commercialPlanBuyerPilot}</option>
                  <option value="buyer_pro_future">{labels.commercialPlanBuyerProFuture}</option>
                </select>
              </label>
              <label htmlFor="admin-commercial-segment" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.segment}
                <select
                  id="admin-commercial-segment"
                  name="commercialSegment"
                  value={commercialSegment}
                  onChange={(event) => setCommercialSegment(event.target.value as CommercialSegment | "")}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                >
                  <option value="">{labels.notProvided}</option>
                  <option value="supplier">{labels.commercialSegmentSupplier}</option>
                  <option value="partner">{labels.commercialSegmentPartner}</option>
                  <option value="buyer">{labels.commercialSegmentBuyer}</option>
                  <option value="consultant">{labels.commercialSegmentConsultant}</option>
                  <option value="internal_demo">{labels.commercialSegmentInternalDemo}</option>
                </select>
              </label>
              <label htmlFor="admin-commercial-status" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.commercialStatus}
                <select
                  id="admin-commercial-status"
                  name="commercialStatus"
                  value={commercialStatus}
                  onChange={(event) => setCommercialStatus(event.target.value as CommercialStatus | "")}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                >
                  <option value="">{labels.notProvided}</option>
                  <option value="lead">{labels.commercialStatusLead}</option>
                  <option value="pilot">{labels.commercialStatusPilot}</option>
                  <option value="active">{labels.commercialStatusActive}</option>
                  <option value="paused">{labels.commercialStatusPaused}</option>
                  <option value="churn_risk">{labels.commercialStatusChurnRisk}</option>
                  <option value="closed">{labels.commercialStatusClosed}</option>
                </select>
              </label>
              <label htmlFor="admin-pilot-start-date" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.pilotStartDate}
                <Input
                  id="admin-pilot-start-date"
                  name="pilotStartDate"
                  type="date"
                  value={pilotStartDate}
                  onChange={(event) => setPilotStartDate(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-pilot-target-date" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.pilotTargetDate}
                <Input
                  id="admin-pilot-target-date"
                  name="pilotTargetDate"
                  type="date"
                  value={pilotTargetDate}
                  onChange={(event) => setPilotTargetDate(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-commercial-note" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.commercialNote}
                <Textarea
                  id="admin-commercial-note"
                  name="commercialNote"
                  value={commercialNote}
                  onChange={(event) => setCommercialNote(event.target.value)}
                  rows={4}
                  className="rounded-xl bg-white"
                />
              </label>
              <Button type="submit" disabled={isSaving} className="w-fit rounded-xl">
                <Save data-icon="inline-start" />
                {labels.saveCommercialClassification}
              </Button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </form>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.assistedPortfolio}</h2>
            <form className="mt-4 grid gap-4" onSubmit={handlePortfolioSubmit}>
              <label htmlFor="admin-portfolio-label" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.portfolioLabel}
                <Input
                  id="admin-portfolio-label"
                  name="portfolioLabel"
                  value={portfolioLabel}
                  onChange={(event) => setPortfolioLabel(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-partner-label" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.partnerLabel}
                <Input
                  id="admin-partner-label"
                  name="partnerLabel"
                  value={partnerLabel}
                  onChange={(event) => setPartnerLabel(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-assigned-consultant-note" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.internalPartnerNote}
                <Textarea
                  id="admin-assigned-consultant-note"
                  name="assignedConsultantNote"
                  value={assignedConsultantNote}
                  onChange={(event) => setAssignedConsultantNote(event.target.value)}
                  rows={3}
                  className="rounded-xl bg-white"
                />
              </label>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-fit rounded-xl"
              >
                <Save data-icon="inline-start" />
                {labels.assistedPortfolio}
              </Button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </form>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.assistedOnboarding}</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleOnboardingSubmit}>
              <div>
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-950">
                  <span>{labels.onboardingProgress}</span>
                  <span>
                    {onboardingDoneCount}/{onboardingChecklist.length}
                  </span>
                </div>
                <Progress
                  value={
                    onboardingChecklist.length
                      ? Math.round((onboardingDoneCount / onboardingChecklist.length) * 100)
                      : 0
                  }
                  className="mt-2 h-2"
                />
              </div>
              <div className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.onboardingStatus}
                <Select
                  name="onboardingStatus"
                  value={onboardingStatus}
                  onValueChange={(value) => setOnboardingStatus(value as OnboardingStatus)}
                >
                  <SelectTrigger id="admin-onboarding-status" className="h-10 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {([
                        "not_started",
                        "invited",
                        "setup_in_progress",
                        "waiting_on_supplier",
                        "ready_for_review",
                        "demo_ready",
                        "completed",
                        "paused",
                      ] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatOnboardingStatus(value, labels)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <label htmlFor="admin-onboarding-next-action" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.onboardingNextAction}
                <Input
                  id="admin-onboarding-next-action"
                  name="onboardingNextAction"
                  value={onboardingNextAction}
                  onChange={(event) => setOnboardingNextAction(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-onboarding-owner-note" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.onboardingOwnerNote}
                <Textarea
                  id="admin-onboarding-owner-note"
                  name="onboardingOwnerNote"
                  value={onboardingOwnerNote}
                  onChange={(event) => setOnboardingOwnerNote(event.target.value)}
                  rows={3}
                  className="rounded-xl bg-white"
                />
              </label>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-fit rounded-xl"
              >
                <Save data-icon="inline-start" />
                {labels.saveOnboardingDetails}
              </Button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </form>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.onboardingChecklist}</h2>
            <div className="mt-4 flex flex-col gap-2">
              {onboardingChecklist.map((item) => (
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
                    {item.done ? labels.statusCompleted : labels.triageNeedsAttention}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{labels.onboardingChecklistAutoNote}</p>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold text-slate-950">{labels.conciergeStatus}</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleConciergeSubmit}>
              <div className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.conciergeStatus}
                <Select
                  name="conciergeStatus"
                  value={conciergeStatus}
                  onValueChange={(value) => setConciergeStatus(value as ConciergeStatus)}
                >
                  <SelectTrigger id="admin-concierge-status" className="h-10 rounded-xl bg-white">
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
              </div>
              <div className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.priority}
                <Select name="priority" value={priority} onValueChange={(value) => setPriority(value as ConciergePriority)}>
                  <SelectTrigger id="admin-concierge-priority" className="h-10 rounded-xl bg-white">
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
              </div>
              <label htmlFor="admin-next-follow-up-date" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.nextFollowUp}
                <Input
                  id="admin-next-follow-up-date"
                  name="nextFollowUpDate"
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(event) => setNextFollowUpDate(event.target.value)}
                  className="h-10 rounded-xl bg-white"
                />
              </label>
              <label htmlFor="admin-internal-note" className="grid gap-2 text-sm font-medium text-slate-700">
                {labels.internalNote}
                <Textarea
                  id="admin-internal-note"
                  name="internalNote"
                  value={internalNote}
                  onChange={(event) => setInternalNote(event.target.value)}
                  rows={4}
                  className="rounded-xl bg-white"
                />
              </label>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-fit rounded-xl"
                >
                  <Save data-icon="inline-start" />
                  {labels.saveConciergeStatus}
                </Button>
                <Button
                  type="button"
                  onClick={handleReviewedClick}
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
            </form>
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

function formatOnboardingStatus(status: OnboardingStatus, labels: AdminLabels) {
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

function HandoffMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ReadinessSummaryCard({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  const style = getReadinessStyle(percentage);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-shadow",
        style.cardClassName,
        percentage === 100 ? "shadow-[0_0_24px_rgba(34,197,94,0.22)]" : "shadow-sm",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-xs font-semibold uppercase tracking-[0.12em]", style.labelClassName)}>{label}</p>
        <span className={cn("h-3 w-3 rounded-full", style.dotClassName)} aria-hidden="true" />
      </div>
      <p className={cn("mt-3 text-4xl font-semibold leading-none", style.valueClassName)}>{value}</p>
      <div className={cn("mt-4 h-2 overflow-hidden rounded-full", style.trackClassName)}>
        <div className={cn("h-full rounded-full", style.fillClassName)} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
      </div>
    </div>
  );
}

function getReadinessStyle(percentage: number) {
  if (percentage > 66.66) {
    return {
      cardClassName: "border-emerald-200 bg-emerald-50/80",
      labelClassName: "text-emerald-700",
      valueClassName: "text-emerald-800",
      dotClassName: "bg-emerald-500",
      trackClassName: "bg-emerald-100",
      fillClassName: "bg-emerald-500",
    };
  }

  if (percentage >= 33.34) {
    return {
      cardClassName: "border-amber-200 bg-amber-50/80",
      labelClassName: "text-amber-700",
      valueClassName: "text-amber-800",
      dotClassName: "bg-amber-500",
      trackClassName: "bg-amber-100",
      fillClassName: "bg-amber-500",
    };
  }

  return {
    cardClassName: "border-red-200 bg-red-50/80",
    labelClassName: "text-red-700",
    valueClassName: "text-red-800",
    dotClassName: "bg-red-500",
    trackClassName: "bg-red-100",
    fillClassName: "bg-red-500",
  };
}

function getHandoffStatus(organization: AdminOrganizationDetail, labels: AdminLabels) {
  if (!organization.concierge?.onboardingNextAction) {
    return { label: labels.missingNextAction, tone: "warning" as const };
  }

  if (!organization.concierge?.nextFollowUpDate) {
    return { label: labels.missingFollowUpDate, tone: "warning" as const };
  }

  if (organization.triageStatus === "at_risk" || organization.concierge.priority === "high") {
    return { label: labels.needsUpdate, tone: "warning" as const };
  }

  return { label: labels.handoffReady, tone: "ready" as const };
}

function buildHandoffSummaryText({
  organization,
  labels,
  locale,
}: {
  organization: AdminOrganizationDetail;
  labels: AdminLabels;
  locale: string;
}) {
  const concierge = organization.concierge;
  const missingActions = organization.missingActions.slice(0, 5).map((action) => `- ${action.label}`);
  const internalNoteExcerpt = truncateText(concierge?.internalNote ?? concierge?.onboardingOwnerNote ?? "", 500);

  return [
    `${labels.internalHandoffSummary} — Supplier Passport`,
    `${labels.organization}: ${organization.name}`,
    `${labels.portfolio}: ${concierge?.portfolioLabel || labels.noPortfolioAssigned}`,
    `${labels.assistedBy}: ${concierge?.partnerLabel || labels.notProvided}`,
    `${labels.conciergeStatus}: ${formatConciergeStatus(concierge?.status ?? "not_started", labels)}`,
    `${labels.priority}: ${formatPriority(concierge?.priority ?? "normal", labels)}`,
    `${labels.onboardingStatus}: ${formatOnboardingStatus(concierge?.onboardingStatus ?? "not_started", labels)}`,
    `${labels.onboardingProgress}: ${organization.onboardingChecklistDone}/${organization.onboardingChecklistTotal}`,
    `${labels.completion}: ${organization.readinessPercent}%`,
    `${labels.evidenceSummary}: ${organization.linkedEvidenceCount} ${labels.linkedEvidence.toLowerCase()} / ${organization.documentCount} ${labels.documents.toLowerCase()}`,
    `${labels.certificateExpiryWarnings}: ${organization.certificateWarningCount}`,
    `${labels.buyerRequests}: ${organization.buyerRequestCount}`,
    `${labels.shareLinkStatus}: ${organization.activeShareLink ? labels.activePublicLink : labels.noActivePublicLink}`,
    `${labels.onboardingNextAction}: ${concierge?.onboardingNextAction || labels.notProvided}`,
    `${labels.nextFollowUp}: ${formatDate(concierge?.nextFollowUpDate ?? null, locale, labels.notProvided)}`,
    `${labels.missingSteps}:`,
    ...(missingActions.length ? missingActions : [`- ${labels.noMissingSteps}`]),
    `${labels.internalNote}: ${internalNoteExcerpt || labels.notProvided}`,
    `${labels.notes}: ${labels.internalUseOnly}`,
  ].join("\n");
}

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3)}...`;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "organization";
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
