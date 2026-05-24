"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { openCookieSettings } from "@/components/legal/cookie-consent-manager";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className }: LegalFooterProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("legalFooter");

  return (
    <footer className={cn("border-t border-slate-200 bg-white/95", className)}>
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 text-sm text-slate-500 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
        <div>
          <p className="font-medium leading-6">{t("copyright")}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{t("familyLabel")}</p>
        </div>
        <nav aria-label={t("label")} className="flex flex-wrap items-center gap-2">
          <LegalFooterLink href={`/${locale}/privacy`}>{t("privacy")}</LegalFooterLink>
          <LegalFooterLink href={`/${locale}/terms`}>{t("terms")}</LegalFooterLink>
          <LegalFooterLink href={`/${locale}/cookies`}>{t("cookiePolicy")}</LegalFooterLink>
          <LegalFooterLink href={`/${locale}/dpa`}>{t("dpa")}</LegalFooterLink>
          <LegalFooterLink href={`/${locale}/security`}>{t("security")}</LegalFooterLink>
          <LegalFooterLink href={`/${locale}/subprocessors`}>{t("subprocessors")}</LegalFooterLink>
          <button
            type="button"
            onClick={openCookieSettings}
            className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {t("cookieSettings")}
          </button>
        </nav>
      </div>
    </footer>
  );
}

function LegalFooterLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
