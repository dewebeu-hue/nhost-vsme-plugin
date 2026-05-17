import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { PricingCard } from "@/components/pricing/pricing-card";
import { buttonVariants } from "@/components/ui/button";
import { getLandingPricingPlans, localizePricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingPreview() {
  const locale = useLocale();
  const t = useTranslations("landing.pricingPreview");
  const pricing = useTranslations("pricing");
  const common = useTranslations("common.cta");
  const pricingPlans = getLandingPricingPlans().map((plan) => localizePricingPlan(plan, pricing));

  return (
    <section id="pricing" className="px-6 py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} compact />
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 md:flex-row">
          <p className="text-sm font-medium text-slate-600">
            {t("note")}
          </p>
          <Link
            href={`/${locale}/pricing`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl")}
          >
            {common("viewFullPricing")}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </section>
  );
}
