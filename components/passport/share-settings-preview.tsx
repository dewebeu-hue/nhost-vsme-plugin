import { LockKeyhole, ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportShareSetting } from "@/lib/mock-data";

type ShareSettingsPreviewProps = {
  settings: PassportShareSetting[];
};

export function ShareSettingsPreview({ settings }: ShareSettingsPreviewProps) {
  return (
    <SectionCard
      title="Share settings preview"
      description="Default controls for a new buyer link."
      action={
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LockKeyhole aria-hidden="true" />
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {settings.map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-500">{setting.label}</span>
            <span className="text-sm font-semibold text-slate-950">{setting.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 text-teal-700" />
        <p className="text-sm leading-6 text-slate-600">
          Buyers can view the approved passport without changing answers or documents.
        </p>
      </div>
    </SectionCard>
  );
}
