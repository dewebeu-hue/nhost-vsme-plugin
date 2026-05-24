"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LegalFooter } from "@/components/legal/legal-footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const demoEmailHref =
  "mailto:deweb.eu@gmail.com?subject=Supplier%20Passport%20demo%20request";

export function RequestDemoPageContent() {
  const locale = useLocale();
  const t = useTranslations("requestDemo");
  const cta = useTranslations("common.cta");
  const audiences = t.raw("audiences") as string[];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <LandingHeader />

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="max-w-3xl">
            <Badge className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              <ShieldCheck aria-hidden="true" />
              {t("eyebrow")}
            </Badge>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {t("description")}
            </p>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              {t("pilotNote")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={demoEmailHref}
                className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-5")}
              >
                <Mail data-icon="inline-start" />
                {t("contactCta")}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl bg-white px-5")}
              >
                {cta("startPassport")}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
            <h2 className="text-lg font-semibold text-slate-950">{t("whoTitle")}</h2>
            <ul className="mt-4 grid gap-3">
              {audiences.map((item) => (
                <li key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              {t("noFormNote")}
            </div>
            <Link
              href={`/${locale}/pricing`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5 h-11 w-full rounded-xl bg-white")}
            >
              {cta("viewFullPricing")}
            </Link>
          </aside>
        </div>
      </section>
      <LegalFooter />
    </main>
  );
}
