"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Link2,
  PlayCircle,
  Share2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { SectionCard } from "@/components/shared/section-card";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardSetupSummary } from "@/lib/data/dashboard";
import {
  createEmptyPassportChecklistProgress,
  getPassportChecklistProgressSnapshot,
  subscribePassportChecklistProgress,
  type PassportChecklistProgress,
} from "@/lib/passport-checklist-progress";

type FirstPassportChecklistCardProps = {
  summary: DashboardSetupSummary | null;
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

type QuickStartItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  completed: boolean;
  recommended?: boolean;
  icon: typeof FileText;
};

export function FirstPassportChecklistCard({
  summary,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: FirstPassportChecklistCardProps) {
  const quickStart = labels.quickStart;
  const actionProgressSnapshot = useSyncExternalStore(
    subscribePassportChecklistProgress,
    () => getPassportChecklistProgressSnapshot(summary?.organizationId),
    () => "loading",
  );
  const actionProgress = useMemo(
    () => parseActionProgressSnapshot(actionProgressSnapshot),
    [actionProgressSnapshot],
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  if (actionProgressSnapshot === "loading") {
    return <ChecklistLoadingCard labels={labels} localePrefix={localePrefix} />;
  }

  const items = createQuickStartItems(summary, labels, localePrefix, actionProgress);
  const completedSteps = items.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedSteps / items.length) * 100);
  const allStepsComplete = completedSteps === items.length;
  const nextItem = items.find((item) => !item.completed);
  const activePublicSharePath = summary?.activeShareLinks[0]?.publicPath ?? null;
  const publicShareUrl = activePublicSharePath
    ? `${localePrefix}${activePublicSharePath}`
    : null;
  const mainHref = allStepsComplete
    ? `${localePrefix}/dashboard/passport`
    : nextItem?.href ?? `${localePrefix}/dashboard`;
  const mainLabel =
    allStepsComplete ? quickStart.reviewAndSharePassport : quickStart.continueSetup;
  const handleCopyPublicLink = async () => {
    if (!publicShareUrl || typeof navigator === "undefined") {
      return;
    }

    try {
      const absoluteUrl = new URL(publicShareUrl, window.location.origin).toString();
      await navigator.clipboard.writeText(absoluteUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  return (
    <SectionCard
      title={quickStart.title}
      description={quickStart.subtitle}
      className="border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40"
      contentClassName="flex flex-col gap-5"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={restartSupplierTour}
          className="restart-guide-cta hidden rounded-full px-4 font-semibold sm:inline-flex"
        >
          <PlayCircle aria-hidden="true" className="size-4" />
          {quickStart.startGuidedTour}
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-emerald-100 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {formatTemplate(quickStart.progress, {
                  completed: String(completedSteps),
                  total: String(items.length),
                })}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {nextItem && !allStepsComplete
                  ? formatTemplate(quickStart.next, { title: nextItem.title })
                  : quickStart.reviewAndSharePassport}
              </p>
            </div>
            <DashboardStatusPill tone={allStepsComplete ? "green" : "blue"}>
              {`${progressPercent}%`}
            </DashboardStatusPill>
          </div>
          <div
            aria-hidden="true"
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={mainHref}
              className="inline-flex h-7 items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {mainLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={restartSupplierTour}
              className="restart-guide-cta rounded-full px-4 font-semibold sm:hidden"
            >
              <PlayCircle aria-hidden="true" className="size-4" />
              {quickStart.startGuidedTour}
            </Button>
          </div>
          <BuyerPreviewCard
            summary={summary}
            labels={labels}
            localePrefix={localePrefix}
            isComplete={allStepsComplete}
            publicShareUrl={publicShareUrl}
            copyState={copyState}
            onCopyPublicLink={handleCopyPublicLink}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <QuickStartChecklistItem key={item.key} item={item} labels={labels} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function parseActionProgressSnapshot(snapshot: string): PassportChecklistProgress {
  if (!snapshot) {
    return createEmptyPassportChecklistProgress();
  }

  try {
    const parsed = JSON.parse(snapshot) as Partial<PassportChecklistProgress>;

    return {
      passportViewed: parsed.passportViewed === true,
      pdfDownloaded: parsed.pdfDownloaded === true,
    };
  } catch {
    return createEmptyPassportChecklistProgress();
  }
}

function ChecklistLoadingCard({
  labels,
  localePrefix,
}: {
  labels: DashboardOverviewLabels;
  localePrefix: string;
}) {
  const loadingLabel = localePrefix.startsWith("/hr") ? "Učitavanje kontrolne liste..." : "Loading checklist...";

  return (
    <SectionCard
      title={labels.quickStart.title}
      description={labels.quickStart.subtitle}
      className="border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40"
      contentClassName="flex flex-col gap-5"
    >
      <div className="flex min-h-32 items-center justify-center rounded-xl border border-emerald-100 bg-white p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="size-5 rounded-full border-2 border-emerald-100 border-t-emerald-500 motion-safe:animate-spin" />
          {loadingLabel}
        </div>
      </div>
    </SectionCard>
  );
}

function BuyerPreviewCard({
  summary,
  labels,
  localePrefix,
  isComplete,
  publicShareUrl,
  copyState,
  onCopyPublicLink,
}: {
  summary: DashboardSetupSummary | null;
  labels: DashboardOverviewLabels;
  localePrefix: string;
  isComplete: boolean;
  publicShareUrl: string | null;
  copyState: "idle" | "copied" | "error";
  onCopyPublicLink: () => void;
}) {
  if (!isComplete) {
    return (
      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          {labels.buyerPreviewTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {labels.buyerPreviewIncompleteText}
        </p>
      </div>
    );
  }

  const companyName =
    summary?.companyLegalName || summary?.organizationName || labels.buyerPreviewNotProvided;
  const location = summary?.companyLocation || labels.buyerPreviewNotProvided;
  const industry = summary?.companyIndustry || labels.buyerPreviewNotProvided;
  const employeeCount = summary?.companyEmployeeCount || labels.buyerPreviewNotProvided;
  const shareHref = publicShareUrl ?? `${localePrefix}/dashboard/share`;

  return (
    <div className="mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-sky-50/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {labels.buyerPreviewTitle}
          </p>
          <p className="mt-2 break-words text-lg font-semibold leading-tight text-slate-950">
            {companyName}
          </p>
        </div>
        <DashboardStatusPill tone="green">{labels.passportReadyTitle}</DashboardStatusPill>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <BuyerPreviewMeta label={labels.buyerPreviewLocation} value={location} />
        <BuyerPreviewMeta label={labels.buyerPreviewIndustry} value={industry} />
        <BuyerPreviewMeta label={labels.buyerPreviewEmployees} value={employeeCount} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <BuyerPreviewBadge>
          {formatTemplate(labels.missingDataBadge, {
            count: String(summary?.missingItemsCount ?? 0),
          })}
        </BuyerPreviewBadge>
        <BuyerPreviewBadge>
          {formatTemplate(labels.uploadedDocumentsBadge, {
            count: String(summary?.documentsCount ?? 0),
          })}
        </BuyerPreviewBadge>
        <BuyerPreviewBadge>
          {formatTemplate(labels.linkedDocumentsBadge, {
            count: String(summary?.linkedEvidenceCount ?? 0),
          })}
        </BuyerPreviewBadge>
        <BuyerPreviewBadge>
          {formatTemplate(labels.questionnaireAnswersBadge, {
            completed: String(summary?.answeredQuestions ?? 0),
            total: String(summary?.totalQuestions ?? 0),
          })}
        </BuyerPreviewBadge>
        <BuyerPreviewBadge tone={publicShareUrl ? "green" : "amber"}>
          {publicShareUrl
            ? labels.buyerPreviewPublicLinkActive
            : labels.buyerPreviewPublicLinkMissing}
        </BuyerPreviewBadge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {publicShareUrl ? (
          <>
            <Link
              href={shareHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {labels.buyerPreviewOpenPublic}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCopyPublicLink}
              className="h-8 rounded-full border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              <Link2 aria-hidden="true" className="size-3.5" />
              {copyState === "copied" ? labels.linkCopied : labels.buyerPreviewCopyLink}
            </Button>
          </>
        ) : (
          <Link
            href={shareHref}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {labels.buyerPreviewCreateLink}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function BuyerPreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-white/80 bg-white/75 px-3 py-2">
      <span className="shrink-0 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function BuyerPreviewBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber";
}) {
  const className =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-white/80 text-slate-700";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function QuickStartChecklistItem({
  item,
  labels,
}: {
  item: QuickStartItem;
  labels: DashboardOverviewLabels;
}) {
  const Icon = item.icon;
  const status = item.completed
    ? labels.quickStart.completed
    : item.recommended
      ? labels.quickStart.recommended
      : labels.quickStart.pending;

  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5 shrink-0">
        {item.completed ? (
          <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-500" />
        ) : (
          <Circle aria-hidden="true" className="size-5 text-slate-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-emerald-700" />
            <p className="min-w-0 font-semibold text-slate-950">{item.title}</p>
          </div>
          <DashboardStatusPill tone={item.completed ? "green" : item.recommended ? "blue" : "amber"}>
            {status}
          </DashboardStatusPill>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
        <Link
          href={item.href}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {item.cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function createQuickStartItems(
  summary: DashboardSetupSummary | null,
  labels: DashboardOverviewLabels,
  localePrefix: string,
  actionProgress: PassportChecklistProgress,
): QuickStartItem[] {
  const quickStart = labels.quickStart;
  const companyBasics = summary?.sectionProgress.find(
    (section) => section.code === "company_basics",
  );
  const companyBasicsComplete = Boolean(
    companyBasics && companyBasics.total > 0 && companyBasics.completed >= companyBasics.total,
  );
  const readinessPercent = summary?.readinessPercent ?? 0;
  const hasPassportSummary = Boolean(summary && summary.totalQuestions > 0);

  return [
    {
      key: "company-basics",
      title: quickStart.companyBasicsTitle,
      description: quickStart.companyBasicsDescription,
      href: `${localePrefix}/dashboard/questionnaire?section=company_basics`,
      cta: quickStart.openCompanyBasics,
      completed: companyBasicsComplete,
      icon: FileText,
    },
    {
      key: "key-sections",
      title: quickStart.keySectionsTitle,
      description: quickStart.keySectionsDescription,
      href: `${localePrefix}/dashboard/questionnaire`,
      cta: quickStart.openQuestionnaire,
      completed: readinessPercent >= 50,
      icon: FileText,
    },
    {
      key: "upload-evidence",
      title: quickStart.uploadEvidenceTitle,
      description: quickStart.uploadEvidenceDescription,
      href: `${localePrefix}/dashboard/documents`,
      cta: quickStart.openDocuments,
      completed: (summary?.documentsCount ?? 0) > 0,
      icon: UploadCloud,
    },
    {
      key: "link-evidence",
      title: quickStart.linkEvidenceTitle,
      description: quickStart.linkEvidenceDescription,
      href: `${localePrefix}/dashboard/documents`,
      cta: quickStart.openDocuments,
      completed: (summary?.linkedEvidenceCount ?? 0) > 0,
      icon: Link2,
    },
    {
      key: "review-passport",
      title: quickStart.reviewPassportTitle,
      description: quickStart.reviewPassportDescription,
      href: `${localePrefix}/dashboard/passport`,
      cta: quickStart.openPassport,
      completed: actionProgress.passportViewed,
      recommended: hasPassportSummary && !actionProgress.passportViewed,
      icon: FileText,
    },
    {
      key: "public-link",
      title: quickStart.createPublicLinkTitle,
      description: quickStart.createPublicLinkDescription,
      href: `${localePrefix}/dashboard/share`,
      cta: quickStart.openShare,
      completed: (summary?.activeShareLinkCount ?? 0) > 0,
      icon: Share2,
    },
    {
      key: "pdf-draft",
      title: quickStart.downloadPdfTitle,
      description: quickStart.downloadPdfDescription,
      href: `${localePrefix}/dashboard/passport`,
      cta: quickStart.openPassport,
      completed: actionProgress.pdfDownloaded,
      recommended: Boolean(summary?.pdfAvailable) && !actionProgress.pdfDownloaded,
      icon: Download,
    },
  ];
}

function restartSupplierTour() {
  window.dispatchEvent(new CustomEvent("supplier-passport-tour:restart"));
}

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}
