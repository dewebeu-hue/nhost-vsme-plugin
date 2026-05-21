"use client";

import {
  CalendarDays,
  ClipboardCopy,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StateCard } from "@/components/shared/state-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PublicPdfDownloadButton } from "@/components/passport/public-pdf-download-button";
import type { publicSharePassport } from "@/lib/mock-data";
import { getReadinessVisualState } from "@/lib/readiness-visual-state";
import { cn } from "@/lib/utils";

type PublicSharePageProps = {
  locale: string;
  passport: typeof publicSharePassport;
  token: string;
};

export function PublicShareAccessState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = useTranslations("share");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <p className="hidden text-sm font-medium text-slate-500 sm:block">
              {t("poweredBy")}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-12 lg:px-8">
        <StateCard title={title} description={description} tone="warning" className="w-full" />
      </main>
    </div>
  );
}

export function PublicSharePage({ locale, passport, token }: PublicSharePageProps) {
  const t = useTranslations("share");
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const evidenceSection = passport.sections.find((section) => section.title === "Evidence summary");
  const readinessSections = passport.sections.filter((section) => section.title !== "Evidence summary");
  const readinessLevel = getReadinessLevel(passport.readinessScore);
  const certificateStatus = getCertificateStatusLabel(passport.certificateStatus, t);
  const readinessVisualState = getReadinessVisualState(passport.readinessScore);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Logo />
          <div className="flex flex-wrap items-center gap-2">
            {passport.statusChips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
              >
                {translateStatusChip(chip, t)}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <p className="hidden text-sm font-medium text-slate-500 sm:block">
              {t("poweredBy")}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-xl font-semibold tracking-[0.16em] text-white shadow-lg shadow-slate-300">
                  {getCompanyInitials(passport.company.name)}
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
                      {t("sharedSupplierPassport")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                    >
                      {t("vsmeAligned")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-teal-200 bg-teal-50 px-3 py-1 text-teal-700"
                    >
                      <ShieldCheck aria-hidden="true" />
                      {t("supplierProfile")}
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    {passport.company.name}
                  </h1>
                </div>
              </div>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {t("sharedIntro", { companyName: passport.company.name })}
              </p>
              <p className="max-w-3xl text-sm leading-6 text-slate-500">
                {t("publicSummaryExplanation")}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CalendarDays aria-hidden="true" />
                  {t("lastUpdated")}: {passport.lastUpdated}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setCopyState("idle");
                    setIsRequestOpen(true);
                  }}
                  className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700"
                >
                  <Mail data-icon="inline-start" />
                  {t("requestAdditionalInformation")}
                </Button>
                <PublicPdfDownloadButton locale={locale} token={token} />
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {t("aboutThisPassport")}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {passport.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-500">
                      {translateShareDetail(detail.label, t)}
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-950">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <LockKeyhole aria-hidden="true" className="mt-0.5 text-blue-700" />
                <p className="text-sm leading-6 text-slate-600">
                  {t("permissioned")}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            className={cn(
              "rounded-3xl border bg-white p-6 shadow-sm shadow-slate-200/70",
              readinessVisualState.cardClassName,
              readinessVisualState.isComplete && "shadow-[0_0_28px_rgba(16,185,129,0.24)]",
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <ProgressRing
                value={passport.readinessScore}
                label={t("readinessCircleLabel")}
                size={156}
                trackClassName={readinessVisualState.trackClassName}
                progressClassName={readinessVisualState.progressClassName}
                valueClassName={readinessVisualState.valueClassName}
                labelClassName={readinessVisualState.labelClassName}
                className={cn(
                  "rounded-full bg-white",
                  readinessVisualState.isComplete
                    ? "shadow-[0_0_22px_rgba(16,185,129,0.3)]"
                    : "shadow-sm",
                )}
              />
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <InfoBlock
                  label={t("readinessStatus")}
                  value={translateReadinessLevel(readinessLevel, t)}
                />
                <InfoBlock
                  label={t("industries")}
                  value={passport.company.industries.length ? passport.company.industries.join(", ") : t("notProvided")}
                />
                <InfoBlock label={t("countriesServed")} value={passport.company.countriesServed} />
                <InfoBlock label={t("employeeCount")} value={passport.company.employeeCount} />
                <InfoBlock label={t("headquarters")} value={passport.company.headquarters} />
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-3 text-sm font-semibold text-slate-950">{t("certifications")}</p>
              <div className="flex flex-wrap gap-2">
                {passport.company.certifications.length ? (
                  passport.company.certifications.map((certification) => (
                    <Badge
                      key={certification}
                      variant="outline"
                      className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
                    >
                      {certification}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm font-medium text-slate-500">{t("notProvided")}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {t("readinessSummary")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t("readinessScoreExplanation")}
            </p>
            <div
              className={cn(
                "mt-5 rounded-2xl p-4 text-sm font-semibold",
                readinessVisualState.footerClassName,
              )}
            >
              {translateReadinessLevel(readinessLevel, t)}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {t("sectionReadiness")}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                {t("sectionReadinessDescription")}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {readinessSections.map((section) => (
              <article
                key={section.title}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70"
              >
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 break-words">
                  {translateShareSectionTitle(section.title, t)}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 break-words">
                  {translateShareSectionDescription(section.title, section.description, t)}
                </p>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 break-words">
                    {translateShareMetricLabel(section.metricLabel, t)}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    {section.metricValue}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="mt-4 inline-flex max-w-full whitespace-normal rounded-2xl border-blue-100 bg-blue-50 px-3 py-1.5 text-left leading-5 text-blue-700 break-words"
                >
                  {translateSectionStatus(section, t)}
                </Badge>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {t("evidenceSummaryTitle")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {evidenceSection ? t("evidenceSummaryText") : t("noEvidenceSummaryAvailableYet")}
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {t("evidenceFiles")}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {evidenceSection?.metricValue ?? "0"}
              </p>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {t("privateFilesNotDownloadable")}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {t("certificateStatus")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {t("certificateStatusText")}
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {certificateStatus}
            </div>
          </article>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 lg:px-8">
          <p className="text-base font-semibold text-slate-950">{t("secureTagline")}</p>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            {t("notCertificationDisclaimer")}
          </p>
        </div>
      </footer>
      <RequestAdditionalInformationDialog
        open={isRequestOpen}
        copyState={copyState}
        locale={locale}
        token={token}
        supplierName={passport.company.name}
        onCopyStateChange={setCopyState}
        onOpenChange={setIsRequestOpen}
      />
    </div>
  );
}

function RequestAdditionalInformationDialog({
  open,
  copyState,
  locale,
  token,
  supplierName,
  onCopyStateChange,
  onOpenChange,
}: {
  open: boolean;
  copyState: "idle" | "copied" | "error";
  locale: string;
  token: string;
  supplierName: string;
  onCopyStateChange: (state: "idle" | "copied" | "error") => void;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("share");

  async function handleCopy() {
    const publicLink = `${window.location.origin}/${locale}/passport/${encodeURIComponent(token)}`;
    const message = t("requestAdditionalInformationMessage", {
      supplierName: supplierName || t("supplierProfile"),
      link: publicLink,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      onCopyStateChange("copied");
    } catch {
      onCopyStateChange("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
            {t("requestAdditionalInformationTitle")}
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            {t("requestAdditionalInformationDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 px-6 py-5 text-sm leading-6 text-slate-600">
          <p>{t("requestAdditionalInformationEmailDisabled")}</p>
          {copyState === "copied" ? (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 font-medium text-emerald-700">
              {t("requestAdditionalInformationCopied")}
            </p>
          ) : null}
          {copyState === "error" ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 font-medium text-red-700">
              {t("requestAdditionalInformationCopyError")}
            </p>
          ) : null}
        </div>
        <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button type="button" variant="outline" className="bg-white" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleCopy}>
            <ClipboardCopy data-icon="inline-start" />
            {t("copyRequestMessage")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function translateStatusChip(chip: string, t: ReturnType<typeof useTranslations<"share">>) {
  const map: Record<string, string> = {
    "Read-only": t("readOnly"),
    "Password protected": t("passwordProtected"),
    "Expires in 14 days": `${t("expires")}: 14 days`,
  };

  return map[chip] ?? chip;
}

function getReadinessLevel(score: number) {
  if (score >= 90) {
    return "strong" as const;
  }

  if (score >= 70) {
    return "buyerReadyDraft" as const;
  }

  if (score >= 40) {
    return "inProgress" as const;
  }

  return "needsAttention" as const;
}

function translateReadinessLevel(
  level: ReturnType<typeof getReadinessLevel>,
  t: ReturnType<typeof useTranslations<"share">>,
) {
  const map = {
    needsAttention: t("readinessNeedsAttention"),
    inProgress: t("readinessInProgress"),
    buyerReadyDraft: t("readinessBuyerReadyDraft"),
    strong: t("readinessStrong"),
  };

  return map[level];
}

function getCertificateStatusLabel(
  status: typeof publicSharePassport.certificateStatus,
  t: ReturnType<typeof useTranslations<"share">>,
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

  return t("noExpiringCertificates");
}

function translateShareDetail(label: string, t: ReturnType<typeof useTranslations<"share">>) {
  const map: Record<string, string> = {
    "Shared on": t("sharedOn"),
    "Shared with": t("sharedWith"),
    Access: t("access"),
    Security: t("security"),
    Expires: t("expires"),
  };

  return map[label] ?? label;
}

function translateShareSectionTitle(title: string, t: ReturnType<typeof useTranslations<"share">>) {
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
    "Evidence summary": t("evidenceSummary"),
  };

  return map[title] ?? title;
}

function translateShareSectionDescription(
  title: string,
  fallback: string,
  t: ReturnType<typeof useTranslations<"share">>,
) {
  const map: Record<string, string> = {
    "Company overview": t("companyOverviewDescription"),
    "Company basics": t("companyBasicsDescription"),
    Employees: t("employeesDescription"),
    Energy: t("energyDescription"),
    Fuel: t("fuelDescription"),
    Waste: t("wasteDescription"),
    "Environmental policies": t("environmentalPoliciesDescription"),
    "Health and safety": t("healthSafetyDescription"),
    Certifications: t("certificationsDescription"),
    Environment: t("environmentDescription"),
    Social: t("socialDescription"),
    Governance: t("governanceDescription"),
    "Supplier information": t("supplierInformationDescription"),
    "Evidence summary": t("evidenceSummaryDescription"),
  };

  return map[title] ?? fallback;
}

function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "SP";
}

function translateShareMetricLabel(label: string, t: ReturnType<typeof useTranslations<"share">>) {
  const map: Record<string, string> = {
    Completion: t("completion"),
    "Evidence files": t("evidenceFiles"),
  };

  return map[label] ?? label;
}

function translateSectionStatus(
  section: typeof publicSharePassport.sections[number],
  t: ReturnType<typeof useTranslations<"share">>,
) {
  const completion = Number.parseInt(section.metricValue, 10);

  if (!Number.isFinite(completion) || completion <= 0) {
    return t("sectionNotStarted");
  }

  if (completion >= 100) {
    return t("sectionCompleted");
  }

  if (section.actionLabel === "Evidence available") {
    return t("sectionEvidenceAvailable");
  }

  if (section.actionLabel === "Evidence recommended") {
    return t("sectionEvidenceRecommended");
  }

  return t("sectionInProgress");
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
