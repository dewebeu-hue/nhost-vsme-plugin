import { CheckCircle2, ExternalLink, Link2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import type { EvidenceRoomDocument, EvidenceRoomLinkedQuestion } from "@/lib/mock-data";
import { defaultDocumentsLabels, formatLabel, type DocumentsLabels } from "@/lib/workspace-labels";

type DocumentPreviewPanelProps = {
  document: EvidenceRoomDocument;
  linkedQuestions: EvidenceRoomLinkedQuestion[];
  onLinkToAnswer?: (document: EvidenceRoomDocument) => void;
  labels?: DocumentsLabels;
};

export function DocumentPreviewPanel({
  document,
  linkedQuestions,
  onLinkToAnswer,
  labels = defaultDocumentsLabels,
}: DocumentPreviewPanelProps) {
  return (
    <aside className="supplier-surface rounded-2xl border-0 p-5 xl:sticky xl:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {document.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {document.fileName} - {document.fileSize}
          </p>
        </div>
        <DocumentStatusBadge
          status={document.status}
          label={labels.statuses[document.status] ?? document.status}
        />
      </div>

      <Tabs defaultValue="preview" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="preview">{labels.preview}</TabsTrigger>
          <TabsTrigger value="details">{labels.details}</TabsTrigger>
          <TabsTrigger value="versions">{labels.versions}</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <LockKeyhole aria-hidden="true" className="size-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                {labels.secureEvidencePreview}
              </p>
              <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                {document.type === "Certificate" ? "ISO 14001:2015" : document.title}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-600">
                {document.type === "Certificate"
                  ? labels.environmentalManagementSystem
                  : labels.privateWorkspaceDocument}
              </p>
              <div className="mx-auto my-6 h-px w-24 bg-slate-200" />
        <p className="text-lg font-semibold text-slate-950">
                {document.title}
              </p>
            </div>
            {!document.previewUrl ? (
              <p className="mt-3 text-center text-sm leading-6 text-slate-500">
                {labels.securePreviewUnavailable}
              </p>
            ) : null}
            <Button
              variant="outline"
              className="mt-4 w-full bg-white"
              disabled={!document.previewUrl}
              onClick={() => {
                if (document.previewUrl) {
                  window.open(document.previewUrl, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <ExternalLink data-icon="inline-start" />
              {labels.openSecurePreview}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {labels.fileType}: {labels.documentTypes[document.type] ?? document.type}.{" "}
            {labels.uploaded} {document.uploaded}{" "}
            {formatLabel(labels.uploadedBy, { name: document.uploadedBy })}.
            {document.expiresAt ? (
              <>
                {" "}
                {labels.expiryDate}: {formatDate(document.expiresAt)}.
              </>
            ) : null}
            {document.status === "Expired" ? (
              <p className="mt-3 font-semibold text-red-700">{labels.expired}</p>
            ) : null}
            {document.status === "Expiring soon" ? (
              <p className="mt-3 font-semibold text-red-700">
                {getDaysUntilDate(document.expiresAt) !== null &&
                Number(getDaysUntilDate(document.expiresAt)) <= 30
                  ? labels.expiresWithin30Days
                  : labels.expiresWithin90Days}
              </p>
            ) : null}
          </div>
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {labels.versionCurrent}
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-6">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          {labels.linkedToQuestionnaire}
        </h3>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full bg-white"
          onClick={() => onLinkToAnswer?.(document)}
        >
          <Link2 data-icon="inline-start" />
          {labels.linkToAnswer}
        </Button>
        <div className="mt-3 flex flex-col gap-3">
          {linkedQuestions.length ? (
            linkedQuestions.map((question) => (
              <div
                key={question.code}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-blue-700">{question.code}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    {question.status === "Answered" ? labels.answered : question.status}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{question.question}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
              {labels.notLinkedYet}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-sm font-semibold text-slate-950">{labels.reviewStatus}</p>
        <div className="mt-3">
          <DocumentStatusBadge
            status={document.status}
            label={labels.statuses[document.status] ?? document.status}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {labels.notReviewedYet}
        </p>
      </section>
    </aside>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getDaysUntilDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);

  return Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}
