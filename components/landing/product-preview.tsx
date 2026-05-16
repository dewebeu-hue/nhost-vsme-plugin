import { Building2, CheckCircle2, FileText, LockKeyhole, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  buyerRequests,
  currentOrganization,
  documents,
  missingDataSummary,
  readinessScore,
  vsmeModules,
} from "@/lib/mock-data";

const moduleLabels: Record<string, string> = {
  "Company profile": "Basic Information",
  Environment: "Environment",
  "Social and workforce": "Social",
  Governance: "Governance",
};

const passportSections = [
  "Company overview",
  "Environment",
  "Social",
  "Governance",
  "Evidence summary",
] as const;

export function ProductPreview() {
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
    <div className="relative mx-auto min-h-[620px] w-full max-w-[620px] lg:mx-0">
      <div className="absolute inset-x-6 top-2 h-72 rounded-[2rem] bg-blue-600/10 blur-3xl" />

      <section className="supplier-surface relative rounded-[2rem] border-0 p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Supplier readiness</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Dashboard preview
            </h2>
          </div>
          <Badge className="rounded-full bg-emerald-50 text-emerald-700" variant="secondary">
            Live profile
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <ProgressRing value={readinessScore.value} label="Ready" helper="VSME" size={132} />
          <div className="grid gap-3">
            {previewModules.map((module) => (
              <div key={module.label} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{module.label}</span>
                  <span className="font-semibold text-slate-950">{module.completion}%</span>
                </div>
                <Progress value={module.completion} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <PreviewStat label="Evidence files" value={String(evidenceFileCount)} icon={FileText} />
          <PreviewStat
            label="Missing data"
            value={String(missingDataPoints)}
            icon={Radio}
            tone="text-amber-600"
          />
          <PreviewStat
            label="Buyer requests"
            value={String(buyerRequests.length)}
            icon={Building2}
            tone="text-teal-600"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Last updated May 12, 2024
        </div>
      </section>

      <section className="supplier-surface relative ml-auto mt-4 w-[92%] rounded-[2rem] border-0 p-5 shadow-[0_30px_70px_rgba(15,23,42,0.14)] sm:mt-[-42px] sm:p-6 lg:w-[82%]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Passport preview</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {currentOrganization.name}
            </h3>
          </div>
          <StatusBadge status="reviewed" />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {basicModule ? "VSME Basic Module" : "VSME Module"}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Readiness {readinessScore.value}%
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
          Secure · Read-only · Expires May 12, 2025
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
