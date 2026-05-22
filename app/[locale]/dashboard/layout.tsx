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
    logOut: shell("logOut"),
    needHelp: shell("needHelp"),
    helpCenter: shell("helpCenter"),
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
    steps: Array.from({ length: 12 }, (_, index) => ({
      title: tour(`steps.${index + 1}.title`),
      text: tour(`steps.${index + 1}.text`),
    })),
  };

  return (
    <DashboardLayout labels={labels} localePrefix={`/${locale}`}>
      {children}
      <SupplierOnboardingTour locale={locale as AppLocale} labels={tourLabels} />
    </DashboardLayout>
  );
}
