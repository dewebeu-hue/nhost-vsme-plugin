import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "use-intl";
import { routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Supplier Passport — VSME Data Room for SME Suppliers",
    hr: "Supplier Passport — VSME Data Room za SME dobavljače",
    de: "Supplier Passport — VSME-Datenraum für KMU-Lieferanten",
  };
  const descriptions: Record<string, string> = {
    en: "Prepare your VSME profile, organize evidence, and share a professional Supplier Passport with buyers.",
    hr: "Pripremite VSME profil, organizirajte dokaznu dokumentaciju i podijelite profesionalni Supplier Passport s kupcima.",
    de: "Bereiten Sie Ihr VSME-Profil vor, organisieren Sie Nachweise und teilen Sie einen professionellen Supplier Passport mit Käufern.",
  };

  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
