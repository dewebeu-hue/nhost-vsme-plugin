import { defineRouting } from "next-intl/routing";

export const locales = ["en", "hr", "de"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
