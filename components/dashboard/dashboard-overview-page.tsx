"use client";

import { useEffect, useState } from "react";
import { ActiveShareLinksCard } from "@/components/dashboard/active-share-links-card";
import { BuyerRequestsCard } from "@/components/dashboard/buyer-requests-card";
import { MissingDataSummaryCard } from "@/components/dashboard/missing-data-summary-card";
import { ModuleCompletionCard } from "@/components/dashboard/module-completion-card";
import { OverallReadinessCard } from "@/components/dashboard/overall-readiness-card";
import { ReadinessChartCard } from "@/components/dashboard/readiness-chart-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { RecentUploadsCard } from "@/components/dashboard/recent-uploads-card";
import { SupplierPassportSetupCard } from "@/components/dashboard/supplier-passport-setup-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { PageHeader } from "@/components/layout/page-header";
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
  const moduleCompletion = setupSummary?.sectionProgress.map((section) => ({
    name: section.title,
    completed: section.completed,
    total: section.total,
    percent: section.percent,
  })) ?? [];
  const missingDataSummary = {
    total: setupSummary?.missingItemsCount ?? 0,
    items: setupSummary?.missingSections.map((section) => ({
      area: section.title,
      items: section.missing,
    })) ?? [],
  };
  const tasks = createDashboardTasks(setupSummary, labels);
  const readinessData = setupSummary
    ? [{ day: labels.lastUpdated, readiness: setupSummary.readinessPercent }]
    : [];

  useEffect(() => {
    let cancelled = false;

    async function loadUserName() {
      const session = await getFreshBrowserNhostSession();
      const user = session?.user as
        | {
            displayName?: string | null;
            email?: string | null;
            metadata?: { displayName?: string; name?: string; fullName?: string };
          }
        | undefined;

      if (!user || cancelled) {
        return;
      }

      setWelcomeName(getUserSafeLabel(user, labels.account));
    }

    void loadUserName();

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

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr_0.8fr]">
        <OverallReadinessCard
          readiness={setupSummary?.readinessPercent ?? 0}
          label={getReadinessLabel(setupSummary?.readinessPercent ?? 0, labels)}
          lastUpdated={formatDate(setupSummary?.lastUpdated, labels)}
          modules={moduleCompletion}
          labels={labels}
        />
        <ModuleCompletionCard
          modules={moduleCompletion}
          labels={labels}
          localePrefix={localePrefix}
        />
        <MissingDataSummaryCard
          total={missingDataSummary.total}
          items={missingDataSummary.items}
          labels={labels}
          localePrefix={localePrefix}
        />
      </section>

      <SupplierPassportSetupCard
        summary={setupSummary}
        labels={labels}
        localePrefix={localePrefix}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <BuyerRequestsCard requests={[]} labels={labels} />
        <RecentUploadsCard uploads={setupSummary?.recentUploads ?? []} labels={labels} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TasksCard tasks={tasks} labels={labels} />
        <ReadinessChartCard
          data={readinessData}
          improvementText={labels.readinessHelper}
          rangeLabel={labels.lastUpdated}
          endValue={setupSummary?.readinessPercent ?? 0}
          labels={labels}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActiveShareLinksCard links={setupSummary?.activeShareLinks ?? []} labels={labels} />
        <RecentActivityCard activity={setupSummary?.recentActivity ?? []} labels={labels} />
      </section>
    </div>
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
