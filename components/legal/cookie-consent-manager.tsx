"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cookieConsentStorageKey,
  createCookieConsentPreferences,
  parseCookieConsentPreferences,
  type CookieConsentCategory,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

type OptionalCategory = Exclude<CookieConsentCategory, "necessary">;

const optionalCategories: OptionalCategory[] = ["preferences", "analytics", "marketing"];

export function CookieConsentManager() {
  const t = useTranslations("cookieConsent");
  const locale = useLocale();
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<OptionalCategory, boolean>>({
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = parseCookieConsentPreferences(window.localStorage.getItem(cookieConsentStorageKey));
      setConsent(stored);
      setDraft({
        analytics: stored?.analytics ?? false,
        marketing: stored?.marketing ?? false,
        preferences: stored?.preferences ?? false,
      });
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    function openSettings() {
      setIsSettingsOpen(true);
    }

    window.addEventListener("supplier-passport:open-cookie-settings", openSettings);

    return () => {
      window.removeEventListener("supplier-passport:open-cookie-settings", openSettings);
    };
  }, []);

  const shouldShowBanner = hasLoaded && !consent && !isSettingsOpen;
  const categories = useMemo(
    () => [
      {
        description: t("categories.necessary.description"),
        enabled: true,
        id: "necessary" as const,
        title: t("categories.necessary.title"),
      },
      ...optionalCategories.map((category) => ({
        description: t(`categories.${category}.description`),
        enabled: draft[category],
        id: category,
        title: t(`categories.${category}.title`),
      })),
    ],
    [draft, t],
  );

  function persist(next: CookieConsentPreferences) {
    window.localStorage.setItem(cookieConsentStorageKey, JSON.stringify(next));
    setConsent(next);
    setDraft({
      analytics: next.analytics,
      marketing: next.marketing,
      preferences: next.preferences,
    });
    setIsSettingsOpen(false);
  }

  function acceptAll() {
    persist(createCookieConsentPreferences({ analytics: true, marketing: true, preferences: true }));
  }

  function rejectOptional() {
    persist(createCookieConsentPreferences());
  }

  function saveSettings() {
    persist(createCookieConsentPreferences(draft));
  }

  function openSettings() {
    setDraft({
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
      preferences: consent?.preferences ?? false,
    });
    setIsSettingsOpen(true);
  }

  if (!hasLoaded) {
    return null;
  }

  return (
    <>
      {shouldShowBanner ? (
        <section
          aria-label={t("bannerLabel")}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full rounded-t-2xl border border-blue-100 bg-white p-4 shadow-[0_-18px_50px_rgba(15,23,42,0.16)] sm:inset-x-4 sm:bottom-5 sm:max-w-5xl sm:rounded-2xl sm:p-5 sm:shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#002B36]">
                  Supplier Passport
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-950">{t("title")}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("bannerText")}</p>
                <LegalInfoLinks locale={locale} t={t} />
              </div>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap lg:shrink-0 lg:justify-end">
              <Button type="button" onClick={acceptAll} className="rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                {t("acceptAll")}
              </Button>
              <Button type="button" variant="outline" onClick={rejectOptional} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700">
                {t("rejectOptional")}
              </Button>
              <Button type="button" variant="ghost" onClick={openSettings} className="rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                {t("settings")}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {isSettingsOpen ? (
        <CookieSettingsDialog
          categories={categories}
          draft={draft}
          locale={locale}
          onAcceptAll={acceptAll}
          onClose={() => setIsSettingsOpen(false)}
          onRejectOptional={rejectOptional}
          onSave={saveSettings}
          onToggle={(category, checked) => setDraft((current) => ({ ...current, [category]: checked }))}
          t={t}
        />
      ) : null}
    </>
  );
}

function CookieSettingsDialog({
  categories,
  draft,
  locale,
  onAcceptAll,
  onClose,
  onRejectOptional,
  onSave,
  onToggle,
  t,
}: {
  categories: Array<{
    description: string;
    enabled: boolean;
    id: CookieConsentCategory;
    title: string;
  }>;
  draft: Record<OptionalCategory, boolean>;
  locale: string;
  onAcceptAll: () => void;
  onClose: () => void;
  onRejectOptional: () => void;
  onSave: () => void;
  onToggle: (category: OptionalCategory, checked: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-3">
      <section
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        role="dialog"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-blue-100 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#002B36]">
                Supplier Passport
              </p>
              <h2 id="cookie-settings-title" className="mt-1 text-xl font-semibold text-slate-950">
                {t("modalTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("modalDescription")}</p>
              <LegalInfoLinks locale={locale} t={t} />
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} className="w-fit rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700">
            {t("close")}
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {categories.map((category) => {
            const isNecessary = category.id === "necessary";

            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4",
                  isNecessary ? "border-blue-100 bg-blue-50/70" : "border-slate-200 bg-white hover:border-teal-100",
                )}
              >
                <span>
                  <span className="text-sm font-semibold text-slate-950">{category.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{category.description}</span>
                </span>
                <input
                  aria-label={category.title}
                  checked={isNecessary ? true : draft[category.id as OptionalCategory]}
                  className="mt-1 size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isNecessary}
                  onChange={(event) => {
                    if (!isNecessary) {
                      onToggle(category.id as OptionalCategory, event.target.checked);
                    }
                  }}
                  type="checkbox"
                />
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onRejectOptional} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700">
            {t("rejectOptional")}
          </Button>
          <Button type="button" variant="outline" onClick={onAcceptAll} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700">
            {t("acceptAll")}
          </Button>
          <Button type="button" onClick={onSave} className="rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            {t("saveSettings")}
          </Button>
        </div>
      </section>
    </div>
  );
}

function LegalInfoLinks({ locale, t }: { locale: string; t: ReturnType<typeof useTranslations> }) {
  return (
    <p className="mt-2 text-sm leading-6 text-slate-600">
      {t("legalInfoPrefix")}{" "}
      <Link
        href={`/${locale}/privacy`}
        className="font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {t("privacyLink")}
      </Link>{" "}
      {t("legalInfoConnector")}{" "}
      <Link
        href={`/${locale}/cookies`}
        className="font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {t("cookiePolicyLink")}
      </Link>
      .
    </p>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("supplier-passport:open-cookie-settings"));
}
