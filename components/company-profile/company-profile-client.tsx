"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Globe2, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompanyProfileSummary } from "@/lib/company-profile-summary";
import type { CompanyProfileLabels } from "@/lib/operational-labels";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { cn } from "@/lib/utils";

type CompanyProfileClientProps = {
  initialSummary: CompanyProfileSummary | null;
  initialLoadFailed?: boolean;
  labels: CompanyProfileLabels;
  localePrefix: string;
};

export function CompanyProfileClient({
  initialSummary,
  initialLoadFailed = false,
  labels,
  localePrefix,
}: CompanyProfileClientProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [loadFailed, setLoadFailed] = useState(initialLoadFailed);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileSummary() {
      const session = await getFreshBrowserNhostSession();

      if (!session?.accessToken || cancelled) {
        return;
      }

      try {
        const response = await fetch("/api/company-profile/summary", {
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setLoadFailed(true);
          return;
        }

        const payload = (await response.json()) as {
          summary?: CompanyProfileSummary | null;
        };

        setSummary(payload.summary ?? null);
        setLoadFailed(false);
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
        }
      }
    }

    void loadProfileSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const legalName = summary?.legalCompanyName || summary?.organizationName || "";
  const location = summary?.headquarters || [summary?.city, summary?.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        action={
          <Link
            href={`${localePrefix}/dashboard/questionnaire?section=company_basics`}
            className={cn(buttonVariants(), "shadow-lg shadow-blue-600/15")}
          >
            {labels.updateInQuestionnaire}
          </Link>
        }
      />

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
        {labels.editUnavailable}
      </div>

      {loadFailed ? (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          {labels.loadFailed}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ProfileCard
          title={labels.organizationName}
          value={summary?.organizationName}
          description={labels.workspace}
          fallback={labels.notProvided}
          icon={Building2}
        />
        <ProfileCard
          title={labels.legalName}
          value={legalName}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Building2}
        />
        <ProfileCard
          title={labels.location}
          value={location}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={MapPin}
        />
        <ProfileCard
          title={labels.industry}
          value={summary?.industry}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Globe2}
        />
        <ProfileCard
          title={labels.employeeCount}
          value={summary?.employeeCount}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Users}
        />
        <ProfileCard
          title={labels.website}
          value={summary?.website}
          description={labels.supplierProfile}
          fallback={labels.notProvided}
          icon={Globe2}
        />
      </section>
    </div>
  );
}

type ProfileCardProps = {
  title: string;
  value?: string | null;
  description: string;
  fallback: string;
  icon: typeof Building2;
};

function ProfileCard({ title, value, description, fallback, icon: Icon }: ProfileCardProps) {
  const displayValue = value?.trim() || fallback;

  return (
    <Card className="supplier-surface rounded-2xl border-0">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-500">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base font-semibold text-slate-800">{displayValue}</p>
      </CardContent>
    </Card>
  );
}
