import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { defaultOnboardingLabels, type OnboardingLabels } from "@/lib/operational-labels";

export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Create Workspace | Supplier Passport",
  description: "Create your supplier workspace in Supplier Passport.",
};

export function OnboardingPageContent({
  labels = defaultOnboardingLabels,
  localePrefix = "",
}: {
  labels?: OnboardingLabels;
  localePrefix?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href={localePrefix || "/en"}
            className="w-fit"
            aria-label="Supplier Passport dashboard"
          >
            <Logo />
          </Link>
          <Link href={`${localePrefix}/dashboard`} className="text-sm font-semibold text-slate-600 hover:text-blue-700">
            {labels.skipForNow}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:py-14">
        <aside>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            {labels.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {labels.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {labels.subtitle}
          </p>
        </aside>

        <section className="supplier-surface rounded-3xl border-0 p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <OnboardingForm labels={labels} />
        </section>
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  redirect("/en/onboarding");
}
