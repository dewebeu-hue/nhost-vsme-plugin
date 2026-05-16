import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { ctaLabels } from "@/lib/copy";
import { cn } from "@/lib/utils";

const navItems = ["Product", "Solutions", "Pricing", "Resources"] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href="/" aria-label="Supplier Passport home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex"
          >
            {ctaLabels.login}
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 px-4 shadow-lg shadow-blue-600/20",
            )}
          >
            {ctaLabels.bookDemo}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </header>
  );
}
