"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type PublicPdfDownloadButtonProps = {
  locale: string;
  token: string;
};

export function PublicPdfDownloadButton({ locale, token }: PublicPdfDownloadButtonProps) {
  const t = useTranslations("share");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/passport/public/pdf?locale=${encodeURIComponent(locale)}&token=${encodeURIComponent(token)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("public_pdf_failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getFilename(response.headers.get("content-disposition"));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("publicPdfError"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
        disabled={isGenerating}
        type="button"
        onClick={handleDownload}
      >
        <Download data-icon="inline-start" />
        {isGenerating ? t("publicPdfGenerating") : t("downloadPublicPdf")}
      </Button>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function getFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="([^"]+)"/);

  return match?.[1] ?? "supplier-passport-public.pdf";
}
