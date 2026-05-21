import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardOverviewPage } from "@/components/dashboard/dashboard-overview-page";
import { getDashboardSetupSummary } from "@/lib/data/dashboard";
import type { DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.overview");
  const share = await getTranslations("share");
  const statuses = await getTranslations("statuses");
  const shell = await getTranslations("dashboard.shell");

  const labels: DashboardOverviewLabels = {
    title: t("welcome", { name: "{name}" }),
    account: shell("account"),
    subtitle: t("subtitle"),
    overallReadiness: t("overallReadiness"),
    readinessDescription: t("readinessDescription"),
    goodProgress: t("goodProgress"),
    readinessNeedsAttention: share("readinessNeedsAttention"),
    readinessInProgress: share("readinessInProgress"),
    readinessBuyerReadyDraft: share("readinessBuyerReadyDraft"),
    readinessStrong: share("readinessStrong"),
    ready: t("ready"),
    vsme: t("vsme"),
    readinessHelper: t("readinessHelper"),
    lastUpdated: t("lastUpdated"),
    moduleCompletion: t("moduleCompletion"),
    moduleDescription: t("moduleDescription"),
    viewAllSections: t("viewAllSections"),
    missingDataSummary: t("missingDataSummary"),
    missingDataDescription: t("missingDataDescription"),
    totalMissingData: t("totalMissingData"),
    items: t("items"),
    goToMissingData: t("goToMissingData"),
    recentBuyerRequests: t("recentBuyerRequests"),
    buyerRequestsDescription: t("buyerRequestsDescription"),
    due: t("due"),
    recentUploads: t("recentUploads"),
    recentUploadsDescription: t("recentUploadsDescription"),
    yourTasks: t("yourTasks"),
    tasksDescription: t("tasksDescription"),
    readinessOverTime: t("readinessOverTime"),
    endValue: t("endValue"),
    activeShareLinks: t("activeShareLinks"),
    activeShareLinksDescription: t("activeShareLinksDescription"),
    expires: t("expires"),
    recentActivity: t("recentActivity"),
    recentActivityDescription: t("recentActivityDescription"),
    noBuyerRequests: t("noBuyerRequests"),
    noRecentUploads: t("noRecentUploads"),
    noRecentActivity: t("noRecentActivity"),
    noActiveShareLinks: t("noActiveShareLinks"),
    noReadinessTrend: t("noReadinessTrend"),
    publicSupplierPassport: t("publicSupplierPassport"),
    noExpiry: t("noExpiry"),
    setupChecklist: {
      title: t("setupChecklist.title"),
      description: t("setupChecklist.description"),
      emptyTitle: t("setupChecklist.emptyTitle"),
      emptyDescription: t("setupChecklist.emptyDescription"),
      nextRecommendedStep: t("setupChecklist.nextRecommendedStep"),
      readinessDisclaimer: t("setupChecklist.readinessDisclaimer"),
      completed: t("setupChecklist.completed"),
      available: t("setupChecklist.available"),
      pending: t("setupChecklist.pending"),
      completeQuestionnaire: t("setupChecklist.completeQuestionnaire"),
      completeQuestionnaireDescription: t("setupChecklist.completeQuestionnaireDescription"),
      completeQuestionnaireCta: t("setupChecklist.completeQuestionnaireCta"),
      uploadEvidence: t("setupChecklist.uploadEvidence"),
      uploadEvidenceDescription: t("setupChecklist.uploadEvidenceDescription"),
      uploadEvidenceCta: t("setupChecklist.uploadEvidenceCta"),
      linkEvidence: t("setupChecklist.linkEvidence"),
      linkEvidenceDescription: t("setupChecklist.linkEvidenceDescription"),
      linkEvidenceCta: t("setupChecklist.linkEvidenceCta"),
      reviewPassport: t("setupChecklist.reviewPassport"),
      reviewPassportDescription: t("setupChecklist.reviewPassportDescription"),
      reviewPassportCta: t("setupChecklist.reviewPassportCta"),
      sharePublicLink: t("setupChecklist.sharePublicLink"),
      sharePublicLinkDescription: t("setupChecklist.sharePublicLinkDescription"),
      sharePublicLinkCta: t("setupChecklist.sharePublicLinkCta"),
      downloadPdf: t("setupChecklist.downloadPdf"),
      downloadPdfDescription: t("setupChecklist.downloadPdfDescription"),
      downloadPdfCta: t("setupChecklist.downloadPdfCta"),
      startQuestionnaire: t("setupChecklist.startQuestionnaire"),
      uploadDocumentsNext: t("setupChecklist.uploadDocumentsNext"),
      linkEvidenceNext: t("setupChecklist.linkEvidenceNext"),
      reviewAndShareNext: t("setupChecklist.reviewAndShareNext"),
      downloadOrShareNext: t("setupChecklist.downloadOrShareNext"),
      neutralFallback: t("setupChecklist.neutralFallback"),
      questionsAnswered: t("setupChecklist.questionsAnswered"),
      documentsUploaded: t("setupChecklist.documentsUploaded"),
      evidenceLinks: t("setupChecklist.evidenceLinks"),
      activeShareLinksMetric: t("setupChecklist.activeShareLinksMetric"),
      pdfReady: t("setupChecklist.pdfReady"),
    },
    activity: {
      answers: t("activity.answers"),
      documents: t("activity.documents"),
      links: t("activity.links"),
      share: t("activity.share"),
    },
    modules: {
      "Basic Information": t("modules.basicInformation"),
      Environment: t("modules.environment"),
      Social: t("modules.social"),
      Governance: t("modules.governance"),
    },
    statuses: {
      "Not started": statuses("notStarted"),
      "In progress": statuses("inProgress"),
      Completed: statuses("completed"),
      Reviewed: statuses("reviewed"),
      Uploaded: statuses("uploaded"),
      Linked: statuses("linked"),
      Active: statuses("active"),
    },
  };
  const setupSummary = await getDashboardSetupSummary().catch(() => null);

  return (
    <DashboardOverviewPage
      labels={labels}
      localePrefix={`/${locale}`}
      setupSummary={setupSummary}
    />
  );
}
