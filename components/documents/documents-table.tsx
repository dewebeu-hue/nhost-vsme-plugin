import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import type { EvidenceRoomDocument } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type DocumentsTableProps = {
  documents: EvidenceRoomDocument[];
  selectedDocumentId: string;
  onSelectDocument: (document: EvidenceRoomDocument) => void;
};

export function DocumentsTable({
  documents,
  selectedDocumentId,
  onSelectDocument,
}: DocumentsTableProps) {
  return (
    <section className="supplier-surface overflow-hidden rounded-2xl border-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="w-10 px-4">
              <Checkbox aria-label="Select all documents" />
            </TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Linked to</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => {
            const selected = document.id === selectedDocumentId;

            return (
              <TableRow
                key={document.id}
                data-state={selected ? "selected" : undefined}
                className={cn(
                  "cursor-pointer border-slate-100",
                  selected && "bg-blue-50/70 hover:bg-blue-50",
                )}
                onClick={() => onSelectDocument(document)}
              >
                <TableCell className="px-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${document.title}`}
                    checked={selected}
                    onCheckedChange={() => onSelectDocument(document)}
                  />
                </TableCell>
                <TableCell className="min-w-72 py-4">
                  <div className="flex items-center gap-3">
                    <FileTypeIcon type={document.type} />
                    <div>
                      <p className="font-semibold text-slate-950">{document.title}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {document.fileName} · {document.fileSize}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{document.type}</TableCell>
                <TableCell className="min-w-48 text-slate-600">
                  {document.linkedTo.join(", ")}
                  {document.linkedExtra ? (
                    <span className="ml-1 font-medium text-slate-500">
                      {document.linkedExtra}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="min-w-48 text-slate-600">
                  <div>{document.uploaded}</div>
                  <div className="text-xs text-slate-500">by {document.uploadedBy}</div>
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={document.status} />
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${document.title}`}>
                    <MoreHorizontal />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
