"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  forceRefreshBrowserNhostSession,
  getBrowserNhostClient,
  getFreshBrowserNhostSession,
  logAuthInfo,
} from "@/lib/nhost/client";
import { fetchCurrentOrganizationCached } from "@/lib/current-organization-client";

type DashboardOrganizationSelectorProps = {
  fallbackName: string;
};

export function DashboardOrganizationSelector({
  fallbackName,
}: DashboardOrganizationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");
  const [organizationName, setOrganizationName] = useState(fallbackName);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      const nhost = getBrowserNhostClient();
      const session = await getFreshBrowserNhostSession();

      if (!nhost || !session?.user?.id) {
        return;
      }

      try {
        const result = await fetchCurrentOrganizationCached(session.accessToken);
        const payload = result.payload;

        if (cancelled || payload.configured === false) {
          return;
        }

        if (result.status === 401) {
          logAuthInfo("current org request unauthorized");
          logAuthInfo("retrying after refresh");

          const refreshedSession = await forceRefreshBrowserNhostSession();

          if (refreshedSession?.accessToken) {
            const retryResult = await fetchCurrentOrganizationCached(refreshedSession.accessToken, true);
            const retryPayload = retryResult.payload;

            if (retryResult.ok && retryPayload.organization?.name) {
              setOrganizationName(retryPayload.organization.name);
              return;
            }

            if (retryResult.status !== 401) {
              setOrganizationName(
                getOrganizationErrorLabel(retryPayload.category, retryResult.status),
              );
              return;
            }
          }

          logAuthInfo("session expired");
          setOrganizationName(t("sessionExpired"));
          router.push(`/${getLocaleFromPath(pathname)}/login`);
          return;
        }

        if (result.status === 404) {
          const locale = getLocaleFromPath(pathname);
          router.push(`/${locale}/onboarding`);
          return;
        }

        if (result.ok && payload.organization?.name) {
          setOrganizationName(payload.organization.name);
          return;
        }

        if (!result.ok) {
          setOrganizationName(getOrganizationErrorLabel(payload.category, result.status));
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Unable to load dashboard organization", error);
        }
        setOrganizationName("Workspace unavailable");
      }
    }

    loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [fallbackName, pathname, router, t]);

  return (
    <button
      aria-label={`Current organization: ${organizationName}`}
      className="hidden min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition-colors hover:bg-slate-50 sm:flex"
    >
      <span className="min-w-0 truncate text-sm font-semibold text-slate-950">
        {organizationName}
      </span>
      <ChevronDown aria-hidden="true" className="shrink-0 text-slate-400" />
    </button>
  );
}

function getOrganizationErrorLabel(category: string | undefined, status: number) {
  if (category === "permission_denied" || status === 403) {
    return "Workspace permission issue";
  }

  if (category === "env_missing" || status === 503) {
    return "Workspace not configured";
  }

  return "Workspace unavailable";
}

function getLocaleFromPath(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];

  return locale === "hr" || locale === "de" || locale === "en" ? locale : "en";
}
