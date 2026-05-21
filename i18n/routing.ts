import { defineRouting } from "next-intl/routing";

export const locales = ["en", "hr", "de"] as const;
export type AppLocale = (typeof locales)[number];

// German remains wired for future translation QA, but it is temporarily hidden
// from production language switchers until the DE copy is complete.
export const productionLocales = ["en", "hr"] as const satisfies readonly AppLocale[];

export const defaultLocale: AppLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
