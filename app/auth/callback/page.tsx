import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Auth Callback | Supplier Passport",
  description: "Complete your Supplier Passport authentication flow.",
};

type AuthCallbackPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
  }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  const hasError = Boolean(params.error);
  const Icon = hasError ? CircleAlert : CheckCircle2;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="supplier-surface w-full max-w-lg rounded-3xl border-0 p-8 text-center shadow-xl shadow-slate-200/70">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
          {hasError ? "Authentication needs attention" : "Authentication flow received"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {hasError
            ? params.error_description ?? "Nhost returned an authentication error."
            : "If Nhost email verification is enabled, this page confirms the redirect target is ready. Continue to the dashboard once your session is active."}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
