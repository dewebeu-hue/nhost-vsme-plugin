import { Award, FileSpreadsheet, FileText, GraduationCap, ScrollText } from "lucide-react";
import type { EvidenceRoomDocument } from "@/lib/mock-data";

type FileTypeIconProps = {
  type: EvidenceRoomDocument["type"];
};

export function FileTypeIcon({ type }: FileTypeIconProps) {
  const Icon =
    type === "Certificate"
      ? Award
      : type === "Utility Bill"
        ? FileSpreadsheet
        : type === "Policy"
          ? ScrollText
          : type === "Training"
            ? GraduationCap
            : FileText;

  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
      <Icon aria-hidden="true" className="size-5" />
    </div>
  );
}
