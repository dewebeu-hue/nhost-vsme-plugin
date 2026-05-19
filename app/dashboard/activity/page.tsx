import { redirect } from "next/navigation";
import { StateCard } from "@/components/shared/state-card";

export const dynamic = "force-dynamic";

export type ActivityPageLabels = {
  title: string;
  subtitle: string;
  unavailableTitle: string;
  unavailableDescription: string;
  uploadsTitle: string;
  uploadsDescription: string;
  sharingTitle: string;
  sharingDescription: string;
};

const defaultActivityLabels: ActivityPageLabels = {
  title: "Activity",
  subtitle: "Track uploads, evidence links, share events and buyer requests when activity tracking is available.",
  unavailableTitle: "Activity log is not available yet.",
  unavailableDescription:
    "Future activity tracking will show uploads, evidence links, share events and buyer requests.",
  uploadsTitle: "Uploads and evidence links",
  uploadsDescription: "Document uploads and answer links will appear here after activity tracking is enabled.",
  sharingTitle: "Sharing events",
  sharingDescription: "Public link views and buyer requests will appear here in a later version.",
};

export function ActivityPageContent({ labels = defaultActivityLabels }: { labels?: ActivityPageLabels }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {labels.title}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          {labels.subtitle}
        </p>
      </div>
      <StateCard
        title={labels.unavailableTitle}
        description={labels.unavailableDescription}
        tone="info"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <StateCard
          title={labels.uploadsTitle}
          description={labels.uploadsDescription}
          tone="empty"
        />
        <StateCard
          title={labels.sharingTitle}
          description={labels.sharingDescription}
          tone="empty"
        />
      </div>
    </div>
  );
}

export default function ActivityPage() {
  redirect("/en/dashboard/activity");
}
