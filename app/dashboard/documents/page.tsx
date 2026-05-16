import { FolderPlus, UploadCloud } from "lucide-react";
import { DocumentsMetricCards } from "@/components/documents/documents-metric-cards";
import { DocumentsToolbar } from "@/components/documents/documents-toolbar";
import { EvidenceDataRoom } from "@/components/documents/evidence-data-room";
import { Button } from "@/components/ui/button";
import {
  evidenceRoomDocuments,
  evidenceRoomFilters,
  evidenceRoomLinkedQuestions,
  evidenceRoomMetrics,
  evidenceRoomReview,
  evidenceRoomSelectedDocumentId,
} from "@/lib/mock-data";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Evidence Data Room</span>
            <span aria-hidden="true" className="text-slate-300">
              &gt;
            </span>
            <span className="text-slate-900">Documents</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Evidence Data Room
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Upload, organize and manage documents that support your VSME profile.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700">
            <UploadCloud data-icon="inline-start" />
            Upload documents
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-white px-5">
            <FolderPlus data-icon="inline-start" />
            Create folder
          </Button>
        </div>
      </div>

      <DocumentsMetricCards metrics={evidenceRoomMetrics} />
      <DocumentsToolbar filters={evidenceRoomFilters} />
      <EvidenceDataRoom
        documents={evidenceRoomDocuments}
        initialSelectedDocumentId={evidenceRoomSelectedDocumentId}
        linkedQuestions={evidenceRoomLinkedQuestions}
        review={evidenceRoomReview}
      />
    </div>
  );
}
