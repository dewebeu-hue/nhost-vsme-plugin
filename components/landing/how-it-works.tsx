import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as Array<{ title: string; description: string }>;

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="supplier-surface mx-auto w-full max-w-7xl rounded-[2rem] border-0 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600">
            {t("description")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 80}>
              <article className="premium-surface-interactive relative h-full rounded-2xl border border-slate-200 bg-white/75 p-5">
                <div className="mb-7 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  {index < steps.length - 1 ? (
                    <ArrowRight aria-hidden="true" className="hidden size-5 text-slate-300 lg:block" />
                  ) : null}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
