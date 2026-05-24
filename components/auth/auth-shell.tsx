import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LegalFooter } from "@/components/legal/legal-footer";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  const locale = useLocale();
  const t = useTranslations("auth.shell");
  const benefits = t.raw("benefits") as string[];
  const icons = [ShieldCheck, LockKeyhole, BadgeCheck] as const;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="hidden flex-col justify-between border-r border-slate-200 bg-white px-10 py-8 lg:flex">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/${locale}`} className="w-fit" aria-label="Supplier Passport home">
              <Logo size="lg" />
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950">
              {t("headline")}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-3">
            {benefits.map((label, index) => {
              const Icon = icons[index] ?? BadgeCheck;

              return (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <Link href={`/${locale}`} className="w-fit" aria-label="Supplier Passport home">
                  <Logo size="md" />
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
            <div className="supplier-surface rounded-3xl border-0 p-6 shadow-xl shadow-slate-200/70 sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                  {eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
      <LegalFooter />
    </main>
  );
}
