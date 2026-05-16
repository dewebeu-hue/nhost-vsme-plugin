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

type ApprovedDocumentsTableProps = {
  documents: PassportApprovedDocument[];
};

export function ApprovedDocumentsTable({ documents }: ApprovedDocumentsTableProps) {
  return (
    <SectionCard
      title="Approved documents"
      description="Evidence files approved for the buyer-facing passport."
      contentClassName="overflow-hidden px-0 pb-0"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="pl-6">Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Linked sections</TableHead>
            <TableHead className="pr-6 text-right">Status</TableHead>
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
              <TableCell className="font-medium text-slate-600">{document.category}</TableCell>
              <TableCell className="max-w-80 text-slate-600">
                {document.linkedSections.join(", ")}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Badge
                  variant="outline"
                  className="rounded-full border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-700"
                >
                  {document.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
