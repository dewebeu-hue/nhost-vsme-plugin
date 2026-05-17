"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { FinalCta } from "@/components/landing/final-cta";
import { BillingToggle } from "@/components/pricing/billing-toggle";
import { FoundingPartnerBanner } from "@/components/pricing/founding-partner-banner";
import { PricingCard } from "@/components/pricing/pricing-card";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { PricingSection } from "@/components/pricing/pricing-section";
import { Badge } from "@/components/ui/badge";
import {
  type BillingCycle,
  getPricingPlan,
  getPricingPlansByCategory,
  localizePricingPlan,
} from "@/lib/pricing";

type PricingPageContentProps = {
  initialBillingCycle?: BillingCycle;
};

export function PricingPageContent({
  initialBillingCycle = "monthly",
}: PricingPageContentProps) {
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(initialBillingCycle);
  const locale = useLocale();
  const t = useTranslations("pricing");
  const starter = localizeMaybe(getPricingPlan("starter"), t);
  const supplierPro = localizeMaybe(getPricingPlan("supplier-pro"), t);
  const sprint = localizeMaybe(getPricingPlan("vsme-passport-sprint"), t);
  const founding = localizeMaybe(getPricingPlan("founding-partner-program"), t);
  const partnerPlans = getPricingPlansByCategory("partner").map((plan) =>
    localizePricingPlan(plan, t),
  );
  const buyerPlans = getPricingPlansByCategory("buyer").map((plan) =>
    localizePricingPlan(plan, t),
  );

  if (!starter || !supplierPro || !sprint || !founding) {
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

          <div className="mt-8 flex w-full justify-center">
            <BillingToggle
              value={billingCycle}
              onChange={setBillingCycle}
              getHref={(cycle) =>
                cycle === "annual" ? `/${locale}/pricing?billing=annual` : `/${locale}/pricing`
              }
            />
          </div>

            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              {t("hero.annualNote")}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t("hero.setupNote")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[starter, supplierPro, sprint].map((plan) => (
              <PricingCard key={plan.id} plan={plan} billingCycle={billingCycle} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection
        eyebrow={t("sections.partnerEyebrow")}
        title={t("sections.partnerTitle")}
        description={t("sections.partnerDescription")}
        plans={[...partnerPlans, ...buyerPlans]}
        billingCycle={billingCycle}
      />

      <FoundingPartnerBanner plan={founding} />
      <PricingComparisonTable />
      <PricingFaq />
      <FinalCta />
    </main>
  );
}

function localizeMaybe(
  plan: ReturnType<typeof getPricingPlan>,
  t: Parameters<typeof localizePricingPlan>[1],
) {
  return plan ? localizePricingPlan(plan, t) : undefined;
}
