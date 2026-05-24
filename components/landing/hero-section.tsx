import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductPreview } from "@/components/landing/product-preview";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SegmentedTypingHeadline } from "@/components/landing/segmented-typing-headline";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations("landing.hero");
  const common = useTranslations("common.cta");
  const trustChips = t.raw("trustChips") as string[];
  const titlePrefix = t("titlePrefix");
  const titleEmphasis = t("titleEmphasis");
  const headlineSegments = createHeadlineSegments(titlePrefix, titleEmphasis);

  return (
    <section
      id="product"
      className="relative overflow-hidden px-6 py-16 sm:py-20 lg:px-8 lg:py-20"
    >
      <div className="absolute inset-0 supplier-subtle-grid opacity-45" />
      <div className="absolute left-1/2 top-0 h-[540px] w-[760px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute right-[-8rem] top-24 hidden h-[520px] w-[520px] rounded-full bg-teal-200/30 blur-3xl lg:block" />
      <div className="absolute right-[10%] top-28 hidden h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-3xl lg:block" />

      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col items-start gap-8">
          <ScrollReveal delay={60}>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-white px-4 py-2 text-blue-700 shadow-sm"
            >
              <ShieldCheck aria-hidden="true" className="size-4" />
              {t("badge")}
            </Badge>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <div className="flex max-w-3xl flex-col gap-6">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                <SegmentedTypingHeadline segments={headlineSegments} />
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
                {t("description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={`/${locale}/signup`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "landing-premium-cta h-12 px-5",
                )}
              >
                {common("startPassport")}
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href={`/${locale}/request-demo`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 border-slate-200 bg-white/90 px-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md focus-visible:ring-3 focus-visible:ring-blue-600/20",
                )}
              >
                {common("requestDemo")}
              </Link>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap gap-3">
            {trustChips.map((chip, index) => (
              <ScrollReveal key={chip} delay={300 + index * 90}>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm shadow-slate-950/5 backdrop-blur transition-colors hover:border-blue-200 hover:text-slate-800">
                  <CheckCircle2 aria-hidden="true" className="size-4 text-teal-500" />
                  {chip}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={220} direction="right">
          <ProductPreview />
        </ScrollReveal>
      </div>
    </section>
  );
}

function createHeadlineSegments(titlePrefix: string, titleEmphasis: string) {
  const brandName = "Supplier Passport";

  if (!titleEmphasis.includes(brandName)) {
    return [
      { text: `${titlePrefix} `, className: "text-slate-950" },
      { text: titleEmphasis, className: "text-teal-500" },
    ];
  }

  const brandStart = titleEmphasis.indexOf(brandName);
  const beforeBrand = titleEmphasis.slice(0, brandStart);
  const afterBrand = titleEmphasis.slice(brandStart + brandName.length);

  return [
    { text: `${titlePrefix} ${beforeBrand}`, className: "text-slate-950" },
    { text: brandName, className: "text-teal-500" },
    { text: afterBrand, className: "text-slate-950" },
  ];
}
