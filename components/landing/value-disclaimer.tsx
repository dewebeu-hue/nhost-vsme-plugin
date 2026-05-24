import { useTranslations } from "next-intl";
import { CheckCircle2, FileCheck2, Info, ShieldCheck } from "lucide-react";

const icons = [FileCheck2, ShieldCheck] as const;

export function ValueDisclaimer() {
  const t = useTranslations("landing.value");
  const groups = t.raw("groups") as Array<{ title: string; items: string[] }>;
  const disclaimerItems = t.raw("disclaimerItems") as string[];

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-6 lg:grid-cols-[1fr_0.82fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {t("title")}
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {groups.map((group, index) => {
              const Icon = icons[index] ?? FileCheck2;

              return (
                <article key={group.title} className="rounded-2xl bg-slate-50 p-5">
                  <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                    {group.title}
                  </h3>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-white p-6 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-7 lg:self-center">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-teal-400 to-blue-500" />
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
              <Info aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                {t("disclaimerEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {t("disclaimerTitle")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                {t("disclaimerText")}
              </p>
            </div>
          </div>

          <ul className="mt-6 grid gap-3">
            {disclaimerItems.map((item, index) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
                <CheckCircle2
                  aria-hidden="true"
                  className={index === disclaimerItems.length - 1 ? "mt-0.5 size-5 shrink-0 text-amber-600" : "mt-0.5 size-5 shrink-0 text-teal-600"}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
            {t("disclaimerFooter")}
          </p>
        </aside>
      </div>
    </section>
  );
}
