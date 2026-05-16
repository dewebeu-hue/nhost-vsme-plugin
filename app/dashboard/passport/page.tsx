import { Download, Link2, Sparkles } from "lucide-react";
import { ApprovedDocumentsTable } from "@/components/passport/approved-documents-table";
import { MissingDataChecklist } from "@/components/passport/missing-data-checklist";
import { PassportCompanySummary } from "@/components/passport/passport-company-summary";
import { PassportDisclaimer } from "@/components/passport/passport-disclaimer";
import { PassportReadinessSummary } from "@/components/passport/passport-readiness-summary";
import { PassportSectionCard } from "@/components/passport/passport-section-card";
import { ShareSettingsPreview } from "@/components/passport/share-settings-preview";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  passportApprovedDocuments,
  passportCompanyProfile,
  passportDisclaimer,
  passportMissingDataChecklist,
  passportReadinessSummary,
  passportSections,
  passportShareSettings,
} from "@/lib/mock-data";

export default function PassportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Supplier Passport
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Review your VSME readiness profile, approved evidence, and buyer-facing passport before
            sharing.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:flex">
          <Button className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700">
            <Sparkles data-icon="inline-start" />
            Generate Passport
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-white px-5">
            <Link2 data-icon="inline-start" />
            Create Share Link
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-white px-5">
            <Download data-icon="inline-start" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-w-0 flex-col gap-6">
          <PassportCompanySummary profile={passportCompanyProfile} />
          <PassportReadinessSummary
            score={passportReadinessSummary.score}
            modules={passportReadinessSummary.modules}
          />
          <SectionCard
            title="Passport sections"
            description="Control what buyers can review in the generated passport."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {passportSections.map((section) => (
                <PassportSectionCard key={section.title} section={section} />
              ))}
            </div>
          </SectionCard>
          <ApprovedDocumentsTable documents={passportApprovedDocuments} />
        </main>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-28 xl:self-start">
          <MissingDataChecklist items={passportMissingDataChecklist} />
          <ShareSettingsPreview settings={passportShareSettings} />
          <PassportDisclaimer text={passportDisclaimer} />
        </aside>
      </div>
    </div>
  );
}
