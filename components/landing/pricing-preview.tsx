import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pricingPlans } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function PricingPreview() {
  return (
    <section id="pricing" className="px-6 py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Start lean, then scale across buyers and entities.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => {
            const isPopular = plan.name === "Supplier";
            const badge = "badge" in plan ? plan.badge : undefined;

            return (
              <article
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]",
                  isPopular
                    ? "border-blue-200 ring-4 ring-blue-100"
                    : "border-slate-200",
                )}
              >
                {badge ? (
                  <Badge className="absolute right-6 top-6 rounded-full bg-teal-50 text-teal-700">
                    {badge}
                  </Badge>
                ) : null}
                <div className="pr-28">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                    {plan.name}
                  </h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>
                </div>
                <div className="mt-8 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-slate-950">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-sm font-medium text-slate-500">
                    /{plan.cadence}
                  </span>
                </div>
                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-slate-600">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-emerald-500"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Partner" ? "/contact" : "/dashboard"}
                  className={cn(
                    buttonVariants({
                      variant: isPopular ? "default" : "outline",
                      size: "lg",
                    }),
                    "mt-8 h-11",
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
