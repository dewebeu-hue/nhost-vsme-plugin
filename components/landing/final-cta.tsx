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
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-blue-600 to-teal-500 p-8 text-white shadow-[0_30px_80px_rgba(11,92,255,0.22)] sm:p-10 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={`/${locale}/signup`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-12 bg-white px-5 text-blue-700 hover:bg-white/90",
            )}
          >
            {cta("startPassport")}
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link
            href={`/${locale}/login`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 border-white/40 bg-white/10 px-5 text-white hover:bg-white/15 hover:text-white",
            )}
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
