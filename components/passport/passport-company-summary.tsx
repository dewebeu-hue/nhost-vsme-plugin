import { BadgeCheck, Building2, Factory, Globe2, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import type { PassportCompanyProfile } from "@/lib/mock-data";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

type PassportCompanySummaryProps = {
  profile: PassportCompanyProfile;
  labels?: PassportLabels;
};

export function PassportCompanySummary({
  profile,
  labels = defaultPassportLabels,
}: PassportCompanySummaryProps) {
  const facts = [
    {
      label: labels.industries,
      value: profile.industries.length ? profile.industries.join(", ") : labels.notProvided,
      icon: Factory,
    },
    { label: labels.countriesServed, value: profile.countriesServed, icon: Globe2 },
    { label: labels.employeeCount, value: profile.employeeCount, icon: Users },
    { label: labels.headquarters, value: profile.headquarters, icon: MapPin },
  ];

  return (
    <SectionCard
      title={labels.companySummary}
      description={labels.companySummaryDescription}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={profile.logoAltText || profile.name}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2 aria-hidden="true" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {profile.name}
                </h2>
                {profile.verified ? (
                  <Badge className="rounded-full border-teal-200 bg-teal-50 text-teal-700">
                    <BadgeCheck aria-hidden="true" />
                    {labels.verified}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {labels.supplierIdentity}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {facts.map((fact) => {
            const Icon = fact.icon;

            return (
              <div
                key={fact.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Icon aria-hidden="true" />
                  {fact.label}
                </div>
                <p className="text-base font-semibold text-slate-950">{fact.value}</p>
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-950">{labels.keyCertifications}</p>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.length ? (
              profile.certifications.map((certification) => (
                <Badge
                  key={certification}
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700"
                >
                  {certification}
                </Badge>
              ))
            ) : (
              <p className="text-sm font-medium text-slate-500">{labels.noCertifications}</p>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
