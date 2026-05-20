import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getPricingDisplay, type PricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  plan: PricingPlan;
  compact?: boolean;
};

export function PricingCard({
  plan,
  compact = false,
}: PricingCardProps) {
  const t = useTranslations("pricing.card");

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]",
        plan.highlighted
          ? "border-blue-200 ring-4 ring-blue-100"
          : "border-slate-200",
      )}
    >
      {plan.badge ? (
        <Badge className="absolute right-5 top-5 rounded-full bg-teal-50 text-teal-700">
          {plan.badge}
        </Badge>
      ) : null}

      <div className={cn(plan.badge && "pr-28")}>
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{plan.name}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{plan.audience}</p>
      </div>

      <PriceLine plan={plan} />

      <p className="mt-5 text-sm leading-6 text-slate-600">{plan.description}</p>

      <ul className={cn("mt-6 flex flex-1 flex-col gap-3", compact && "gap-2.5")}>
        {plan.features.slice(0, compact ? 7 : undefined).map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600">
            <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-emerald-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {plan.limitations?.length && !compact ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{t("notIncluded")}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {plan.limitations.map((limitation) => (
              <li key={limitation} className="flex gap-2 text-sm leading-6 text-slate-500">
                <MinusCircle aria-hidden="true" className="mt-1 shrink-0 text-slate-400" />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {plan.setup ? (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
          {plan.setup}
        </p>
      ) : null}

      <Link
        href={plan.ctaHref}
        className={cn(
          buttonVariants({
            variant: plan.highlighted ? "default" : "outline",
            size: "lg",
          }),
          "mt-6 h-11 rounded-xl",
          plan.highlighted && "bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700",
        )}
      >
        {plan.ctaLabel}
        <ArrowRight data-icon="inline-end" />
      </Link>
    </article>
  );
}

function PriceLine({
  plan,
}: {
  plan: PricingPlan;
}) {
  const t = useTranslations("pricing.card");
  const display = getPricingDisplay(plan);
  const prefix = display.prefix === "from" ? t("from") : display.prefix;

  return (
    <div className="mt-7">
      {prefix ? (
        <span className="mr-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          {prefix}
        </span>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        <span className="text-5xl font-semibold tracking-tight text-slate-950">
          {display.price}
        </span>
        {display.cadence ? (
          <span className="pb-2 text-sm font-medium text-slate-500">
            /{t(`cadence.${display.cadence}`)}
          </span>
        ) : null}
      </div>
      {display.subtext ? (
        <p className="mt-2 text-sm font-medium text-slate-500">
          {display.subtext}
        </p>
      ) : null}
    </div>
  );
}
