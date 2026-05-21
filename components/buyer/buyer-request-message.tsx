"use client";

import { useState } from "react";
import { ClipboardCopy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BuyerRequestEvidencePanelProps = {
  supplierName: string;
  token: string;
  compact?: boolean;
};

export function BuyerRequestEvidencePanel({
  supplierName,
  token,
  compact = false,
}: BuyerRequestEvidencePanelProps) {
  const locale = useLocale();
  const t = useTranslations("buyerPortal");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const link = `${window.location.origin}/${locale}/passport/${encodeURIComponent(token)}`;
    const message = t("requestEvidenceMessage", { supplierName, link });

    try {
      await window.navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={cn("rounded-3xl border border-blue-100 bg-blue-50 text-blue-950", compact ? "p-4" : "p-6")}>
      <div className={compact ? "grid gap-3" : "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"}>
        <div>
          <h2 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-2xl")}>
            {t("requestEvidenceTitle")}
          </h2>
          <p className="mt-2 text-sm leading-7 text-blue-900">
            {t("requestEvidenceDescription")}
          </p>
          <p className="mt-2 text-xs leading-6 text-blue-800">
            {t("requestEvidenceChannel")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0 rounded-xl border-blue-200 bg-white text-blue-900 hover:bg-blue-100")}
        >
          <ClipboardCopy aria-hidden="true" />
          {copied ? t("requestMessageCopied") : t("copyRequestMessage")}
        </button>
      </div>
    </section>
  );
}
