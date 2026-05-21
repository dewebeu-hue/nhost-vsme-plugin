import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type PlansAliasPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export function generateMetadata() {
  return {
    title: "Supplier Passport plans",
    description: "Supplier Passport commercial packages and feature matrix.",
  };
}

export default async function PlansAliasPage({ params }: PlansAliasPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/pricing`);
}
