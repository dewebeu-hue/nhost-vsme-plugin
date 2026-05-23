"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactElement } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

export type UploadDocumentValues = {
  file: File;
  documentType: string;
  expiresAt?: string;
  note?: string;
};

type UploadDocumentDialogProps = {
  open: boolean;
  isUploading: boolean;
  trigger: ReactElement;
  labels?: DocumentsLabels;
  onOpenChange: (open: boolean) => void;
  onUpload: (values: UploadDocumentValues) => Promise<boolean>;
};

const documentTypes = [
  { value: "certificate", label: "Certificate" },
  { value: "utility_bill", label: "Utility Bill" },
  { value: "policy", label: "Policy" },
  { value: "waste_report", label: "Waste Report" },
  { value: "safety", label: "Safety" },
  { value: "customer_questionnaire", label: "Questionnaire" },
  { value: "report", label: "Report" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
] as const;

export function UploadDocumentDialog({
  open,
  isUploading,
  trigger,
  labels = defaultDocumentsLabels,
  onOpenChange,
  onUpload,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("certificate");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetUploadForm = useCallback(() => {
    setFile(null);
    setDocumentType("certificate");
    setExpiresAt("");
    setNote("");
    setLocalError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!file) {
      setLocalError(labels.chooseBeforeUploading);
      return;
    }

    const uploaded = await onUpload({
      file,
      documentType,
      expiresAt: expiresAt || undefined,
      note: note || undefined,
    });

    if (uploaded) {
      resetUploadForm();
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isUploading) {
      resetUploadForm();
    }

    if (nextOpen) {
      resetUploadForm();
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {labels.uploadDialogTitle}
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600">
              {labels.uploadDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-5">
            <label className="grid cursor-pointer gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center transition hover:border-blue-300 hover:bg-blue-50">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <UploadCloud aria-hidden="true" className="size-5" />
              </span>
              <span className="text-sm font-semibold text-slate-950">
                {file ? file.name : labels.chooseDocument}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {labels.privateFilesNotice}
              </span>
              <Input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {labels.documentType}
                </span>
                <Select
                  value={documentType}
                  onValueChange={(value) => {
                    if (value) {
                      setDocumentType(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {labels.documentTypes[type.label] ?? type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {labels.expiryDate}
                  <span className="ml-1 font-medium text-slate-400">
                    ({labels.optional})
                  </span>
                </span>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  className="h-11 rounded-xl bg-white"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {labels.note}
                <span className="ml-1 font-medium text-slate-400">({labels.optional})</span>
              </span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={labels.optionalNotePlaceholder}
                className="min-h-24 rounded-xl bg-white"
              />
            </label>

            {localError ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {localError}
              </div>
            ) : null}
          </div>

          <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              disabled={isUploading}
              onClick={() => handleOpenChange(false)}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isUploading}>
              <UploadCloud data-icon="inline-start" />
              {isUploading ? labels.uploading : labels.uploadFile}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
