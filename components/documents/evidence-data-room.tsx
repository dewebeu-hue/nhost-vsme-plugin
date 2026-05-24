"use client";

import { useMemo, useState } from "react";
import { DocumentPreviewPanel } from "@/components/documents/document-preview-panel";
import { DocumentsTable } from "@/components/documents/documents-table";
import { StateCard } from "@/components/shared/state-card";
import type { EvidenceRoomDocument, EvidenceRoomLinkedQuestion } from "@/lib/mock-data";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

type EvidenceDataRoomProps = {
  documents: EvidenceRoomDocument[];
  initialSelectedDocumentId: string;
  linkedQuestions: EvidenceRoomLinkedQuestion[];
  linkedQuestionsByDocument?: Record<string, EvidenceRoomLinkedQuestion[]>;
  downloadingDocumentId?: string | null;
  onDownloadDocument?: (document: EvidenceRoomDocument) => void;
  onLinkToAnswer?: (document: EvidenceRoomDocument) => void;
  labels?: DocumentsLabels;
};

export function EvidenceDataRoom({
  documents,
  initialSelectedDocumentId,
  linkedQuestions,
  linkedQuestionsByDocument,
  downloadingDocumentId,
  onDownloadDocument,
  onLinkToAnswer,
  labels = defaultDocumentsLabels,
}: EvidenceDataRoomProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(initialSelectedDocumentId);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) ?? documents[0],
    [documents, selectedDocumentId],
  );

  if (!selectedDocument) {
    return (
      <StateCard
        title={labels.noDocumentsTitle}
        description={labels.noDocumentsText}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <DocumentsTable
        documents={documents}
        selectedDocumentId={selectedDocument.id}
        onSelectDocument={(document) => setSelectedDocumentId(document.id)}
        onDownloadDocument={onDownloadDocument}
        downloadingDocumentId={downloadingDocumentId}
        onLinkToAnswer={onLinkToAnswer}
        labels={labels}
      />
      <DocumentPreviewPanel
        document={selectedDocument}
        linkedQuestions={linkedQuestionsByDocument?.[selectedDocument.id] ?? linkedQuestions}
        onLinkToAnswer={onLinkToAnswer}
        labels={labels}
      />
    </div>
  );
}
