import { ExternalLink, FileText, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidenceRecommendationCard } from "@/components/questionnaire/evidence-recommendation-card";

type QuestionnaireHelperPanelProps = {
  tipsTitle: string;
  guidance: string;
  learnMoreLabel: string;
  evidenceRecommendationsTitle: string;
  uploadEvidenceLabel: string;
  relatedDocumentsTitle: string;
  needHelpTitle: string;
  needHelpText: string;
  contactSupportLabel: string;
  evidenceRecommendations: readonly string[];
  relatedDocuments: readonly {
    name: string;
    type: string;
  }[];
  onUploadEvidence?: () => void;
};

export function QuestionnaireHelperPanel({
  tipsTitle,
  guidance,
  learnMoreLabel,
  evidenceRecommendationsTitle,
  uploadEvidenceLabel,
  relatedDocumentsTitle,
  needHelpTitle,
  needHelpText,
  contactSupportLabel,
  evidenceRecommendations,
  relatedDocuments,
  onUploadEvidence,
}: QuestionnaireHelperPanelProps) {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          {tipsTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{guidance}</p>
        <a
          href="#"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {learnMoreLabel}
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </section>

      <EvidenceRecommendationCard
        recommendations={evidenceRecommendations}
        title={evidenceRecommendationsTitle}
        uploadLabel={uploadEvidenceLabel}
        onUploadEvidence={onUploadEvidence}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          {relatedDocumentsTitle}
        </h3>
        <div className="mt-4 flex flex-col gap-3">
          {relatedDocuments.map((document) => (
            <div
              key={`${document.name}-${document.type}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <FileText aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {document.name}
                </p>
                <p className="text-xs font-medium text-slate-500">{document.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <LifeBuoy aria-hidden="true" className="size-5" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          {needHelpTitle}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{needHelpText}</p>
        <Button variant="outline" className="mt-4 w-full bg-white">
          {contactSupportLabel}
        </Button>
      </section>
    </aside>
  );
}
