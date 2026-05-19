import { FileText } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardUpload = {
  name: string;
  category: string;
  uploadedAt: string;
};

type RecentUploadsCardProps = {
  uploads: DashboardUpload[];
  labels?: DashboardOverviewLabels;
};

export function RecentUploadsCard({
  uploads,
  labels = defaultDashboardOverviewLabels,
}: RecentUploadsCardProps) {
  return (
    <SectionCard
      title={labels.recentUploads}
      description={labels.recentUploadsDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {uploads.length ? uploads.map((upload) => (
          <div key={upload.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">{upload.name}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {formatUploadDate(upload.uploadedAt)}
              </p>
            </div>
            <DashboardStatusPill tone={upload.category === "Social" ? "teal" : upload.category === "Governance" ? "green" : "blue"}>
              {labels.modules[upload.category] ?? upload.category}
            </DashboardStatusPill>
          </div>
        )) : (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
            {labels.noRecentUploads}
          </p>
        )}
      </div>
    </SectionCard>
  );
}

function formatUploadDate(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
