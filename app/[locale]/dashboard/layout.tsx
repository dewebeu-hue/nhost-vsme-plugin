import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SupplierOnboardingTour, type SupplierOnboardingTourLabels } from "@/components/onboarding/supplier-onboarding-tour";
import type { AppLocale } from "@/i18n/routing";
import type { DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardRouteLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardRouteLayout({
  children,
  params,
}: DashboardRouteLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations("navigation");
  const statuses = await getTranslations("statuses");
  const shell = await getTranslations("dashboard.shell");
  const tour = await getTranslations("onboardingTour");
  const cookieConsent = await getTranslations("cookieConsent");

  const labels: DashboardShellLabels = {
    navigation: {
      dashboard: nav("dashboard"),
      companyProfile: nav("companyProfile"),
      buyerRequests: nav("buyerRequests"),
      questionnaire: nav("questionnaire"),
      evidenceRoom: nav("evidenceRoom"),
      passport: nav("passport"),
      share: nav("share"),
      activity: nav("activity"),
      settings: nav("settings"),
    },
    verified: statuses("verified"),
    verifiedSupplier: shell("verifiedSupplier"),
    plan: shell("plan"),
    renewal: shell("renewal"),
    workspace: shell("workspace"),
    account: shell("account"),
    cookieSettings: cookieConsent("settings"),
    logOut: shell("logOut"),
    needHelp: shell("needHelp"),
    helpCenter: shell("helpCenter"),
    supportRequest: {
      contactSupport: shell("supportRequest.contactSupport"),
      description: shell("supportRequest.description"),
      category: shell("supportRequest.category"),
      subject: shell("supportRequest.subject"),
      message: shell("supportRequest.message"),
      sendRequest: shell("supportRequest.sendRequest"),
      sending: shell("supportRequest.sending"),
      sent: shell("supportRequest.sent"),
      error: shell("supportRequest.error"),
      validation: shell("supportRequest.validation"),
      close: shell("supportRequest.close"),
      categories: {
        general: shell("supportRequest.categories.general"),
        questionnaire: shell("supportRequest.categories.questionnaire"),
        documents: shell("supportRequest.categories.documents"),
        evidence_links: shell("supportRequest.categories.evidence_links"),
        sharing: shell("supportRequest.categories.sharing"),
        passport_pdf: shell("supportRequest.categories.passport_pdf"),
        account: shell("supportRequest.categories.account"),
        other: shell("supportRequest.categories.other"),
      },
    },
    openNavigation: shell("openNavigation"),
  };
  const tourLabels: SupplierOnboardingTourLabels = {
    startGuide: tour("startGuide"),
    skipForNow: tour("skipForNow"),
    restartGuide: tour("restartGuide"),
    next: tour("next"),
    back: tour("back"),
    skip: tour("skip"),
    finish: tour("finish"),
    stepLabel: tour("stepLabel"),
    promptTitle: tour("promptTitle"),
    promptText: tour("promptText"),
    missingTargetText: tour("missingTargetText"),
    steps: Array.from({ length: 11 }, (_, index) => ({
      title: tour(`steps.${index + 1}.title`),
      text: tour(`steps.${index + 1}.text`),
    })),
    mobileGuide: {
      title: tour("mobileGuide.title"),
      subtitle: tour("mobileGuide.subtitle"),
      close: tour("mobileGuide.close"),
      open: tour("mobileGuide.open"),
      steps: tour.raw("mobileGuide.steps") as string[],
    },
  };

  return (
    <DashboardLayout labels={labels} localePrefix={`/${locale}`}>
      {children}
      <SupplierOnboardingTour locale={locale as AppLocale} labels={tourLabels} />
    </DashboardLayout>
  );
}
