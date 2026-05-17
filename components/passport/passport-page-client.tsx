"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Download, Link2, Sparkles } from "lucide-react";
import { ApprovedDocumentsTable } from "@/components/passport/approved-documents-table";
import { MissingDataChecklist } from "@/components/passport/missing-data-checklist";
import { PassportCompanySummary } from "@/components/passport/passport-company-summary";
import { PassportDisclaimer } from "@/components/passport/passport-disclaimer";
import { PassportReadinessSummary } from "@/components/passport/passport-readiness-summary";
import { PassportSectionCard } from "@/components/passport/passport-section-card";
import { ShareSettingsPreview } from "@/components/passport/share-settings-preview";
import { SectionCard } from "@/components/shared/section-card";
import { StateCard } from "@/components/shared/state-card";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  passportApprovedDocuments,
  passportCompanyProfile,
  passportMissingDataChecklist,
  passportReadinessSummary,
  passportSections,
  passportShareSettings,
} from "@/lib/mock-data";
import { getBrowserNhostClient } from "@/lib/nhost/client";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

type SupplierPassportPayload = {
  configured?: boolean;
  organization?: { id: string; name: string } | null;
  passport?: SupplierPassportRecord | null;
  error?: string;
};

type ShareLinkPayload = {
  configured?: boolean;
  shareUrl?: string;
  error?: string;
};

type SupplierPassportRecord = {
  id: string;
  organization_id: string;
  title: string;
  status: "draft" | "generated" | "shared" | "archived";
  readiness_score: number;
  generated_at: string | null;
  updated_at: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type PassportPageClientProps = {
  labels?: PassportLabels;
};

export function PassportPageClient({
  labels = defaultPassportLabels,
}: PassportPageClientProps) {
  const locale = useLocale();
  const [passport, setPassport] = useState<SupplierPassportRecord | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLatestPassport() {
      const session = getBrowserNhostClient()?.getUserSession();

      if (!session?.accessToken) {
        return;
      }

      try {
        const response = await fetch("/api/passports", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ action: "latest" }),
        });
        const payload = (await response.json()) as SupplierPassportPayload;

        if (cancelled) {
          return;
        }

        if (response.ok && payload.configured !== false && payload.organization) {
          setOrganizationId(payload.organization.id);
          setPassport(payload.passport ?? null);
        }
      } catch {
        if (!cancelled) {
          setMessage({ tone: "info", text: labels.draftStateText });
        }
      }
    }

    void loadLatestPassport();

    return () => {
      cancelled = true;
    };
  }, [labels.draftStateText]);

  const readiness = useMemo(
    () => ({
      ...passportReadinessSummary,
      score: passport?.readiness_score ?? passportReadinessSummary.score,
      modules: passportReadinessSummary.modules.map((module) =>
        module.label === "Environment" && passport
          ? { ...module, value: passport.readiness_score }
          : module,
      ),
    }),
    [passport],
  );

  async function handleGeneratePassport() {
    const session = getBrowserNhostClient()?.getUserSession();

    if (!session?.accessToken) {
      setMessage({ tone: "info", text: labels.draftStateText });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/passports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ action: "generate" }),
      });
      const payload = (await response.json()) as SupplierPassportPayload;

      if (!response.ok || payload.configured === false || !payload.passport) {
        throw new Error(payload.error || labels.generateError);
      }

      setOrganizationId(payload.organization?.id ?? payload.passport.organization_id);
      setPassport(payload.passport);
      setMessage({ tone: "success", text: labels.generateSuccess });
    } catch {
      setMessage({ tone: "error", text: labels.generateError });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreateShareLink(values: ShareLinkFormValues) {
    const session = getBrowserNhostClient()?.getUserSession();

    if (!session?.accessToken || !passport || !organizationId) {
      setMessage({ tone: "error", text: labels.shareLinkGenerateFirst });
      return;
    }

    setIsCreatingShare(true);
    setMessage(null);

    try {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          passportId: passport.id,
          organizationId,
          ...values,
          locale,
        }),
      });
      const payload = (await response.json()) as ShareLinkPayload;

      if (!response.ok || payload.configured === false || !payload.shareUrl) {
        throw new Error(payload.error || labels.shareLinkError);
      }

      setShareUrl(payload.shareUrl);
      setMessage({ tone: "success", text: labels.shareLinkSuccess });
    } catch {
      setMessage({ tone: "error", text: labels.shareLinkError });
    } finally {
      setIsCreatingShare(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:flex">
          <Button
            className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700"
            disabled={isGenerating}
            onClick={handleGeneratePassport}
          >
            <Sparkles data-icon="inline-start" />
            {isGenerating ? labels.generatePassport : labels.generatePassport}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl bg-white px-5"
            onClick={() => {
              if (!passport) {
                setMessage({ tone: "error", text: labels.shareLinkGenerateFirst });
                return;
              }

              setIsShareOpen(true);
            }}
          >
            <Link2 data-icon="inline-start" />
            {labels.createShareLink}
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-white px-5">
            <Download data-icon="inline-start" />
            {labels.exportPdf}
          </Button>
        </div>
      </div>

      {message ? (
        <StateCard title={message.text} description="" tone={message.tone === "error" ? "warning" : message.tone} />
      ) : passport ? (
        <StateCard
          title={`${labels.passportStatus}: ${passport.status}`}
          description={`${labels.generatedAt}: ${formatDate(passport.generated_at ?? passport.updated_at)}`}
          tone="success"
        />
      ) : (
        <StateCard title={labels.noPassportTitle} description={labels.noPassportText} tone="info" />
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-w-0 flex-col gap-6">
          <PassportCompanySummary profile={passportCompanyProfile} labels={labels} />
          <PassportReadinessSummary score={readiness.score} modules={readiness.modules} labels={labels} />
          <SectionCard
            title={labels.passportSections}
            description={labels.passportSectionsDescription}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {passportSections.map((section) => (
                <PassportSectionCard key={section.title} section={section} labels={labels} />
              ))}
            </div>
          </SectionCard>
          <ApprovedDocumentsTable documents={passportApprovedDocuments} labels={labels} />
        </main>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-28 xl:self-start">
          <MissingDataChecklist items={passportMissingDataChecklist} labels={labels} />
          <ShareSettingsPreview settings={passportShareSettings} labels={labels} />
          <PassportDisclaimer title={labels.notCertificationTitle} text={labels.notCertificationText} />
        </aside>
      </div>

      <CreateShareLinkDialog
        open={isShareOpen}
        isSaving={isCreatingShare}
        shareUrl={shareUrl}
        labels={labels}
        onOpenChange={setIsShareOpen}
        onSubmit={handleCreateShareLink}
      />
    </div>
  );
}

type ShareLinkFormValues = {
  buyerName: string;
  buyerEmail: string;
  expiresAt: string;
  password: string;
  documentVisibility: "approved_only" | "all_linked_documents";
};

function CreateShareLinkDialog({
  open,
  isSaving,
  shareUrl,
  labels,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  isSaving: boolean;
  shareUrl: string;
  labels: PassportLabels;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ShareLinkFormValues) => Promise<void>;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [documentVisibility, setDocumentVisibility] =
    useState<ShareLinkFormValues["documentVisibility"]>("approved_only");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      buyerName,
      buyerEmail,
      expiresAt,
      password: passwordProtected ? password : "",
      documentVisibility,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {labels.createShareLinkTitle}
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600">
              {labels.createShareLinkDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <InputWithLabel label={labels.buyerName} value={buyerName} onChange={setBuyerName} />
            <InputWithLabel label={labels.buyerEmail} type="email" value={buyerEmail} onChange={setBuyerEmail} />
            <InputWithLabel label={labels.expiryDate} type="date" value={expiresAt} onChange={setExpiresAt} />
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">{labels.documentVisibility}</label>
              <Select value={documentVisibility} onValueChange={(value) => setDocumentVisibility(value as ShareLinkFormValues["documentVisibility"])}>
                <SelectTrigger className="h-11 rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved_only">{labels.approvedOnly}</SelectItem>
                  <SelectItem value="all_linked_documents">{labels.allLinkedDocuments}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Checkbox checked={passwordProtected} onCheckedChange={(checked) => setPasswordProtected(checked === true)} />
              {labels.passwordProtected}
            </label>
            {passwordProtected ? (
              <InputWithLabel label={labels.password} type="password" value={password} onChange={setPassword} />
            ) : null}
            {shareUrl ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-900">{labels.generatedLink}</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input readOnly value={shareUrl} className="bg-white" />
                  <Button type="button" variant="outline" className="bg-white" onClick={() => navigator.clipboard?.writeText(shareUrl)}>
                    {labels.copyLink}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button type="button" variant="outline" className="bg-white" disabled={isSaving} onClick={() => onOpenChange(false)}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Link2 data-icon="inline-start" />
              {isSaving ? labels.creatingLink : labels.createLink}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InputWithLabel({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl bg-white"
      />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
