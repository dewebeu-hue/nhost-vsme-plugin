import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { PricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type FoundingPartnerBannerProps = {
  plan: PricingPlan;
};

export function FoundingPartnerBanner({ plan }: FoundingPartnerBannerProps) {
  const t = useTranslations("pricing.founding");

  return (
    <section className="px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <article className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)]">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div>
              <Badge className="rounded-full bg-teal-50 text-teal-700">
                <BadgeCheck aria-hidden="true" />
                {plan.badge}
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {plan.name}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {plan.description}
              </p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-teal-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                {t("offer")}
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {plan.oneTimePrice}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-blue-700">
                {t("locked", { price: plan.priceMonthly ?? "" })}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {t("description")}
              </p>
              <Link
                href={plan.ctaHref}
                className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 w-full rounded-xl")}
              >
                {plan.ctaLabel}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
