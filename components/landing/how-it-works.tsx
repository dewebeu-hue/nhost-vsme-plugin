import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as Array<{ title: string; description: string }>;

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
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

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="relative rounded-2xl bg-slate-50 p-5">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-700 shadow-sm">
                  {index + 1}
                </span>
                {index < steps.length - 1 ? (
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
