import type { ReactNode } from "react";
import { PricingCard } from "@/components/pricing/pricing-card";
import type { PricingPlan } from "@/lib/pricing";

type PricingSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  plans: PricingPlan[];
  columns?: "two" | "three";
  children?: ReactNode;
};

export function PricingSection({
  eyebrow,
  title,
  description,
  plans,
  columns = "three",
  children,
}: PricingSectionProps) {
  return (
    <section className="px-6 py-14 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </div>

        <div
          className={
            columns === "two"
              ? "grid gap-5 lg:grid-cols-2"
              : "grid gap-5 lg:grid-cols-3"
          }
        >
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}
