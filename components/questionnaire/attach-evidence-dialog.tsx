"use client";

import { useMemo, useState, type FormEvent } from "react";
import { FileCheck2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StateCard } from "@/components/shared/state-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import type { EvidenceRoomDocument } from "@/lib/mock-data";
import {
  defaultQuestionnaireLabels,
  type QuestionnaireLabels,
} from "@/lib/workspace-labels";

type AttachEvidenceDialogProps = {
  open: boolean;
  documents: EvidenceRoomDocument[];
  linkedDocumentIds: string[];
  isSaving: boolean;
  labels?: QuestionnaireLabels;
  onOpenChange: (open: boolean) => void;
  onAttach: (documentIds: string[]) => Promise<void>;
};

export function AttachEvidenceDialog({
  open,
  documents,
  linkedDocumentIds,
  isSaving,
  labels = defaultQuestionnaireLabels,
  onOpenChange,
  onAttach,
}: AttachEvidenceDialogProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const documentTypes = useMemo(
    () => ["all", ...Array.from(new Set(documents.map((document) => document.type)))],
    [documents],
  );
  const statuses = useMemo(
    () => ["all", ...Array.from(new Set(documents.map((document) => document.status)))],
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesType = type === "all" || document.type === type;
      const matchesStatus = status === "all" || document.status === status;
      const matchesQuery =
        !normalizedQuery ||
        `${document.title} ${document.fileName}`.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesStatus && matchesQuery;
    });
  }, [documents, query, status, type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAttach(selectedIds);
    setSelectedIds([]);
    setQuery("");
    setType("all");
    setStatus("all");
  }

  function toggleDocument(documentId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(documentId)
        ? currentIds.filter((id) => id !== documentId)
        : [...currentIds, documentId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {labels.attachDialogTitle}
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600">
              {labels.attachDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <Input
                  aria-label={labels.searchEvidenceDocuments}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={labels.searchEvidencePlaceholder}
                  className="h-11 rounded-xl bg-slate-50 pl-9"
                />
              </div>
              <FilterSelect
                value={type}
                values={documentTypes}
                onChange={setType}
                allLabel={labels.allTypes}
                ariaLabel={labels.filterEvidenceByType}
                labels={labels}
              />
              <FilterSelect
                value={status}
                values={statuses}
                onChange={setStatus}
                allLabel={labels.allStatus}
                ariaLabel={labels.filterEvidenceByStatus}
                labels={labels}
              />
            </div>

            <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {filteredDocuments.length ? (
                <div className="flex flex-col gap-2">
                  {filteredDocuments.map((document) => {
                    const alreadyLinked = linkedDocumentIds.includes(document.id);
                    const selected = selectedIds.includes(document.id) || alreadyLinked;

                    return (
                      <button
                        key={document.id}
                        type="button"
                        disabled={alreadyLinked}
                        className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => toggleDocument(document.id)}
                      >
                        <Checkbox
                          checked={selected}
                          aria-label={`Select ${document.title}`}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-950">{document.title}</span>
                            <DocumentStatusBadge
                              status={document.status}
                              label={labels.documentStatuses[document.status] ?? document.status}
                            />
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {document.fileName} - {labels.documentTypes[document.type] ?? document.type}
                          </p>
                          {alreadyLinked ? (
                            <p className="mt-1 text-xs font-semibold text-emerald-600">
                              {labels.alreadyAttached}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <StateCard
                  title={
                    documents.length
                      ? labels.noMatchingDocuments
                      : labels.noDocumentsAvailable
                  }
                  description={
                    documents.length
                      ? labels.noMatchingDocumentsDescription
                      : labels.noDocumentsAvailableDescription
                  }
                  className="border-0 shadow-none"
                />
              )}
            </div>
          </div>

          <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isSaving || selectedIds.length === 0}>
              <FileCheck2 data-icon="inline-start" />
              {isSaving ? labels.attaching : labels.attachEvidence}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FilterSelect({
  value,
  values,
  allLabel,
  ariaLabel,
  onChange,
  labels,
}: {
  value: string;
  values: string[];
  allLabel: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  labels: QuestionnaireLabels;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      <SelectTrigger aria-label={ariaLabel} className="h-11 w-full rounded-xl bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {item === "all"
                ? allLabel
                : labels.documentTypes[item as keyof typeof labels.documentTypes] ??
                  labels.documentStatuses[item as keyof typeof labels.documentStatuses] ??
                  item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
