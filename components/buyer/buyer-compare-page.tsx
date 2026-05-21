"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Trash2, X } from "lucide-react";
import { BuyerPortalShell } from "@/components/buyer/buyer-portal-shell";
import { BuyerRequestEvidencePanel } from "@/components/buyer/buyer-request-message";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { extractSupplierToken } from "@/lib/buyer-token";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "supplier-passport:buyer-compare:v1";
const MAX_SUPPLIERS = 10;

type CompareItem =
  | {
      index: number;
      state: "ok";
      organizationName: string;
      readinessScore: number;
      certificateStatus: "none" | "available" | "expires_soon" | "expired";
      lastUpdated: string;
      evidenceCount: string;
      sections: Array<{
        title: string;
        metricValue: string;
        actionLabel: string;
      }>;
    }
  | {
      index: number;
      state: "unavailable" | "password_required";
    };

export function BuyerComparePage() {
  const locale = useLocale();
  const t = useTranslations("buyerPortal");
  const [tokens, setTokens] = useState<string[]>([]);
  const [supplierLink, setSupplierLink] = useState("");
  const [items, setItems] = useState<CompareItem[]>([]);
  const [loadedTokensKey, setLoadedTokensKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const tokensKey = useMemo(() => tokens.join("|"), [tokens]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const storedTokens = readStoredTokens();
      const urlToken = extractSupplierToken(new URL(window.location.href).searchParams.get("token") ?? "");
      const nextTokens = urlToken ? addToken(storedTokens, urlToken) : storedTokens;

      setTokens(nextTokens);
      writeStoredTokens(nextTokens);

      if (urlToken) {
        window.history.replaceState(null, "", `/${locale}/buyer/compare`);
        setMessage(t("supplierAddedToComparison"));
      }
    });
  }, [locale, t]);

  useEffect(() => {
    writeStoredTokens(tokens);

    if (!tokens.length) {
      return;
    }

    let isCurrent = true;

    fetch("/api/buyer/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load comparison.");
        }
        return response.json() as Promise<{ items: CompareItem[] }>;
      })
      .then((data) => {
        if (isCurrent) {
          setItems(data.items ?? []);
          setLoadedTokensKey(tokensKey);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setMessage(t("comparisonLoadError"));
          setItems(tokens.map((_, index) => ({ index, state: "unavailable" as const })));
          setLoadedTokensKey(tokensKey);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [tokens, tokensKey, t]);

  const sectionTitles = useMemo(() => {
    const titles = new Set<string>();
    items.forEach((item) => {
      if (item.state === "ok") {
        item.sections.forEach((section) => titles.add(section.title));
      }
    });
    return Array.from(titles);
  }, [items]);

  function handleAddSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = extractSupplierToken(supplierLink);

    if (!supplierLink.trim()) {
      setMessage(t("supplierLinkRequired"));
      return;
    }

    if (!token) {
      setMessage(t("supplierLinkInvalid"));
      return;
    }

    if (tokens.includes(token)) {
      setMessage(t("supplierAlreadyCompared"));
      setSupplierLink("");
      return;
    }

    if (tokens.length >= MAX_SUPPLIERS) {
      setMessage(t("comparisonLimitReached"));
      return;
    }

    setTokens([...tokens, token]);
    setSupplierLink("");
    setMessage(t("supplierAddedToComparison"));
  }

  function handleRemove(index: number) {
    setTokens(tokens.filter((_, tokenIndex) => tokenIndex !== index));
    setMessage(t("supplierRemovedFromComparison"));
  }

  function handleClear() {
    setTokens([]);
    setMessage(t("comparisonCleared"));
  }

  return (
    <BuyerPortalShell locale={locale}>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-slate-200/70 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
                {t("savedInBrowserOnly")}
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
                {t("comparisonTitle")}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {t("comparisonDescription")}
              </p>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-500">
                {t("comparisonLimit")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/buyer/suppliers`}
                className={cn(buttonVariants({ variant: "outline" }), "rounded-xl bg-white")}
              >
                {t("backToSupplierLinks")}
              </Link>
              {tokens.length ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(buttonVariants({ variant: "destructive" }), "rounded-xl")}
                >
                  <Trash2 aria-hidden="true" />
                  {t("clearComparison")}
                </button>
              ) : null}
            </div>
          </div>

          <form className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleAddSupplier}>
            <div className="grid gap-2">
              <label htmlFor="buyer-compare-link" className="text-sm font-semibold text-slate-800">
                {t("addSupplierLink")}
              </label>
              <input
                id="buyer-compare-link"
                name="supplierLink"
                value={supplierLink}
                onChange={(event) => setSupplierLink(event.target.value)}
                placeholder={t("pasteSupplierLinkPlaceholder")}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className={cn(buttonVariants({ size: "lg" }), "h-12 self-end rounded-xl px-5")}
            >
              <Plus aria-hidden="true" />
              {t("addToComparison")}
            </button>
          </form>
          {message ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          ) : null}
        </section>

        {tokens.length ? (
          <ComparisonGrid
            items={items}
            tokens={tokens}
            isLoading={loadedTokensKey !== tokensKey}
            sectionTitles={sectionTitles}
            onRemove={handleRemove}
            t={t}
          />
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm">
            {t("emptyComparison")}
          </section>
        )}
      </main>
    </BuyerPortalShell>
  );
}

function ComparisonGrid({
  items,
  tokens,
  isLoading,
  sectionTitles,
  onRemove,
  t,
}: {
  items: CompareItem[];
  tokens: string[];
  isLoading: boolean;
  sectionTitles: string[];
  onRemove: (index: number) => void;
  t: ReturnType<typeof useTranslations<"buyerPortal">>;
}) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {t("supplierSummary")}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {item.state === "ok" ? item.organizationName : t("unavailableSupplierLink")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.index)}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
                aria-label={t("remove")}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            {item.state === "ok" ? (
              <div className="mt-5 grid gap-3 text-sm">
                <MetricLine label={t("readiness")} value={`${item.readinessScore}%`} />
                <MetricLine label={t("evidenceOnRequest")} value={item.evidenceCount} />
                <MetricLine label={t("certificateSummary")} value={formatCertificateStatus(item.certificateStatus, t)} />
                <MetricLine label={t("lastUpdated")} value={item.lastUpdated} />
                {tokens[item.index] ? (
                  <BuyerRequestEvidencePanel
                    supplierName={item.organizationName}
                    token={tokens[item.index]}
                    compact
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                {item.state === "password_required" ? t("passwordRequiredForComparison") : t("unavailableSupplierLink")}
              </p>
            )}
          </article>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          {t("loadingComparison")}
        </div>
      ) : null}

      {sectionTitles.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {t("sectionComparison")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="min-w-52 px-5 py-3 text-left font-semibold text-slate-700">
                    {t("sectionReadiness")}
                  </th>
                  {items.map((item) => (
                    <th key={item.index} className="min-w-56 px-5 py-3 text-left font-semibold text-slate-700">
                      {item.state === "ok" ? item.organizationName : t("unavailableSupplierLink")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionTitles.map((title) => (
                  <tr key={title}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {translateSectionTitle(title, t)}
                    </td>
                    {items.map((item) => (
                      <td key={`${item.index}-${title}`} className="px-5 py-4 text-slate-600">
                        {item.state === "ok" ? (
                          <SectionStatus item={item} title={title} />
                        ) : (
                          t("unavailable")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-7 text-blue-900">
        {t("privateEvidence")}
      </div>
    </section>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SectionStatus({ item, title }: { item: Extract<CompareItem, { state: "ok" }>; title: string }) {
  const section = item.sections.find((candidate) => candidate.title === title);

  if (!section) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <div className="grid gap-1">
      <span className="font-semibold text-slate-950">{section.metricValue}</span>
      <span className="text-xs text-slate-500">{section.actionLabel}</span>
    </div>
  );
}

function readStoredTokens() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((token): token is string => typeof token === "string")
      .map((token) => extractSupplierToken(token))
      .filter((token): token is string => Boolean(token))
      .slice(0, MAX_SUPPLIERS);
  } catch {
    return [];
  }
}

function writeStoredTokens(tokens: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.slice(0, MAX_SUPPLIERS)));
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }
}

function addToken(tokens: string[], token: string) {
  if (tokens.includes(token)) {
    return tokens;
  }

  return [...tokens, token].slice(0, MAX_SUPPLIERS);
}

function translateSectionTitle(title: string, t: ReturnType<typeof useTranslations<"buyerPortal">>) {
  const map: Record<string, string> = {
    "Company overview": t("companyOverview"),
    "Company basics": t("companyBasics"),
    Employees: t("employees"),
    Energy: t("energy"),
    Fuel: t("fuel"),
    Waste: t("waste"),
    "Environmental policies": t("environmentalPolicies"),
    "Health and safety": t("healthSafety"),
    Certifications: t("certifications"),
    Environment: t("environment"),
    Social: t("social"),
    Governance: t("governance"),
    "Supplier information": t("supplierInformation"),
  };

  return map[title] ?? title;
}

function formatCertificateStatus(
  status: Extract<CompareItem, { state: "ok" }>["certificateStatus"],
  t: ReturnType<typeof useTranslations<"buyerPortal">>,
) {
  if (status === "expired") {
    return t("certificateExpired");
  }

  if (status === "expires_soon") {
    return t("certificateExpiresSoon");
  }

  if (status === "available") {
    return t("certificateEvidenceAvailable");
  }

  return t("noCertificateWarnings");
}
