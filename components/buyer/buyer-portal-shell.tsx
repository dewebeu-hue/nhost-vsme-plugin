import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type BuyerPortalShellProps = {
  children: React.ReactNode;
  locale: string;
};

export function BuyerPortalShell({ children, locale }: BuyerPortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo />
          <nav className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}`}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              Supplier Passport
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              Plans
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
