"use client";

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
  const items = createQuickStartItems(summary, labels, localePrefix);
  const completedSteps = items.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedSteps / items.length) * 100);
  const nextItem = items.find((item) => !item.completed) ?? items.at(-1);
  const mainHref = nextItem?.completed
    ? `${localePrefix}/dashboard/passport`
    : nextItem?.href ?? `${localePrefix}/dashboard`;
  const mainLabel =
    completedSteps === items.length ? quickStart.reviewAndSharePassport : quickStart.continueSetup;

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
                {nextItem
                  ? formatTemplate(quickStart.next, { title: nextItem.title })
                  : quickStart.reviewAndSharePassport}
              </p>
            </div>
            <DashboardStatusPill tone={completedSteps === items.length ? "green" : "blue"}>
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
      completed: false,
      recommended: hasPassportSummary,
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
      completed: false,
      recommended: Boolean(summary?.pdfAvailable),
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
