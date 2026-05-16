import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

type PageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
};

export function PageShell({ title, description, children, eyebrow }: PageShellProps) {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-8 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <nav className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <Logo />
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
              EU buyer workspace
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
          </nav>
          <div className="flex max-w-4xl flex-col gap-3">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
