import { ArrowRight } from "lucide-react";
import { howItWorksSteps } from "@/lib/copy";

export function HowItWorks() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
              How it works
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              From scattered answers to a buyer-ready passport.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600">
            A focused workflow for supplier teams that need clarity, speed, and evidence discipline.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <article key={step.title} className="relative rounded-2xl bg-slate-50 p-5">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-700 shadow-sm">
                  {index + 1}
                </span>
                {index < howItWorksSteps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="hidden size-5 text-slate-300 lg:block" />
                ) : null}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
