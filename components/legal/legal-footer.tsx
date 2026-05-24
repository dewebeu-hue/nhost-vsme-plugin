"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { openCookieSettings } from "@/components/legal/cookie-consent-manager";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className }: LegalFooterProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("legalFooter");

  return (
    <footer className={cn("border-t border-slate-200 bg-white", className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>{t("copyright")}</p>
        <nav aria-label={t("label")} className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/${locale}/privacy`}
            className="font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {t("privacy")}
          </Link>
          <button
            type="button"
            onClick={openCookieSettings}
            className="font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {t("cookieSettings")}
          </button>
        </nav>
      </div>
    </footer>
  );
}
