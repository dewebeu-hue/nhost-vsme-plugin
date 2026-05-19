import type { EvidenceRoomStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type DocumentStatusBadgeProps = {
  status: EvidenceRoomStatus;
  label?: string;
};

const statusStyles: Record<EvidenceRoomStatus, string> = {
  Reviewed: "border-teal-200 bg-teal-50 text-teal-700",
  Linked: "border-blue-200 bg-blue-50 text-blue-700",
  Uploaded: "border-slate-200 bg-slate-50 text-slate-600",
  "Needs review": "border-amber-200 bg-amber-50 text-amber-700",
  "Expiring soon": "border-red-200 bg-red-50 text-red-700",
  Expired: "border-red-300 bg-red-100 text-red-800",
};

export function DocumentStatusBadge({ status, label }: DocumentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
