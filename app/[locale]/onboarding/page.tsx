import { getMessages, setRequestLocale } from "next-intl/server";
import { OnboardingPageContent } from "@/app/onboarding/page";
import { defaultOnboardingLabels, type OnboardingLabels } from "@/lib/operational-labels";

type OnboardingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { onboarding?: Partial<OnboardingLabels> };

  return (
    <OnboardingPageContent
      labels={{ ...defaultOnboardingLabels, ...(messages.onboarding ?? {}) }}
      localePrefix={`/${locale}`}
    />
  );
}
