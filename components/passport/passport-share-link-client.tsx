"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Copy, ExternalLink, Link2, Power, RefreshCw, RotateCcw } from "lucide-react";
import { StateCard } from "@/components/shared/state-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { forceRefreshBrowserNhostSession, getFreshBrowserNhostSession } from "@/lib/nhost/client";

export type PassportShareLabels = {
  title: string;
  description: string;
  warning: string;
  privateFilesWarning: string;
  publicPdfWarning: string;
  copyLink: string;
  linkCopied: string;
  copyError: string;
  loadError: string;
  generateLink: string;
  generatingLink: string;
  linkCreated: string;
  openPublicLink: string;
  linkStatus: string;
  activeLink: string;
  inactiveLink: string;
  createdAt: string;
  expiresAt: string;
  noExpiry: string;
  deactivateLink: string;
  deactivateConfirm: string;
  deactivatingLink: string;
  linkDeactivated: string;
  regenerateLink: string;
  regenerateConfirm: string;
  regeneratingLink: string;
  linkRegenerated: string;
  noLinkTitle: string;
  noLinkText: string;
  signInRequired: string;
};

export const defaultPassportShareLabels: PassportShareLabels = {
  title: "Supplier Passport sharing",
  description: "Share your public Supplier Passport with buyers.",
  warning: "Anyone with this link can view your public Supplier Passport summary.",
  privateFilesWarning: "Private evidence files are not publicly downloadable from this page.",
  publicPdfWarning: "Buyers can also download a buyer-safe public PDF summary from the public Passport page.",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  copyError: "We could not copy the link.",
  loadError: "We could not load your share link right now.",
  generateLink: "Generate share link",
  generatingLink: "Generating...",
  linkCreated: "Share link ready",
  openPublicLink: "Open public link",
  linkStatus: "Link status",
  activeLink: "Active link",
  inactiveLink: "Inactive link",
  createdAt: "Created",
  expiresAt: "Expires",
  noExpiry: "No expiry",
  deactivateLink: "Deactivate link",
  deactivateConfirm: "This will make the current public link unavailable.",
  deactivatingLink: "Deactivating...",
  linkDeactivated: "Link deactivated",
  regenerateLink: "Regenerate link",
  regenerateConfirm: "Regenerating creates a new public link and disables the old one.",
  regeneratingLink: "Regenerating...",
  linkRegenerated: "Link regenerated",
  noLinkTitle: "No share link yet",
  noLinkText: "Generate a secure public link when you are ready to share your Supplier Passport summary.",
  signInRequired: "Please sign in to manage your Supplier Passport share link.",
};

type ShareLinkPayload = {
  organization?: { id: string; name: string; slug: string } | null;
  shareLink?: {
    id: string;
    token: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  } | null;
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
  const [shareLink, setShareLink] = useState<ShareLinkPayload["shareLink"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<"create" | "deactivate" | "regenerate" | null>(null);
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
      setShareLink(result.payload.shareLink ?? null);
      setPublicUrl(result.payload.publicUrl ?? "");
      setMessage(null);
    }

    void loadShareLink();

    return () => {
      cancelled = true;
    };
  }, [locale, labels]);

  async function handleGenerate(action: "create" | "deactivate" | "regenerate" = "create") {
    if (action === "deactivate" && !window.confirm(labels.deactivateConfirm)) {
      return;
    }

    if (action === "regenerate" && !window.confirm(labels.regenerateConfirm)) {
      return;
    }

    setPendingAction(action);
    setMessage(null);

    const result = await requestShareLink("POST", locale, labels, action);

    setPendingAction(null);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }

    setOrganizationName(result.payload.organization?.name ?? organizationName);
    setShareLink(result.payload.shareLink ?? null);
    setPublicUrl(result.payload.publicUrl ?? "");
    setMessage({
      tone: "success",
      text:
        action === "deactivate"
          ? labels.linkDeactivated
          : action === "regenerate"
            ? labels.linkRegenerated
            : labels.linkCreated,
    });
  }

  async function handleCopy() {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage({ tone: "success", text: labels.linkCopied });
    } catch {
      setMessage({ tone: "error", text: labels.copyError });
    }
  }

  const isBusy = isLoading || pendingAction !== null;
  const expiryLabel = shareLink?.expires_at ? formatDate(shareLink.expires_at, locale) : labels.noExpiry;

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
            {publicUrl ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {labels.privateFilesWarning}
              </p>
            ) : null}
            {publicUrl ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {labels.publicPdfWarning}
              </p>
            ) : null}
          </div>

          {!publicUrl ? (
            <Button
              className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700"
              disabled={isBusy}
              onClick={() => handleGenerate("create")}
            >
              <RefreshCw data-icon="inline-start" className={pendingAction === "create" ? "animate-spin" : ""} />
              {pendingAction === "create" ? labels.generatingLink : labels.generateLink}
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <InfoPill label={labels.linkStatus} value={shareLink?.is_active ? labels.activeLink : labels.inactiveLink}>
            <Badge
              variant="outline"
              className={
                shareLink?.is_active
                  ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "rounded-full border-slate-200 bg-slate-50 text-slate-600"
              }
            >
              {shareLink?.is_active ? labels.activeLink : labels.inactiveLink}
            </Badge>
          </InfoPill>
          <InfoPill
            label={labels.createdAt}
            value={shareLink?.created_at ? formatDate(shareLink.created_at, locale) : "-"}
          />
          <InfoPill label={labels.expiresAt} value={expiryLabel} />
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
                disabled={!publicUrl || isBusy}
                onClick={handleCopy}
              >
                <Copy data-icon="inline-start" />
                {labels.copyLink}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl bg-white"
                disabled={!publicUrl || isBusy}
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

        {publicUrl ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-white"
              disabled={isBusy}
              onClick={() => handleGenerate("regenerate")}
            >
              <RotateCcw
                data-icon="inline-start"
                className={pendingAction === "regenerate" ? "animate-spin" : ""}
              />
              {pendingAction === "regenerate" ? labels.regeneratingLink : labels.regenerateLink}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50"
              disabled={isBusy}
              onClick={() => handleGenerate("deactivate")}
            >
              <Power
                data-icon="inline-start"
                className={pendingAction === "deactivate" ? "animate-pulse" : ""}
              />
              {pendingAction === "deactivate" ? labels.deactivatingLink : labels.deactivateLink}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function InfoPill({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-slate-900">
        {children ?? value}
      </div>
    </div>
  );
}

async function requestShareLink(
  method: "GET" | "POST",
  locale: string,
  labels: PassportShareLabels,
  action?: "create" | "deactivate" | "regenerate",
) {
  const session = await getFreshBrowserNhostSession();

  if (!session?.accessToken) {
    return { ok: false as const, error: labels.signInRequired };
  }

  let response = await fetch(`/api/passport/share-link?locale=${encodeURIComponent(locale)}`, {
    method,
    headers: {
      ...(method === "POST" ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${session.accessToken}`,
    },
    body: method === "POST" ? JSON.stringify({ action: action ?? "create" }) : undefined,
  });

  if (response.status === 401) {
    const refreshedSession = await forceRefreshBrowserNhostSession();

    if (refreshedSession?.accessToken) {
      response = await fetch(`/api/passport/share-link?locale=${encodeURIComponent(locale)}`, {
        method,
        headers: {
          ...(method === "POST" ? { "content-type": "application/json" } : {}),
          authorization: `Bearer ${refreshedSession.accessToken}`,
        },
        body: method === "POST" ? JSON.stringify({ action: action ?? "create" }) : undefined,
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

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
