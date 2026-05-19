"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Copy, ExternalLink, Link2, RefreshCw } from "lucide-react";
import { StateCard } from "@/components/shared/state-card";
import { Button } from "@/components/ui/button";
import { forceRefreshBrowserNhostSession, getFreshBrowserNhostSession } from "@/lib/nhost/client";

export type PassportShareLabels = {
  title: string;
  description: string;
  warning: string;
  copyLink: string;
  linkCopied: string;
  loadError: string;
  generateLink: string;
  generatingLink: string;
  openPublicLink: string;
  noLinkTitle: string;
  noLinkText: string;
  signInRequired: string;
};

export const defaultPassportShareLabels: PassportShareLabels = {
  title: "Supplier Passport sharing",
  description: "Share your Supplier Passport with buyers using this public link.",
  warning: "Anyone with this link can view your public Supplier Passport summary.",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  loadError: "We could not load your share link right now.",
  generateLink: "Generate share link",
  generatingLink: "Generating...",
  openPublicLink: "Open public link",
  noLinkTitle: "No share link yet",
  noLinkText: "Generate a secure public link when you are ready to share your Supplier Passport summary.",
  signInRequired: "Please sign in to manage your Supplier Passport share link.",
};

type ShareLinkPayload = {
  organization?: { id: string; name: string; slug: string } | null;
  shareLink?: { id: string; token: string; is_active: boolean; expires_at: string | null } | null;
  publicUrl?: string | null;
  error?: string;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type PassportShareLinkClientProps = {
  labels?: PassportShareLabels;
};

export function PassportShareLinkClient({
  labels = defaultPassportShareLabels,
}: PassportShareLinkClientProps) {
  const locale = useLocale();
  const [publicUrl, setPublicUrl] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadShareLink() {
      const result = await requestShareLink("GET", locale, labels);

      if (cancelled) {
        return;
      }

      setIsLoading(false);

      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }

      setOrganizationName(result.payload.organization?.name ?? "");
      setPublicUrl(result.payload.publicUrl ?? "");
      setMessage(null);
    }

    void loadShareLink();

    return () => {
      cancelled = true;
    };
  }, [locale, labels]);

  async function handleGenerate() {
    setIsGenerating(true);
    setMessage(null);

    const result = await requestShareLink("POST", locale, labels);

    setIsGenerating(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }

    setOrganizationName(result.payload.organization?.name ?? organizationName);
    setPublicUrl(result.payload.publicUrl ?? "");
    setMessage({ tone: "success", text: labels.linkCopied });
  }

  async function handleCopy() {
    if (!publicUrl) {
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    setMessage({ tone: "success", text: labels.linkCopied });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.description}
          </p>
        </div>
      </div>

      {message ? (
        <StateCard title={message.text} description="" tone={message.tone === "error" ? "warning" : message.tone} />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Link2 aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {organizationName || labels.noLinkTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {publicUrl ? labels.warning : labels.noLinkText}
            </p>
          </div>

          <Button
            className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700"
            disabled={isLoading || isGenerating}
            onClick={handleGenerate}
          >
            <RefreshCw data-icon="inline-start" className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? labels.generatingLink : labels.generateLink}
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              readOnly
              className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              value={isLoading ? "" : publicUrl}
              placeholder={isLoading ? "..." : labels.noLinkTitle}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl bg-white"
                disabled={!publicUrl}
                onClick={handleCopy}
              >
                <Copy data-icon="inline-start" />
                {labels.copyLink}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl bg-white"
                disabled={!publicUrl}
                onClick={() => {
                  if (publicUrl) {
                    window.open(publicUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <ExternalLink data-icon="inline-start" />
                {labels.openPublicLink}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

async function requestShareLink(
  method: "GET" | "POST",
  locale: string,
  labels: PassportShareLabels,
) {
  const session = await getFreshBrowserNhostSession();

  if (!session?.accessToken) {
    return { ok: false as const, error: labels.signInRequired };
  }

  let response = await fetch(`/api/passport/share-link?locale=${encodeURIComponent(locale)}`, {
    method,
    headers: {
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (response.status === 401) {
    const refreshedSession = await forceRefreshBrowserNhostSession();

    if (refreshedSession?.accessToken) {
      response = await fetch(`/api/passport/share-link?locale=${encodeURIComponent(locale)}`, {
        method,
        headers: {
          authorization: `Bearer ${refreshedSession.accessToken}`,
        },
      });
    }
  }

  const payload = (await response.json()) as ShareLinkPayload;

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.error ?? labels.loadError,
    };
  }

  return { ok: true as const, payload };
}
