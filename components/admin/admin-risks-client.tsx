"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import type { AdminRiskItem, AdminRiskSeverity, AdminRisksPayload } from "@/lib/admin-workspace";
import { cn } from "@/lib/utils";

type RisksPayload = { ok?: boolean; error?: string } & Partial<AdminRisksPayload>;

export function AdminRisksClient({ labels = defaultAdminLabels }: { labels?: AdminLabels }) {
  const locale = useLocale();
  const [payload, setPayload] = useState<AdminRisksPayload | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  async function loadRisks() {
    setStatus("loading");
    setMessage(null);

    const response = await fetchWithAuth("/api/admin/risks");

    if (response.status === 401 || response.status === 403) {
      setStatus("unauthorized");
      setMessage(labels.unauthorizedDescription);
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(labels.loadError);
      return;
    }

    const data = (await response.json()) as RisksPayload;
    setPayload({
      totals: data.totals ?? emptyTotals,
      risks: data.risks ?? [],
    });
    setStatus("ready");
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRisks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRisks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!payload) {
      return [];
    }

    return normalized
      ? payload.risks.filter((risk) => risk.organizationName.toLowerCase().includes(normalized))
      : payload.risks;
  }, [payload, query]);

  if (status === "unauthorized") {
    return <AdminStateCard title={labels.unauthorizedTitle} description={message ?? labels.unauthorizedDescription} />;
  }

  if (status === "error") {
    return (
      <AdminStateCard title={labels.loadError} description={message ?? labels.loadError}>
        <Button type="button" onClick={loadRisks} variant="outline" className="mt-4">
          <RefreshCw data-icon="inline-start" />
          {labels.retry}
        </Button>
      </AdminStateCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {labels.riskDashboard}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            {labels.riskDashboardSubtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/organizations`}
          prefetch
          className={cn(buttonVariants({ variant: "outline" }), "admin-secondary-action h-11 w-fit rounded-xl bg-white")}
        >
          {labels.viewOrganizations}
        </Link>
      </div>

      {status === "loading" || !payload ? (
        <AdminStateCard title={labels.loading} description={labels.loading} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RiskMetric label={labels.totalOrganizations} value={payload.totals.totalOrganizations} />
            <RiskMetric label={labels.lowReadiness} value={payload.totals.lowReadinessOrganizations} />
            <RiskMetric label={labels.expiredCertificates} value={payload.totals.expiredCertificates} />
            <RiskMetric label={labels.overdueBuyerRequests} value={payload.totals.overdueBuyerRequests} />
            <RiskMetric label={labels.noDocuments} value={payload.totals.noDocumentsOrganizations} />
            <RiskMetric label={labels.noLinkedEvidence} value={payload.totals.noLinkedEvidenceOrganizations} />
            <RiskMetric label={labels.expiring30} value={payload.totals.expiringWithin30Days} />
            <RiskMetric label={labels.noActivePublicLinks} value={payload.totals.noActiveShareLinkOrganizations} />
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-4">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.searchOrganizations}
                className="h-11 rounded-xl bg-slate-50 pl-10"
              />
            </div>
          </section>

          <section className="supplier-surface overflow-hidden rounded-2xl border-0">
            <div className="grid divide-y divide-slate-100">
              {filteredRisks.map((risk) => (
                <article
                  key={risk.id}
                  className="grid gap-4 p-5 xl:grid-cols-[minmax(220px,1fr)_190px_140px_100px_auto] xl:items-center"
                >
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{risk.organizationName}</h2>
                    <p className="mt-1 text-sm text-slate-500">{formatRiskType(risk.riskType, labels)}</p>
                  </div>
                  <SeverityBadge severity={risk.severity} labels={labels} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {labels.riskType}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{formatRiskType(risk.riskType, labels)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Count</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{risk.count}</p>
                  </div>
                  <Link
                    href={`/${locale}/admin/organizations/${risk.organizationId}`}
                    prefetch={false}
                    className={cn(buttonVariants({ variant: "outline" }), "admin-secondary-action w-fit rounded-xl bg-white")}
                  >
                    {labels.openDetail}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const emptyTotals: AdminRisksPayload["totals"] = {
  totalOrganizations: 0,
  lowReadinessOrganizations: 0,
  noDocumentsOrganizations: 0,
  noLinkedEvidenceOrganizations: 0,
  expiredCertificates: 0,
  expiringWithin30Days: 0,
  expiringWithin90Days: 0,
  overdueBuyerRequests: 0,
  noActiveShareLinkOrganizations: 0,
};

function RiskMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="supplier-surface rounded-2xl border-0 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SeverityBadge({ severity, labels }: { severity: AdminRiskSeverity; labels: AdminLabels }) {
  const className = {
    critical: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  }[severity];

  return (
    <Badge variant="outline" className={`w-fit rounded-full ${className}`}>
      {severity === "critical" ? labels.critical : severity === "warning" ? labels.warning : labels.info}
    </Badge>
  );
}

function formatRiskType(type: AdminRiskItem["riskType"], labels: AdminLabels) {
  const map: Record<AdminRiskItem["riskType"], string> = {
    certificate_expired: labels.expiredCertificates,
    certificate_expiring: labels.certificateRisks,
    overdue_buyer_request: labels.overdueRequests,
    missing_evidence: labels.missingEvidence,
    low_readiness: labels.lowReadiness,
    no_active_share_link: labels.noActivePublicLinks,
    no_documents: labels.noDocuments,
    no_linked_evidence: labels.noLinkedEvidence,
  };

  return map[type];
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
