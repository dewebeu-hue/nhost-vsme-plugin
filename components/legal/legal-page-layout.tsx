import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LegalFooter } from "@/components/legal/legal-footer";
import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import type { LegalPageContent } from "@/lib/legal/privacy-policy-content";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  content: LegalPageContent;
  locale: AppLocale;
};

export function LegalPageLayout({ content, locale }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
          <Link href={`/${locale}`} aria-label="Supplier Passport home" className="shrink-0">
            <Logo size="landing" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Link
              href={`/${locale}`}
              className={cn(buttonVariants({ variant: "outline" }), "hidden rounded-xl bg-white md:inline-flex")}
            >
              <ArrowLeft data-icon="inline-start" />
              Supplier Passport
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-teal-400 to-blue-600" />
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {content.hero.eyebrow}
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-[#002B36] sm:text-6xl">
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{content.hero.summary}</p>
            <p className="mt-4 max-w-3xl rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800">
              {content.hero.reviewNote}
            </p>
            <p className="mt-5 text-sm font-semibold text-slate-500">{content.effectiveDate}</p>
            {content.hero.action?.type === "cookieSettings" ? (
              <CookieSettingsButton label={content.hero.action.label} />
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              {content.tocTitle}
            </h2>
            <nav className="mt-4 grid gap-2">
              {content.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-blue-100 bg-blue-50/70 p-5 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              {locale === "hr" ? "Podaci za zamjenu" : "Placeholders to replace"}
            </h2>
            <ul className="mt-4 grid gap-2 text-sm font-medium text-blue-900">
              {content.placeholders.map((placeholder) => (
                <li key={placeholder} className="rounded-xl bg-white/75 px-3 py-2">
                  {placeholder}
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-5">
            {content.sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-4 grid gap-3 text-base leading-8 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 grid gap-2 text-base leading-7 text-slate-600">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-3 size-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.table ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          <tr>
                            {section.table.headers.map((header) => (
                              <th key={header} scope="col" className="px-4 py-3">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white text-slate-600">
                          {section.table.rows.map((row) => (
                            <tr key={row.join("|")}>
                              {row.map((cell) => (
                                <td key={cell} className="px-4 py-4 align-top leading-6">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <LegalFooter />
    </main>
  );
}
