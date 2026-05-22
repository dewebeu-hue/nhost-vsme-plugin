import { useTranslations } from "next-intl";
import { Building2, CheckCircle2, FileText, LockKeyhole, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const passportSections = t.raw("sections") as string[];
  const moduleLabels = t.raw("moduleLabels") as Record<string, string>;
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
    <div className="relative mx-auto flex w-full max-w-[620px] flex-col gap-6 overflow-visible lg:mx-0 lg:block lg:min-h-[760px] xl:min-h-[790px]">
      <div className="absolute inset-x-6 top-2 h-72 rounded-[2rem] bg-blue-600/10 blur-3xl" />

      <section className="landing-preview-card-back supplier-surface relative z-10 w-full rounded-[2rem] border-0 p-5 shadow-[0_24px_64px_rgba(15,23,42,0.10)] sm:p-6 lg:w-[88%] lg:max-w-[620px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{t("supplierReadiness")}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t("dashboardPreview")}
            </h2>
          </div>
          <Badge className="rounded-full bg-emerald-50 text-emerald-700" variant="secondary">
            {t("liveProfile")}
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <ProgressRing
            value={readinessScore.value}
            label={t("ready")}
            helper={t("vsme")}
            size={132}
          />
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

        <div className="mt-6 grid grid-cols-3 gap-3">
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

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {t("lastUpdated")}
        </div>
      </section>

      <section className="landing-preview-card-front supplier-surface relative z-20 w-full rounded-[2rem] border-0 p-5 shadow-[-12px_-12px_30px_rgba(15,23,42,0.10),-4px_-4px_12px_rgba(15,23,42,0.06),0_30px_70px_rgba(15,23,42,0.12)] sm:p-6 lg:absolute lg:bottom-0 lg:right-0 lg:w-[78%] lg:max-w-[460px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{t("passportPreview")}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t("exampleSupplierName")}
            </h3>
          </div>
          <Badge className="rounded-full bg-blue-50 text-blue-700" variant="secondary">
            {t("summaryOnly")}
          </Badge>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {basicModule ? t("basicModule") : t("module")}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {t("readiness", { score: readinessScore.value })}
              </p>
            </div>
            <CheckCircle2 aria-hidden="true" className="size-9 text-teal-500" />
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {passportSections.map((section) => (
            <div
              key={section}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-700">{section}</span>
              <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-500" />
            </div>
          ))}
        </div>

        <Separator className="my-5" />
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
          <LockKeyhole aria-hidden="true" className="size-4 text-blue-600" />
          {t("secureLine")}
        </div>
      </section>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Icon aria-hidden="true" className={`mb-3 size-5 ${tone}`} />
      <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
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
      className="h-2 overflow-hidden rounded-full bg-slate-100"
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
