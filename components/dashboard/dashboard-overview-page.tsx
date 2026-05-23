"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { ActiveShareLinksCard } from "@/components/dashboard/active-share-links-card";
import { BuyerRequestsCard } from "@/components/dashboard/buyer-requests-card";
import { FirstPassportChecklistCard } from "@/components/dashboard/first-passport-checklist-card";
import { MissingDataSummaryCard } from "@/components/dashboard/missing-data-summary-card";
import { OverallReadinessCard } from "@/components/dashboard/overall-readiness-card";
import { ReadinessChartCard } from "@/components/dashboard/readiness-chart-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { RecentUploadsCard } from "@/components/dashboard/recent-uploads-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualHelpCard } from "@/components/onboarding/contextual-help";
import {
  defaultDashboardOverviewLabels,
  type DashboardOverviewLabels,
} from "@/lib/dashboard-labels";
import type { DashboardSetupSummary } from "@/lib/data/dashboard";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";

type DashboardOverviewPageProps = {
  labels?: DashboardOverviewLabels;
  localePrefix?: string;
  setupSummary?: DashboardSetupSummary | null;
};

export function DashboardOverviewPage({
  labels = defaultDashboardOverviewLabels,
  localePrefix = "",
  setupSummary = null,
}: DashboardOverviewPageProps) {
  const [welcomeName, setWelcomeName] = useState(labels.account);
  const [liveSetupSummary, setLiveSetupSummary] = useState<DashboardSetupSummary | null>(
    setupSummary,
  );
  const summary = liveSetupSummary;
  const moduleCompletion = summary?.sectionProgress.map((section) => ({
    name: section.title,
    completed: section.completed,
    total: section.total,
    percent: section.percent,
  })) ?? [];
  const missingDataSummary = {
    total: summary?.missingItemsCount ?? 0,
    items: summary?.missingSections.map((section) => ({
      code: section.code,
      area: section.title,
      items: section.missing,
    })) ?? [],
  };
  const tasks = createDashboardTasks(summary, labels);
  const nextTask = tasks.find((task) => !task.completed) ?? tasks.at(-1);
  const readinessData = summary
    ? [{ day: labels.lastUpdated, readiness: summary.readinessPercent }]
    : [];

  useEffect(() => {
    let cancelled = false;

    async function loadBrowserSessionData() {
      const session = await getFreshBrowserNhostSession();
      const user = session?.user as
        | {
            displayName?: string | null;
            email?: string | null;
            metadata?: { displayName?: string; name?: string; fullName?: string };
          }
        | undefined;

      if (user && !cancelled) {
        setWelcomeName(getUserSafeLabel(user, labels.account));
      }

      if (!session?.accessToken || cancelled) {
        return;
      }

      try {
        const response = await fetch("/api/dashboard/summary", {
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as {
          summary?: DashboardSetupSummary | null;
        };

        if (payload.summary && !cancelled) {
          setLiveSetupSummary(payload.summary);
        }
      } catch {
        // Keep the server-rendered summary or neutral fallback.
      }
    }

    void loadBrowserSessionData();

    return () => {
      cancelled = true;
    };
  }, [labels.account]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <PageHeader
        title={labels.title.replace("{name}", welcomeName)}
        subtitle={labels.subtitle}
      />

      <section className="supplier-surface overflow-hidden rounded-3xl border-0 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-white p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              {labels.overallReadiness}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <p className="text-5xl font-semibold tracking-tight text-slate-950">
                {summary?.readinessPercent ?? 0}%
              </p>
              <p className="pb-2 text-sm font-semibold text-slate-600">
                {getReadinessLabel(summary?.readinessPercent ?? 0, labels)}
              </p>
            </div>
          </div>
          <div
            data-tour="dashboard-next-step"
            className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-white p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {labels.setupChecklist.nextRecommendedStep}
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
              {nextTask?.title ?? labels.setupChecklist.neutralFallback}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {labels.readinessHelper}
            </p>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(280px,0.75fr)]">
        <div data-tour="dashboard-readiness">
          <OverallReadinessCard
            readiness={summary?.readinessPercent ?? 0}
            label={getReadinessLabel(summary?.readinessPercent ?? 0, labels)}
            lastUpdated={formatDate(summary?.lastUpdated, labels)}
            modules={moduleCompletion}
            labels={labels}
            localePrefix={localePrefix}
          />
        </div>
        <MissingDataSummaryCard
          total={missingDataSummary.total}
          items={missingDataSummary.items}
          labels={labels}
          localePrefix={localePrefix}
        />
        <div className="grid gap-4 lg:col-span-2 xl:col-span-1">
          <ActiveShareLinksCard
            links={summary?.activeShareLinks ?? []}
            labels={labels}
            localePrefix={localePrefix}
            compact
          />
          <RecentActivityCard activity={summary?.recentActivity ?? []} labels={labels} compact />
          <BuyerRequestsCard
            requests={summary?.recentBuyerRequests ?? []}
            labels={labels}
            localePrefix={localePrefix}
            compact
          />
          <RecentUploadsCard
            uploads={summary?.recentUploads ?? []}
            labels={labels}
            localePrefix={localePrefix}
            compact
          />
        </div>
      </section>

      <FirstPassportChecklistCard
        summary={summary}
        labels={labels}
        localePrefix={localePrefix}
      />
      <BeforeYouStartCard labels={labels} localePrefix={localePrefix} />
      <ContextualHelpCard
        title={labels.contextualHelp.title}
        text={labels.contextualHelp.text}
        actionLabel={labels.contextualHelp.restartGuide}
        onAction={() => window.dispatchEvent(new CustomEvent("supplier-passport-tour:restart"))}
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TasksCard tasks={tasks} labels={labels} />
        <ReadinessChartCard
          data={readinessData}
          improvementText={labels.readinessHelper}
          rangeLabel={labels.lastUpdated}
          endValue={summary?.readinessPercent ?? 0}
          labels={labels}
        />
      </section>
    </div>
  );
}

function BeforeYouStartCard({
  labels,
  localePrefix,
}: {
  labels: DashboardOverviewLabels;
  localePrefix: string;
}) {
  const beforeStart = labels.beforeStart;

  return (
    <section className="supplier-surface rounded-3xl border-0 p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                {beforeStart.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {beforeStart.text}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {beforeStart.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-teal-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href={`${localePrefix}/dashboard/questionnaire?section=company_basics`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/25 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20 motion-reduce:transform-none"
            >
              {beforeStart.cta}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            {beforeStart.guideTitle}
          </h3>
          <ol className="mt-4 grid gap-3">
            {beforeStart.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl border border-teal-100 bg-teal-50/70 px-3 py-2 text-xs leading-5 text-teal-800">
            {beforeStart.privacyNote}
          </p>
        </aside>
      </div>
    </section>
  );
}

function createDashboardTasks(
  summary: DashboardSetupSummary | null,
  labels: DashboardOverviewLabels,
) {
  const setup = labels.setupChecklist;

  return [
    {
      title: setup.completeQuestionnaire,
      category: "Questionnaire",
      due: summary && summary.answeredQuestions > 0 ? setup.completed : setup.pending,
      completed: Boolean(summary && summary.answeredQuestions > 0),
    },
    {
      title: setup.uploadEvidence,
      category: "Evidence",
      due: summary && summary.documentsCount > 0 ? setup.completed : setup.pending,
      completed: Boolean(summary && summary.documentsCount > 0),
    },
    {
      title: setup.linkEvidence,
      category: "Evidence",
      due: summary && summary.linkedEvidenceCount > 0 ? setup.completed : setup.pending,
      completed: Boolean(summary && summary.linkedEvidenceCount > 0),
    },
    {
      title: setup.sharePublicLink,
      category: "Passport",
      due: summary && summary.activeShareLinkCount > 0 ? setup.completed : setup.pending,
      completed: Boolean(summary && summary.activeShareLinkCount > 0),
    },
  ];
}

function getReadinessLabel(readiness: number, labels: DashboardOverviewLabels) {
  if (readiness >= 100) {
    return labels.readinessStrong;
  }

  if (readiness > 200 / 3) {
    return labels.readinessBuyerReadyDraft;
  }

  if (readiness >= 100 / 3) {
    return labels.readinessInProgress;
  }

  if (readiness > 0) {
    return labels.readinessNeedsAttention;
  }

  return labels.statuses["Not started"] ?? "Not started";
}

function formatDate(value: string | null | undefined, labels: DashboardOverviewLabels) {
  if (!value) {
    return labels.setupChecklist.pending;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getUserSafeLabel(
  user: {
    displayName?: string | null;
    email?: string | null;
    metadata?: { displayName?: string; name?: string; fullName?: string };
  },
  fallbackLabel: string,
) {
  const metadataName =
    user.metadata?.displayName || user.metadata?.fullName || user.metadata?.name;
  const emailLocalPart = user.email?.split("@")[0];

  return user.displayName || metadataName || emailLocalPart || fallbackLabel;
}
