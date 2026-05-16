"use client";

import { useMemo, useState } from "react";
import { DocumentPreviewPanel } from "@/components/documents/document-preview-panel";
import { DocumentsTable } from "@/components/documents/documents-table";
import type { EvidenceRoomDocument, EvidenceRoomLinkedQuestion } from "@/lib/mock-data";

type EvidenceDataRoomProps = {
  documents: EvidenceRoomDocument[];
  initialSelectedDocumentId: string;
  linkedQuestions: EvidenceRoomLinkedQuestion[];
  review: {
    status: "Reviewed";
    reviewedBy: string;
    reviewedOn: string;
  };
};

export function EvidenceDataRoom({
  documents,
  initialSelectedDocumentId,
  linkedQuestions,
  review,
}: EvidenceDataRoomProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(initialSelectedDocumentId);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) ?? documents[0],
    [documents, selectedDocumentId],
  );

  if (!selectedDocument) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <DocumentsTable
        documents={documents}
        selectedDocumentId={selectedDocument.id}
        onSelectDocument={(document) => setSelectedDocumentId(document.id)}
      />
      <DocumentPreviewPanel
        document={selectedDocument}
        linkedQuestions={linkedQuestions}
        review={review}
      />
    </div>
  );
}
