import { BarChart3, ClipboardCheck, Database, Link2 } from "lucide-react";
import { featureDescriptions } from "@/lib/copy";

const icons = [ClipboardCheck, Database, BarChart3, Link2] as const;

export function FeatureCards() {
  return (
    <section id="solutions" className="px-6 py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Product foundation
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            One workspace for VSME answers, evidence, gaps, and buyer sharing.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureDescriptions.map((feature, index) => {
            const Icon = icons[index];

            return (
              <article
                key={feature.title}
                className="supplier-surface rounded-2xl border-0 p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="size-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
