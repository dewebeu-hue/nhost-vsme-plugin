import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "product", href: "#product" },
  { key: "solutions", href: "#solutions" },
  { key: "pricing", href: "/pricing" },
  { key: "resources", href: "#resources" },
] as const;

export function LandingHeader() {
  const locale = useLocale();
  const t = useTranslations("common.navigation");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href={`/${locale}`} aria-label="Supplier Passport home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href.startsWith("/") ? `/${locale}${item.href}` : item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <Link
            href={`/${locale}/login`}
            className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex"
          >
            {t("login")}
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 px-4 shadow-lg shadow-blue-600/20",
            )}
          >
            {t("bookDemo")}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </header>
  );
}
