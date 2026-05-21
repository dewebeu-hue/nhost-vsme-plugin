import { getTranslations, setRequestLocale } from "next-intl/server";
import { MissingDataPageClient, type MissingDataPageLabels } from "@/components/dashboard/missing-data-page-client";
import { getDashboardSetupSummary } from "@/lib/data/dashboard";

type MissingDataPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function MissingDataPage({ params }: MissingDataPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.missingData");
  const labels: MissingDataPageLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    resolveGaps: t("resolveGaps"),
    openGaps: t("openGaps"),
    evidenceRequired: t("evidenceRequired"),
    buyerReadiness: t("buyerReadiness"),
    groupedByModule: t("groupedByModule"),
    taskAssignment: t("taskAssignment"),
    closingGaps: t("closingGaps"),
    nextFocus: t("nextFocus"),
    loading: t("loading"),
    unavailable: t("unavailable"),
    noGapsTitle: t("noGapsTitle"),
    noGapsDescription: t("noGapsDescription"),
    items: t("items"),
    answerQuestions: t("answerQuestions"),
    uploadEvidence: t("uploadEvidence"),
  };
  const summary = await getDashboardSetupSummary().catch(() => null);

  return (
    <MissingDataPageClient
      initialSummary={summary}
      labels={labels}
      localePrefix={`/${locale}`}
    />
  );
}
