import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type SetupCardProps = {
  plan: PricingPlan;
};

export function SetupCard({ plan }: SetupCardProps) {
  return (
    <section className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <article className="grid gap-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[360px_minmax(0,1fr)_220px] lg:items-center lg:p-8">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Sparkles aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{plan.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-4xl font-semibold tracking-tight text-slate-950">
              {plan.oneTimePrice}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">one-time</p>
            <Link
              href={plan.ctaHref}
              className={cn(buttonVariants({ size: "lg" }), "mt-5 h-11 w-full rounded-xl")}
            >
              {plan.ctaLabel}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
