import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "use-intl";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { routing } from "@/i18n/routing";
import { privacyPolicyContent } from "@/lib/legal/privacy-policy-content";

type PrivacyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = privacyPolicyContent[normalizeLocale(locale)];

  return {
    title: `${content.hero.title} | Supplier Passport`,
    description: content.hero.summary,
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const normalizedLocale = normalizeLocale(locale);

  return <LegalPageLayout content={privacyPolicyContent[normalizedLocale]} locale={normalizedLocale} />;
}

function normalizeLocale(locale: string): "en" | "hr" {
  return locale === "hr" ? "hr" : "en";
}
