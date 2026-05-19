"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  forceRefreshBrowserNhostSession,
  getBrowserNhostClient,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import type { DashboardShellLabels } from "@/lib/dashboard-labels";

type DashboardSidebarWorkspaceCardProps = {
  labels: DashboardShellLabels;
};

type OrganizationResponse = {
  configured?: boolean;
  organization?: {
    name: string;
    plan_key?: string;
    is_verified?: boolean;
  } | null;
};

export function DashboardSidebarWorkspaceCard({
  labels,
}: DashboardSidebarWorkspaceCardProps) {
  const [workspaceName, setWorkspaceName] = useState(labels.workspace);
  const [plan, setPlan] = useState(labels.account);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      const nhost = getBrowserNhostClient();
      const session = await getFreshBrowserNhostSession();

      if (!nhost || !session?.accessToken) {
        return;
      }

      let response = await fetchCurrentOrganization(session.accessToken);

      if (response.status === 401) {
        const refreshedSession = await forceRefreshBrowserNhostSession();

        if (refreshedSession?.accessToken) {
          response = await fetchCurrentOrganization(refreshedSession.accessToken);
        }
      }

      if (!response.ok || cancelled) {
        setWorkspaceName(labels.workspace);
        setPlan(labels.account);
        setIsVerified(false);
        return;
      }

      const payload = (await response.json()) as OrganizationResponse;
      const organization = payload.organization;

      if (!organization || cancelled) {
        return;
      }

      setWorkspaceName(organization.name || labels.workspace);
      setPlan(formatPlanLabel(organization.plan_key) || labels.account);
      setIsVerified(Boolean(organization.is_verified));
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [labels]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold leading-5 text-slate-950">
            {workspaceName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {labels.plan}: {plan}
          </p>
        </div>
        {isVerified ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {labels.verified}
          </Badge>
        ) : null}
      </div>
      <p className="text-xs font-medium text-slate-500">
        {labels.workspace}
      </p>
    </section>
  );
}

function fetchCurrentOrganization(accessToken: string) {
  return fetch("/api/organizations/current", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
}

function formatPlanLabel(planKey?: string) {
  if (!planKey) {
    return "";
  }

  return planKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
