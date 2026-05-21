"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import { cn } from "@/lib/utils";

export function AdminHomeClient({ labels = defaultAdminLabels }: { labels?: AdminLabels }) {
  const locale = useLocale();
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");

  async function checkAccess() {
    setStatus("loading");
    const response = await fetchWithAuth("/api/admin/organizations");

    if (response.status === 401 || response.status === 403) {
      setStatus("unauthorized");
      return;
    }

    setStatus(response.ok ? "ready" : "error");
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkAccess();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (status === "unauthorized") {
    return <AdminStateCard title={labels.unauthorizedTitle} description={labels.unauthorizedDescription} />;
  }

  if (status === "error") {
    return (
      <AdminStateCard title={labels.loadError} description={labels.loadError}>
        <Button type="button" onClick={checkAccess} variant="outline" className="mt-4">
          <RefreshCw data-icon="inline-start" />
          {labels.retry}
        </Button>
      </AdminStateCard>
    );
  }

  if (status === "loading") {
    return <AdminStateCard title={labels.loading} description={labels.loading} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {labels.adminWorkspace}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          {labels.riskDashboardSubtitle}
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <AdminHomeCard
          title={labels.organizations}
          description={labels.subtitle}
          href={`/${locale}/admin/organizations`}
          action={labels.viewOrganizations}
        />
        <AdminHomeCard
          title={labels.riskDashboard}
          description={labels.riskDashboardSubtitle}
          href={`/${locale}/admin/risks`}
          action={labels.viewRisks}
        />
      </section>
    </div>
  );
}

function AdminHomeCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article className="supplier-surface rounded-2xl border-0 p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <Link
        href={href}
        className={cn(buttonVariants({ variant: "outline" }), "admin-secondary-action mt-5 w-fit rounded-xl bg-white")}
      >
        {action}
      </Link>
    </article>
  );
}

function AdminStateCard({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="supplier-surface rounded-2xl border-0 p-6">
      <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {children}
    </section>
  );
}

async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  let session = await getFreshBrowserNhostSession();
  let response = await fetchWithSession(input, init, session?.accessToken ?? null);

  if (response.status === 401) {
    session = await forceRefreshBrowserNhostSession();
    response = await fetchWithSession(input, init, session?.accessToken ?? null);
  }

  return response;
}

async function fetchWithSession(input: RequestInfo | URL, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
