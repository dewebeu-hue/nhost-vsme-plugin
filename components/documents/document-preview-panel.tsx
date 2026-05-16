import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import type { EvidenceRoomDocument, EvidenceRoomLinkedQuestion } from "@/lib/mock-data";

type DocumentPreviewPanelProps = {
  document: EvidenceRoomDocument;
  linkedQuestions: EvidenceRoomLinkedQuestion[];
  review: {
    status: "Reviewed";
    reviewedBy: string;
    reviewedOn: string;
  };
};

export function DocumentPreviewPanel({
  document,
  linkedQuestions,
  review,
}: DocumentPreviewPanelProps) {
  return (
    <aside className="supplier-surface rounded-2xl border-0 p-5 xl:sticky xl:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {document.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {document.fileName} · {document.fileSize}
          </p>
        </div>
        <DocumentStatusBadge status={document.status} />
      </div>

      <Tabs defaultValue="preview" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Certificate
              </p>
              <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                ISO 14001:2015
              </p>
              <p className="mt-3 text-sm font-medium text-slate-600">
                Environmental Management System
              </p>
              <div className="mx-auto my-6 h-px w-24 bg-slate-200" />
              <p className="text-lg font-semibold text-slate-950">
                Acme Manufacturing GmbH.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            File type: {document.type}. Uploaded {document.uploaded} by {document.uploadedBy}.
          </div>
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Version 1 is the current reviewed document.
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-6">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          Linked to questionnaire
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {linkedQuestions.map((question) => (
            <div
              key={question.code}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-blue-700">{question.code}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  {question.status}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{question.question}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-sm font-semibold text-slate-950">Review status</p>
        <div className="mt-3">
          <DocumentStatusBadge status={review.status} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Reviewed by {review.reviewedBy} on {review.reviewedOn}
        </p>
        <Button variant="outline" className="mt-4 w-full bg-white">
          Change status
        </Button>
      </section>
    </aside>
  );
}
