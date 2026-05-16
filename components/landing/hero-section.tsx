import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductPreview } from "@/components/landing/product-preview";
import { landingPageCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      id="product"
      className="relative overflow-hidden px-6 py-16 sm:py-20 lg:px-8 lg:py-20"
    >
      <div className="absolute inset-0 supplier-subtle-grid opacity-45" />
      <div className="absolute left-1/2 top-0 h-[540px] w-[760px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col items-start gap-8">
          <Badge
            variant="outline"
            className="rounded-full border-blue-200 bg-white px-4 py-2 text-blue-700 shadow-sm"
          >
            <ShieldCheck aria-hidden="true" className="size-4" />
            EU-aligned supplier evidence workspace
          </Badge>

          <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {landingPageCopy.heroTitlePrefix}{" "}
              <span className="text-teal-500">{landingPageCopy.heroTitleEmphasis}</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
              {landingPageCopy.heroDescription}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-5 shadow-xl shadow-blue-600/20",
              )}
            >
              {landingPageCopy.primaryCta}
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/share/acme-manufacturing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-5")}
            >
              {landingPageCopy.secondaryCta}
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {landingPageCopy.trustChips.map((chip) => (
              <div
                key={chip}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
              >
                <CheckCircle2 aria-hidden="true" className="size-4 text-teal-500" />
                {chip}
              </div>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}
