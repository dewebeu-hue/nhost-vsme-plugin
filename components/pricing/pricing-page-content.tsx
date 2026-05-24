"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LandingHeader } from "@/components/landing/landing-header";
import { FinalCta } from "@/components/landing/final-cta";
import { PricingCard } from "@/components/pricing/pricing-card";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { PricingSection } from "@/components/pricing/pricing-section";
import { LegalFooter } from "@/components/legal/legal-footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getPricingPlan,
  getPricingPlansByCategory,
  localizePricingPlan,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingPageContent() {
  const locale = useLocale();
  const t = useTranslations("pricing");
  const starter = localizeMaybe(getPricingPlan("starter"), t);
  const supplierPro = localizeMaybe(getPricingPlan("supplier-pro"), t);
  const partner = localizeMaybe(getPricingPlan("partner"), t);
  const buyerPlans = getPricingPlansByCategory("buyer").map((plan) =>
    localizePricingPlan(plan, t),
  );

  if (!starter || !supplierPro || !partner) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <LandingHeader />

      <section id="main-plans" className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Badge className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              <ShieldCheck aria-hidden="true" />
              {t("hero.eyebrow")}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {t("hero.description")}
            </p>

            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              {t("hero.annualNote")}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t("hero.setupNote")}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/signup`}
                className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-5")}
              >
                {t("hero.primaryCta")}
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href={`/${locale}/request-demo`}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl bg-white px-5")}
              >
                {t("hero.secondaryCta")}
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[starter, supplierPro, partner].map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="mx-auto max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-medium leading-6 text-blue-800">
            {t("hero.pricingStance")}
          </div>
        </div>
      </section>

      <PricingSection
        eyebrow={t("sections.partnerEyebrow")}
        title={t("sections.partnerTitle")}
        description={t("sections.partnerDescription")}
        plans={buyerPlans}
      />

      <PricingComparisonTable />
      <PricingFaq />
      <FinalCta />
      <LegalFooter />
    </main>
  );
}

function localizeMaybe(
  plan: ReturnType<typeof getPricingPlan>,
  t: Parameters<typeof localizePricingPlan>[1],
) {
  return plan ? localizePricingPlan(plan, t) : undefined;
}
