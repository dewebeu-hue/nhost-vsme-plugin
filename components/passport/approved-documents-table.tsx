import { FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportApprovedDocument } from "@/lib/mock-data";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

type ApprovedDocumentsTableProps = {
  documents: PassportApprovedDocument[];
  labels?: PassportLabels;
};

export function ApprovedDocumentsTable({
  documents,
  labels = defaultPassportLabels,
}: ApprovedDocumentsTableProps) {
  return (
    <SectionCard
      title={labels.approvedDocuments}
      description={labels.approvedDocumentsDescription}
      contentClassName="overflow-hidden px-0 pb-0"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="pl-6">{labels.document}</TableHead>
            <TableHead>{labels.category}</TableHead>
            <TableHead>{labels.linkedSections}</TableHead>
            <TableHead className="pr-6 text-right">{labels.status}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id} className="border-slate-100">
              <TableCell className="min-w-56 py-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <FileCheck2 aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-slate-950">{document.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-slate-600">
                {labels.documentCategories[document.category] ?? document.category}
              </TableCell>
              <TableCell className="max-w-80 text-slate-600">
                {document.linkedSections.map((section) => labels.modules[section] ?? section).join(", ")}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Badge
                  variant="outline"
                  className="rounded-full border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-700"
                >
                  {labels.approved}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
