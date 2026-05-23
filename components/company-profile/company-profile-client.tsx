"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Building2, Globe2, ImageIcon, MapPin, Trash2, Upload, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualHelpCard } from "@/components/onboarding/contextual-help";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompanyProfileSummary } from "@/lib/company-profile-summary";
import type { CompanyProfileLabels } from "@/lib/operational-labels";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { cn } from "@/lib/utils";

type CompanyProfileClientProps = {
  initialSummary: CompanyProfileSummary | null;
  initialLoadFailed?: boolean;
  labels: CompanyProfileLabels;
  localePrefix: string;
};

export function CompanyProfileClient({
  initialSummary,
  initialLoadFailed = false,
  labels,
  localePrefix,
}: CompanyProfileClientProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [loadFailed, setLoadFailed] = useState(initialLoadFailed);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(initialSummary?.logoUrl ?? null);
  const [logoAltText, setLogoAltText] = useState(initialSummary?.logoAltText ?? "");
  const [logoMessage, setLogoMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isLogoSaving, setIsLogoSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileSummary() {
      const session = await getFreshBrowserNhostSession();

      if (!session?.accessToken || cancelled) {
        return;
      }

      try {
        const response = await fetch("/api/company-profile/summary", {
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setLoadFailed(true);
          return;
        }

        const payload = (await response.json()) as {
          summary?: CompanyProfileSummary | null;
        };

        setSummary(payload.summary ?? null);
        setLogoPreviewUrl(payload.summary?.logoUrl ?? null);
        setLogoAltText(payload.summary?.logoAltText ?? "");
        setLoadFailed(false);
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
        }
      }
    }

    void loadProfileSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const legalName = summary?.legalCompanyName || summary?.organizationName || "";
  const location = summary?.headquarters || [summary?.city, summary?.country].filter(Boolean).join(", ");

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      setLogoMessage({ tone: "error", text: labels.logoMissingSession });
      resetFileInput();
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    const previousPreviewUrl = logoPreviewUrl;
    setLogoPreviewUrl(localPreviewUrl);
    setLogoMessage(null);
    setIsLogoSaving(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("altText", logoAltText || legalName || summary?.organizationName || "");

      const response = await fetch("/api/organization/logo", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });
      const payload = (await response.json()) as {
        logo?: { url?: string | null; altText?: string | null };
      };

      if (!response.ok || !payload.logo?.url) {
        throw new Error("logo_upload_failed");
      }

      URL.revokeObjectURL(localPreviewUrl);
      setLogoPreviewUrl(payload.logo.url);
      setLogoAltText(payload.logo.altText ?? logoAltText);
      setSummary((current) =>
        current
          ? {
            ...current,
            logoUrl: payload.logo?.url ?? null,
            logoAltText: payload.logo?.altText ?? logoAltText,
          }
          : current,
      );
      setLogoMessage({ tone: "success", text: labels.logoUploadSuccess });
    } catch {
      URL.revokeObjectURL(localPreviewUrl);
      setLogoPreviewUrl(previousPreviewUrl);
      setLogoMessage({ tone: "error", text: labels.logoUploadError });
    } finally {
      setIsLogoSaving(false);
      resetFileInput();
    }
  }

  async function handleRemoveLogo() {
    const session = await getFreshBrowserNhostSession();

    if (!session?.accessToken) {
      setLogoMessage({ tone: "error", text: labels.logoMissingSession });
      return;
    }

    setIsLogoSaving(true);
    setLogoMessage(null);

    try {
      const response = await fetch("/api/organization/logo", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("logo_remove_failed");
      }

      setLogoPreviewUrl(null);
      setLogoAltText("");
      setSummary((current) =>
        current
          ? {
            ...current,
            logoUrl: null,
            logoAltText: null,
          }
          : current,
      );
      setLogoMessage({ tone: "success", text: labels.logoRemoveSuccess });
    } catch {
      setLogoMessage({ tone: "error", text: labels.logoRemoveError });
    } finally {
      setIsLogoSaving(false);
      resetFileInput();
    }
  }

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        action={
          <Link
            href={`${localePrefix}/dashboard/questionnaire?section=company_basics`}
            className={cn(buttonVariants(), "shadow-lg shadow-blue-600/15")}
          >
            {labels.updateInQuestionnaire}
          </Link>
        }
      />

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
        {labels.editUnavailable}
      </div>

      <ContextualHelpCard
        title={labels.contextualHelpTitle}
        text={labels.contextualHelpText}
        className="mb-6"
      />

      <Card className="supplier-surface mb-6 rounded-2xl border-0">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              {logoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreviewUrl}
                  alt={logoAltText || legalName || labels.companyLogo}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageIcon aria-hidden="true" className="size-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">
                {labels.companyLogo}
              </CardTitle>
              <CardDescription className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {labels.logoDescription}
              </CardDescription>
              <p className="mt-2 text-xs font-medium text-slate-500">{labels.logoFormats}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 cursor-pointer rounded-xl bg-white px-4",
                isLogoSaving && "pointer-events-none opacity-60",
              )}
            >
              <Upload data-icon="inline-start" className="size-4" />
              {logoPreviewUrl ? labels.changeLogo : labels.uploadLogo}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={isLogoSaving}
                onChange={handleLogoChange}
              />
            </label>
            {logoPreviewUrl ? (
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl bg-white px-4")}
                disabled={isLogoSaving}
                onClick={handleRemoveLogo}
              >
                <Trash2 data-icon="inline-start" className="size-4" />
                {labels.removeLogo}
              </button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <label className="grid max-w-xl gap-2 text-sm font-semibold text-slate-700">
            {labels.logoAltText}
            <input
              value={logoAltText}
              onChange={(event) => setLogoAltText(event.target.value)}
              placeholder={labels.logoAltTextPlaceholder}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              maxLength={160}
            />
          </label>
          {logoMessage ? (
            <p
              className={cn(
                "mt-3 text-sm font-medium",
                logoMessage.tone === "success" ? "text-emerald-700" : "text-red-700",
              )}
            >
              {logoMessage.text}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {loadFailed ? (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          {labels.loadFailed}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ProfileCard
          title={labels.organizationName}
          value={summary?.organizationName}
          description={labels.workspace}
          fallback={labels.notProvided}
          icon={Building2}
        />
        <ProfileCard
          title={labels.legalName}
          value={legalName}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Building2}
        />
        <ProfileCard
          title={labels.location}
          value={location}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={MapPin}
        />
        <ProfileCard
          title={labels.industry}
          value={summary?.industry}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Globe2}
        />
        <ProfileCard
          title={labels.employeeCount}
          value={summary?.employeeCount}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Users}
        />
        <ProfileCard
          title={labels.website}
          value={summary?.website}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Globe2}
        />
      </section>
    </div>
  );
}

type ProfileCardProps = {
  title: string;
  value?: string | null;
  description: string;
  fallback: string;
  icon: typeof Building2;
};

function ProfileCard({ title, value, description, fallback, icon: Icon }: ProfileCardProps) {
  const displayValue = value?.trim() || fallback;

  return (
    <Card className="supplier-surface rounded-2xl border-0">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-500">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base font-semibold text-slate-800">{displayValue}</p>
      </CardContent>
    </Card>
  );
}
