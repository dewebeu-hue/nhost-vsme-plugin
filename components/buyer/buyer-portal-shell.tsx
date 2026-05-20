"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import type { ReactNode } from "react";

type BuyerPortalShellProps = {
  children: ReactNode;
  locale: string;
};

export function BuyerPortalShell({ children, locale }: BuyerPortalShellProps) {
  const t = useTranslations("buyerPortal");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo />
          <nav className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}`}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              Supplier Passport
            </Link>
            <Link
              href={`/${locale}/buyer`}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {t("title")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {t("plans")}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
