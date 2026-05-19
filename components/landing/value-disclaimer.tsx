import { useTranslations } from "next-intl";
import { FileCheck2, ShieldCheck } from "lucide-react";

const icons = [FileCheck2, ShieldCheck] as const;

export function ValueDisclaimer() {
  const t = useTranslations("landing.value");
  const groups = t.raw("groups") as Array<{ title: string; items: string[] }>;

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
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

        <aside className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            {t("disclaimerEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">{t("disclaimerTitle")}</h2>
          <p className="mt-5 text-base leading-7">{t("disclaimerText")}</p>
        </aside>
      </div>
    </section>
  );
}
