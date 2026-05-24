import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "use-intl";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { routing } from "@/i18n/routing";
import { legalPackageContent } from "@/lib/legal/legal-package-content";

type DpaPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: DpaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = legalPackageContent.dpa[normalizeLocale(locale)];

  return {
    title: `${content.hero.title} | Supplier Passport`,
    description: content.hero.summary,
  };
}

export default async function DpaPage({ params }: DpaPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const normalizedLocale = normalizeLocale(locale);

  return <LegalPageLayout content={legalPackageContent.dpa[normalizedLocale]} locale={normalizedLocale} />;
}

function normalizeLocale(locale: string): "en" | "hr" {
  return locale === "hr" ? "hr" : "en";
}
