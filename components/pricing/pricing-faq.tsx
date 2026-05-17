import { useTranslations } from "next-intl";

export function PricingFaq() {
  const t = useTranslations("pricing.faq");
  const items = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section className="px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
            >
              <h3 className="text-base font-semibold tracking-tight text-slate-950">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
