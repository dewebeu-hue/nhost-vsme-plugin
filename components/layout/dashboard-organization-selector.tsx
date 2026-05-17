"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getBrowserNhostClient } from "@/lib/nhost/client";

type DashboardOrganizationSelectorProps = {
  fallbackName: string;
};

type OrganizationResponse = {
  configured?: boolean;
  organization?: {
    id: string;
    name: string;
    slug: string;
    is_verified: boolean;
  } | null;
  error?: string;
};

export function DashboardOrganizationSelector({
  fallbackName,
}: DashboardOrganizationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [organizationName, setOrganizationName] = useState(fallbackName);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      const nhost = getBrowserNhostClient();
      const session = nhost?.getUserSession();

      if (!nhost || !session?.user?.id) {
        return;
      }

      try {
        const response = await fetch("/api/organizations/current", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({}),
        });

        const payload = (await response.json()) as OrganizationResponse;

        if (cancelled || payload.configured === false) {
          return;
        }

        if (response.status === 404) {
          const locale = getLocaleFromPath(pathname);
          router.push(`/${locale}/onboarding`);
          return;
        }

        if (response.ok && payload.organization?.name) {
          setOrganizationName(payload.organization.name);
        }
      } catch (error) {
        console.error("Unable to load dashboard organization", error);
      }
    }

    loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [fallbackName, pathname, router]);

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

function getLocaleFromPath(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];

  return locale === "hr" || locale === "de" || locale === "en" ? locale : "en";
}
