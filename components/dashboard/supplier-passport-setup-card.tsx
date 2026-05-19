import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Link2,
  UploadCloud,
} from "lucide-react";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { SectionCard } from "@/components/shared/section-card";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardSetupSummary } from "@/lib/data/dashboard";

type SupplierPassportSetupCardProps = {
  summary: DashboardSetupSummary | null;
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
};

type SetupItem = {
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  completed: boolean;
  available?: boolean;
  metric: string;
  icon: typeof FileText;
};

export function SupplierPassportSetupCard({
  summary,
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
}: SupplierPassportSetupCardProps) {
  const setup = labels.setupChecklist;
  const nextStep = getNextRecommendedStep(summary, labels);
  const items = createSetupItems(summary, labels, localePrefix);
  const metrics = createMetrics(summary, labels);

  return (
    <SectionCard
      title={setup.title}
      description={setup.description}
      className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/40"
      contentClassName="flex flex-col gap-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {setup.nextRecommendedStep}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{nextStep}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary ? setup.readinessDisclaimer : setup.emptyDescription}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {!summary ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {setup.neutralFallback}
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <SetupChecklistItem key={item.key} item={item} labels={labels} />
        ))}
      </div>
    </SectionCard>
  );
}

function SetupChecklistItem({
  item,
  labels,
}: {
  item: SetupItem;
  labels: DashboardOverviewLabels;
}) {
  const Icon = item.icon;
  const statusLabel = item.completed
    ? labels.setupChecklist.completed
    : item.available
      ? labels.setupChecklist.available
      : labels.setupChecklist.pending;

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5">
        {item.completed ? (
          <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-500" />
        ) : (
          <Circle aria-hidden="true" className="size-5 text-slate-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-blue-700" />
              <p className="font-semibold text-slate-950">{item.title}</p>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
          <DashboardStatusPill tone={item.completed ? "green" : item.available ? "blue" : "amber"}>
            {statusLabel}
          </DashboardStatusPill>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">{item.metric}</span>
          <Link
            href={item.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            {item.cta}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function createSetupItems(
  summary: DashboardSetupSummary | null,
  labels: DashboardOverviewLabels,
  localePrefix: string,
): SetupItem[] {
  const setup = labels.setupChecklist;
  const answered = summary?.answeredQuestions ?? 0;
  const total = summary?.totalQuestions ?? 0;
  const documents = summary?.documentsCount ?? 0;
  const links = summary?.linkedEvidenceCount ?? 0;
  const shareLinks = summary?.activeShareLinkCount ?? 0;
  const pdfAvailable = Boolean(summary?.pdfAvailable);

  return [
    {
      key: "questionnaire",
      title: setup.completeQuestionnaire,
      description: setup.completeQuestionnaireDescription,
      cta: setup.completeQuestionnaireCta,
      href: `${localePrefix}/dashboard/questionnaire`,
      completed: total > 0 && answered > 0,
      metric: total > 0 ? `${answered}/${total}` : `0/0`,
      icon: FileText,
    },
    {
      key: "documents",
      title: setup.uploadEvidence,
      description: setup.uploadEvidenceDescription,
      cta: setup.uploadEvidenceCta,
      href: `${localePrefix}/dashboard/documents`,
      completed: documents > 0,
      metric: `${documents}`,
      icon: UploadCloud,
    },
    {
      key: "links",
      title: setup.linkEvidence,
      description: setup.linkEvidenceDescription,
      cta: setup.linkEvidenceCta,
      href: `${localePrefix}/dashboard/documents`,
      completed: links > 0,
      available: documents > 0,
      metric: `${links}`,
      icon: Link2,
    },
    {
      key: "passport",
      title: setup.reviewPassport,
      description: setup.reviewPassportDescription,
      cta: setup.reviewPassportCta,
      href: `${localePrefix}/dashboard/passport`,
      completed: Boolean(summary && summary.readinessPercent > 0),
      available: Boolean(summary),
      metric: `${summary?.readinessPercent ?? 0}%`,
      icon: FileText,
    },
    {
      key: "share",
      title: setup.sharePublicLink,
      description: setup.sharePublicLinkDescription,
      cta: setup.sharePublicLinkCta,
      href: `${localePrefix}/dashboard/share`,
      completed: shareLinks > 0,
      available: Boolean(summary),
      metric: `${shareLinks}`,
      icon: Link2,
    },
    {
      key: "pdf",
      title: setup.downloadPdf,
      description: setup.downloadPdfDescription,
      cta: setup.downloadPdfCta,
      href: `${localePrefix}/dashboard/passport`,
      completed: pdfAvailable,
      available: Boolean(summary),
      metric: pdfAvailable ? labels.statuses.Active : labels.statuses["Not started"],
      icon: Download,
    },
  ];
}

function createMetrics(summary: DashboardSetupSummary | null, labels: DashboardOverviewLabels) {
  const setup = labels.setupChecklist;

  return [
    {
      label: setup.questionsAnswered,
      value: summary ? `${summary.answeredQuestions}/${summary.totalQuestions}` : "0/0",
    },
    { label: setup.documentsUploaded, value: String(summary?.documentsCount ?? 0) },
    { label: setup.evidenceLinks, value: String(summary?.linkedEvidenceCount ?? 0) },
    { label: setup.activeShareLinksMetric, value: String(summary?.activeShareLinkCount ?? 0) },
    { label: setup.pdfReady, value: summary?.pdfAvailable ? labels.statuses.Active : labels.statuses["Not started"] },
  ];
}

function getNextRecommendedStep(
  summary: DashboardSetupSummary | null,
  labels: DashboardOverviewLabels,
) {
  const setup = labels.setupChecklist;

  if (!summary || summary.answeredQuestions === 0) {
    return setup.startQuestionnaire;
  }

  if (summary.documentsCount === 0) {
    return setup.uploadDocumentsNext;
  }

  if (summary.linkedEvidenceCount === 0) {
    return setup.linkEvidenceNext;
  }

  if (summary.activeShareLinkCount === 0) {
    return setup.reviewAndShareNext;
  }

  return setup.downloadOrShareNext;
}
