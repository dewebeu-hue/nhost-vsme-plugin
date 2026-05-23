"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Building2, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BuyerPortalShell } from "@/components/buyer/buyer-portal-shell";
import { BuyerRequestEvidencePanel } from "@/components/buyer/buyer-request-message";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StateCard } from "@/components/shared/state-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { extractSupplierToken } from "@/lib/buyer-token";
import { cn } from "@/lib/utils";
import type { publicSharePassport } from "@/lib/mock-data";

type BuyerSupplierSummaryProps = {
  passport: typeof publicSharePassport;
  token?: string;
};

export function BuyerPortalLanding() {
  const locale = useLocale();
  const t = useTranslations("buyerPortal");

  return (
    <BuyerPortalShell locale={locale}>
      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-16">
        <section>
          <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
            <ShieldCheck aria-hidden="true" />
            {t("eyebrow")}
          </Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            {t("description")}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
            {t("privateEvidence")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/buyer/suppliers`}
              className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-5")}
            >
              {t("openSupplierLink")}
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href={`/${locale}/request-demo`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl bg-white px-5")}
            >
              {t("requestDemo")}
            </Link>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <LockKeyhole aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            {t("accessModelTitle")}
          </h2>
          <div className="mt-5 grid gap-3">
            <InfoRow label={t("accessTokenOnly")} />
            <InfoRow label={t("noBuyerLogin")} />
            <InfoRow label={t("supplierControlsSharing")} />
          </div>
        </aside>
      </main>
    </BuyerPortalShell>
  );
}

export function BuyerSuppliersNeutralPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("buyerPortal");
  const [supplierLink, setSupplierLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = extractSupplierToken(supplierLink);

    if (!supplierLink.trim()) {
      setError(t("supplierLinkRequired"));
      return;
    }

    if (!token) {
      setError(t("supplierLinkInvalid"));
      return;
    }

    setError(null);
    router.push(`/${locale}/buyer/suppliers/${encodeURIComponent(token)}`);
  }

  return (
    <BuyerPortalShell locale={locale}>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-12 lg:px-8">
        <section className="w-full rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
            {t("savedSuppliers")}
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {t("supplierListTitle")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {t("supplierListDescription")}
          </p>

          <form className="mt-8 grid gap-3" onSubmit={handleOpenSupplier}>
            <label htmlFor="buyer-supplier-link" className="text-sm font-semibold text-slate-800">
              {t("pasteSupplierLinkLabel")}
            </label>
            <input
              id="buyer-supplier-link"
              name="supplierLink"
              value={supplierLink}
              onChange={(event) => {
                setSupplierLink(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder={t("pasteSupplierLinkPlaceholder")}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              aria-describedby="buyer-supplier-link-help buyer-supplier-link-error"
              aria-invalid={Boolean(error)}
            />
            <p id="buyer-supplier-link-help" className="text-xs leading-5 text-slate-500">
              {t("supplierLinkHelp")}
            </p>
            {error ? (
              <p id="buyer-supplier-link-error" className="text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className={cn(buttonVariants({ size: "lg" }), "mt-2 h-12 rounded-xl px-5")}
            >
              {t("openSharedSupplier")}
              <ArrowRight data-icon="inline-end" />
            </button>
            <Link
              href={`/${locale}/buyer/compare`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl bg-white px-5")}
            >
              {t("compareSuppliers")}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </form>
        </section>
      </main>
    </BuyerPortalShell>
  );
}

export function BuyerSupplierUnavailable() {
  const locale = useLocale();
  const t = useTranslations("buyerPortal");

  return (
    <BuyerPortalShell locale={locale}>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-stretch justify-center gap-4 px-5 py-12 lg:px-8">
        <StateCard title={t("unavailableTitle")} description={t("unavailableText")} tone="warning" />
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/buyer`}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl bg-white")}
          >
            {t("backToBuyerPortal")}
          </Link>
          <Link href={`/${locale}/buyer/suppliers`} className={cn(buttonVariants(), "rounded-xl")}>
            {t("backToSupplierLinks")}
          </Link>
        </div>
      </main>
    </BuyerPortalShell>
  );
}

export function BuyerSupplierSummary({ passport, token }: BuyerSupplierSummaryProps) {
  const locale = useLocale();
  const t = useTranslations("buyerPortal");
  const evidenceSection = passport.sections.find((section) => section.title === "Evidence summary");
  const readinessSections = passport.sections.filter((section) => section.title !== "Evidence summary");

  return (
    <BuyerPortalShell locale={locale}>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap gap-3" aria-label={t("sharedSupplierPassport")}>
          <Link
            href={`/${locale}/buyer`}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl bg-white")}
          >
            {t("backToBuyerPortal")}
          </Link>
          <Link
            href={`/${locale}/buyer/suppliers`}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl bg-white")}
          >
            {t("backToSupplierLinks")}
          </Link>
          {token ? (
            <Link
              href={`/${locale}/buyer/compare?token=${encodeURIComponent(token)}`}
              className={cn(buttonVariants(), "rounded-xl")}
            >
              {t("addToComparison")}
            </Link>
          ) : null}
        </nav>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white text-xl font-semibold tracking-[0.16em] text-slate-900 shadow-lg shadow-slate-200">
                {passport.company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={passport.company.logoUrl}
                    alt={passport.company.logoAltText || passport.company.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  getCompanyInitials(passport.company.name)
                )}
              </div>
              <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
                  {t("sharedSupplierPassport")}
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                  {t("buyerSafeSummary")}
                </Badge>
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {passport.company.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {t("summaryIntro", { companyName: passport.company.name })}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {t("supportingEvidence")}
              </p>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <ProgressRing value={passport.readinessScore} label={t("readiness")} size={148} />
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                {t("privateEvidence")}
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <MetricCard icon={Building2} label={t("supplierSummary")} value={`${passport.readinessScore}%`} />
          <MetricCard
            icon={FileText}
            label={t("evidenceOnRequest")}
            value={evidenceSection?.metricValue ?? "0"}
          />
          <MetricCard
            icon={ShieldCheck}
            label={t("certificateSummary")}
            value={formatCertificateStatus(passport.certificateStatus, t)}
          />
        </section>

        {token ? (
          <BuyerRequestEvidencePanel supplierName={passport.company.name} token={token} />
        ) : null}

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {t("sectionReadiness")}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {readinessSections.map((section) => (
              <article key={section.title} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 break-words">
                  {translateSectionTitle(section.title, t)}
                </h3>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 break-words">
                    {t("completion")}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    {section.metricValue}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {t("buyerNextStepTitle")}
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            {t("buyerNextStepText")}
          </p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-500">
            {t("notCertificationDisclaimer")}
          </p>
        </section>
      </main>
    </BuyerPortalShell>
  );
}

function InfoRow({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" />
      {label}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </article>
  );
}

function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP";
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
  status: typeof publicSharePassport.certificateStatus,
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
