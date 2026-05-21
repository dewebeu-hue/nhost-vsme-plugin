"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardList, FileWarning, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DashboardSetupSummary } from "@/lib/data/dashboard";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { cn } from "@/lib/utils";

export type MissingDataPageLabels = {
  title: string;
  subtitle: string;
  resolveGaps: string;
  openGaps: string;
  evidenceRequired: string;
  buyerReadiness: string;
  groupedByModule: string;
  taskAssignment: string;
  closingGaps: string;
  nextFocus: string;
  loading: string;
  unavailable: string;
  noGapsTitle: string;
  noGapsDescription: string;
  items: string;
  answerQuestions: string;
  uploadEvidence: string;
};

type MissingDataPageClientProps = {
  initialSummary?: DashboardSetupSummary | null;
  labels: MissingDataPageLabels;
  localePrefix: string;
};

export function MissingDataPageClient({
  initialSummary = null,
  labels,
  localePrefix,
}: MissingDataPageClientProps) {
  const [summary, setSummary] = useState<DashboardSetupSummary | null>(initialSummary);
  const [loaded, setLoaded] = useState(Boolean(initialSummary));

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      const session = await getFreshBrowserNhostSession();

      if (!session?.accessToken || cancelled) {
        setLoaded(true);
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
          setLoaded(true);
          return;
        }

        const payload = (await response.json()) as {
          summary?: DashboardSetupSummary | null;
        };

        if (!cancelled) {
          setSummary(payload.summary ?? null);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstMissingSection = summary?.missingSections[0];
  const resolveHref = firstMissingSection
    ? `${localePrefix}/dashboard/questionnaire?section=${encodeURIComponent(firstMissingSection.code)}`
    : `${localePrefix}/dashboard/questionnaire`;
  const evidenceHref = `${localePrefix}/dashboard/documents`;
  const topGaps = useMemo(() => summary?.missingSections ?? [], [summary]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        action={(
          <Link
            href={resolveHref}
            className={cn(buttonVariants(), "shadow-lg shadow-blue-600/15")}
          >
            {labels.resolveGaps}
            <ArrowRight data-icon="inline-end" />
          </Link>
        )}
      />

      <section className="grid gap-5 md:grid-cols-3">
        <MetricCard
          title={labels.openGaps}
          description={labels.groupedByModule}
          value={summary ? `${summary.missingItemsCount} ${labels.items}` : loaded ? "--" : labels.loading}
          progress={summary ? calculateGapProgress(summary.missingItemsCount, summary.totalQuestions) : 0}
          icon={AlertTriangle}
        />
        <MetricCard
          title={labels.evidenceRequired}
          description={labels.taskAssignment}
          value={summary ? `${summary.evidenceRequiredCount} ${labels.items}` : loaded ? "--" : labels.loading}
          progress={summary ? calculateGapProgress(summary.evidenceRequiredCount, summary.totalQuestions) : 0}
          icon={ClipboardList}
        />
        <MetricCard
          title={labels.buyerReadiness}
          description={labels.closingGaps}
          value={summary ? `${summary.readinessPercent}%` : loaded ? "--" : labels.loading}
          progress={summary?.readinessPercent ?? 0}
          icon={Target}
        />
      </section>

      <SectionCard title={labels.nextFocus} description={labels.groupedByModule}>
        {!loaded ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.loading}
          </p>
        ) : !summary ? (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {labels.unavailable}
          </p>
        ) : topGaps.length ? (
          <div className="grid gap-3">
            {topGaps.map((gap) => (
              <div
                key={gap.code}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <FileWarning aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-slate-950">{gap.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {gap.completed}/{gap.total} - {gap.missing} {labels.items}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`${localePrefix}/dashboard/questionnaire?section=${encodeURIComponent(gap.code)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {labels.answerQuestions}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-emerald-900">{labels.noGapsTitle}</p>
            <p className="mt-1 text-sm text-emerald-700">{labels.noGapsDescription}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={resolveHref} className={buttonVariants({ variant: "outline" })}>
            {labels.answerQuestions}
          </Link>
          <Link href={evidenceHref} className={buttonVariants({ variant: "outline" })}>
            {labels.uploadEvidence}
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

function MetricCard({
  title,
  description,
  value,
  progress,
  icon: Icon,
}: {
  title: string;
  description: string;
  value: string;
  progress: number;
  icon: typeof AlertTriangle;
}) {
  return (
    <SectionCard title={title} description={description} className="h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {value}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </SectionCard>
  );
}

function calculateGapProgress(count: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.round((count / total) * 100), 100);
}
