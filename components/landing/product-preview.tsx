import { useTranslations } from "next-intl";
import {
  Building2,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Radio,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/shared/progress-ring";
import {
  buyerRequests,
  documents,
  missingDataSummary,
  readinessScore,
  vsmeModules,
} from "@/lib/mock-data";

export function ProductPreview() {
  const t = useTranslations("landing.preview");
  const scopeT = useTranslations("landing.value");
  const passportSections = t.raw("sections") as string[];
  const moduleLabels = t.raw("moduleLabels") as Record<string, string>;
  const evidenceRows = t.raw("evidenceRows") as string[];
  const scopeItems = scopeT.raw("disclaimerItems") as string[];
  const basicModule = vsmeModules.find((module) => module.id === "module-company");
  const evidenceFileCount = documents.length + 124;
  const missingDataPoints = missingDataSummary.reduce(
    (total, item) => total + item.count,
    17,
  );
  const previewModules = vsmeModules.map((module) => ({
    label: moduleLabels[module.title] ?? module.title,
    completion: module.id === "module-company" ? 100 : module.completion,
  }));

  return (
    <div className="relative mx-auto flex w-full max-w-[660px] flex-col gap-4 overflow-visible lg:mx-0 lg:min-h-[760px]">
      <div className="absolute -inset-x-6 top-4 h-80 rounded-[3rem] bg-blue-500/10 blur-3xl" />
      <div className="absolute right-2 top-28 h-72 w-72 rounded-[38%] bg-teal-300/[0.18] blur-3xl" />

      <section className="landing-preview-card-back supplier-surface relative z-10 overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.12),0_0_48px_rgba(20,184,166,0.10)] backdrop-blur sm:p-6 lg:absolute lg:right-0 lg:top-0 lg:w-[88%]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{t("passportPreview")}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {t("exampleSupplierName")}
            </h2>
          </div>
          <Badge className="rounded-full bg-teal-50 text-teal-700" variant="secondary">
            {t("buyerSafeSummary")}
          </Badge>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <ProgressRing
            value={readinessScore.value}
            label={t("readyForBuyers")}
            helper={t("vsme")}
            size={126}
          />
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner shadow-white/70">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {basicModule ? t("basicModule") : t("module")}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {t("readiness", { score: readinessScore.value })}
                </p>
              </div>
              <CheckCircle2 aria-hidden="true" className="size-8 text-teal-500" />
            </div>
            <div className="grid gap-3">
              {previewModules.map((module) => (
                <div key={module.label} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{module.label}</span>
                    <span className="font-semibold text-slate-950">{module.completion}%</span>
                  </div>
                  <StablePreviewProgress value={module.completion} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <PreviewStat
            label={t("evidenceFiles")}
            value={String(evidenceFileCount)}
            icon={FileText}
          />
          <PreviewStat
            label={t("missingData")}
            value={String(missingDataPoints)}
            icon={Radio}
            tone="text-amber-600"
          />
          <PreviewStat
            label={t("buyerRequests")}
            value={String(buyerRequests.length)}
            icon={Building2}
            tone="text-teal-600"
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>{t("sectionStatus")}</span>
            <span>{t("summaryOnly")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {passportSections.slice(0, 4).map((section) => (
              <span
                key={section}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/5"
              >
                <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-500" />
                {section}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-20 grid gap-4 lg:block">
        <section className="landing-scope-card relative overflow-hidden rounded-[1.75rem] border border-amber-200/80 bg-white/[0.92] p-5 shadow-[0_22px_55px_rgba(15,23,42,0.10)] backdrop-blur lg:absolute lg:left-0 lg:top-[430px] lg:w-[58%]">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                {scopeT("disclaimerEyebrow")}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {scopeT("disclaimerTitle")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {scopeT("disclaimerText")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {scopeItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/55 px-3 py-2 text-sm font-medium text-slate-700"
              >
                {index === scopeItems.length - 1 ? (
                  <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-amber-700" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-teal-600" />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-amber-100 pt-3 text-xs leading-5 text-slate-500">
            {scopeT("disclaimerFooter")}
          </p>
        </section>

        <section className="landing-preview-card-front relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#002B36] p-5 text-white shadow-[0_28px_70px_rgba(0,43,54,0.26),0_0_42px_rgba(20,184,166,0.16)] lg:absolute lg:right-0 lg:top-[465px] lg:w-[49%]">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-teal-300/20 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-teal-100/80">{t("evidenceIndex")}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                  {t("evidenceCount", { count: evidenceFileCount })}
                </h3>
              </div>
              <Badge className="rounded-full bg-white/10 text-teal-50" variant="secondary">
                {t("availableOnRequest")}
              </Badge>
            </div>

            <div className="mt-5 grid gap-2">
              {evidenceRows.map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-teal-50"
                >
                  <span>{row}</span>
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-teal-300" />
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-sm leading-6 text-teal-50/85">
              <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-300" />
              <span>{t("evidenceIndexNote")}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type PreviewStatProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: string;
};

function PreviewStat({ label, value, icon: Icon, tone = "text-blue-600" }: PreviewStatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/[0.92] p-4 shadow-sm shadow-slate-950/5">
      <Icon aria-hidden="true" className={`mb-3 size-5 ${tone}`} />
      <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium leading-4 text-slate-500">{label}</p>
    </div>
  );
}

function StablePreviewProgress({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-valuetext={`${safeValue}%`}
      className="h-2.5 overflow-hidden rounded-full bg-white shadow-inner shadow-slate-200/60"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
