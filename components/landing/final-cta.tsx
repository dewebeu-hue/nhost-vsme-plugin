import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  const locale = useLocale();
  const t = useTranslations("landing.finalCta");
  const cta = useTranslations("common.cta");

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#155EEF] via-blue-600 to-teal-500 p-8 text-white shadow-[0_30px_80px_rgba(11,92,255,0.22)] sm:p-10 lg:flex-row lg:items-center">
        <div className="pointer-events-none absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={`/${locale}/signup`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "relative h-12 bg-white px-5 text-blue-700 shadow-lg shadow-blue-950/10 transition-transform hover:-translate-y-0.5 hover:bg-white/90 motion-reduce:hover:translate-y-0",
            )}
          >
            {cta("startPassport")}
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link
            href={`/${locale}/request-demo`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "relative h-12 border-white/40 bg-white/10 px-5 text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white/15 hover:text-white motion-reduce:hover:translate-y-0",
            )}
          >
            {cta("requestDemo")}
          </Link>
        </div>
      </div>
    </section>
  );
}
