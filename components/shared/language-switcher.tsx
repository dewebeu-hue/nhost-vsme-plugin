"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeNames: Record<AppLocale, string> = {
  en: "English",
  hr: "Hrvatski",
  de: "Deutsch",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("common.language");

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm",
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === activeLocale;

        return (
          <Link
            key={locale}
            href={localizedPath(pathname, locale)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              active
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
            )}
          >
            {localeNames[locale]}
          </Link>
        );
      })}
    </nav>
  );
}

function localizedPath(pathname: string, locale: AppLocale) {
  const segments = pathname.split("/").filter(Boolean);
  const rest = locales.includes(segments[0] as AppLocale) ? segments.slice(1) : segments;

  return `/${[locale, ...rest].join("/")}`;
}
