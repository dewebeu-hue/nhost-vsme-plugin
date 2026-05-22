import { LifeBuoy } from "lucide-react";
import { EvidenceRecommendationCard } from "@/components/questionnaire/evidence-recommendation-card";
import { SupportRequestDialog, type SupportRequestLabels } from "@/components/support/support-request-dialog";

type QuestionnaireHelperPanelProps = {
  tipsTitle: string;
  guidance: string;
  learnMoreLabel: string;
  evidenceRecommendationsTitle: string;
  uploadEvidenceLabel: string;
  relatedDocumentsTitle: string;
  relatedDocumentsUnavailable: string;
  needHelpTitle: string;
  needHelpText: string;
  supportRequestLabels: SupportRequestLabels;
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
  relatedDocumentsUnavailable,
  needHelpTitle,
  needHelpText,
  supportRequestLabels,
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
        <p className="mt-4 text-sm font-medium text-slate-500">{learnMoreLabel}</p>
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
        {relatedDocuments.length ? (
          <div className="mt-4 flex flex-col gap-3">
            {relatedDocuments.map((document) => (
              <div
                key={`${document.name}-${document.type}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="truncate text-sm font-semibold text-slate-950">
                  {document.name}
                </p>
                <p className="text-xs font-medium text-slate-500">{document.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {relatedDocumentsUnavailable}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <LifeBuoy aria-hidden="true" className="size-5" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-950">
          {needHelpTitle}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{needHelpText}</p>
        <SupportRequestDialog labels={supportRequestLabels} />
      </section>
    </aside>
  );
}
