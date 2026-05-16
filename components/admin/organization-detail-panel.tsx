import { BadgeCheck } from "lucide-react";
import { AdminChecklist } from "@/components/admin/admin-checklist";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressRing } from "@/components/shared/progress-ring";
import type { AdminChecklistItem, selectedAdminOrganization } from "@/lib/mock-data";

type OrganizationDetailPanelProps = {
  organization: typeof selectedAdminOrganization;
  checklist: AdminChecklistItem[];
};

export function OrganizationDetailPanel({
  organization,
  checklist,
}: OrganizationDetailPanelProps) {
  return (
    <aside className="supplier-surface rounded-2xl border-0 p-5 xl:sticky xl:top-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {organization.company}
          </h2>
          {organization.verified ? (
            <Badge
              variant="outline"
              className="rounded-full border-teal-200 bg-teal-50 text-teal-700"
            >
              <BadgeCheck aria-hidden="true" />
              Verified
            </Badge>
          ) : null}
        </div>
        <p className="text-sm font-medium text-slate-500">{organization.domain}</p>
        <p className="text-sm text-slate-500">Client since {organization.clientSince}</p>
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-5 sm:grid-cols-[128px_minmax(0,1fr)] sm:items-center">
              <ProgressRing value={organization.completion} label="complete" size={128} stroke={10} />
              <div className="flex flex-col gap-3">
                {organization.modules.map((module) => (
                  <div key={module.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">{module.label}</span>
                      <span className="text-sm font-semibold text-slate-950">{module.value}%</span>
                    </div>
                    <Progress value={module.value} className="h-2 bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-5">
          <PlaceholderTab text="Recent client activity will appear here once connected." />
        </TabsContent>
        <TabsContent value="documents" className="mt-5">
          <PlaceholderTab text="Document review history and validation notes will appear here." />
        </TabsContent>
        <TabsContent value="reviews" className="mt-5">
          <PlaceholderTab text="Open review assignments and concierge decisions will appear here." />
        </TabsContent>
      </Tabs>

      <section className="mt-6">
        <h3 className="text-base font-semibold tracking-tight text-slate-950">Internal notes</h3>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">{organization.note.author}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            &ldquo;{organization.note.text}&rdquo;
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="mb-3 text-base font-semibold tracking-tight text-slate-950">Checklist</h3>
        <AdminChecklist items={checklist} />
      </section>

      <section className="mt-6">
        <h3 className="mb-3 text-base font-semibold tracking-tight text-slate-950">
          Quick actions
        </h3>
        <AdminQuickActions />
      </section>
    </aside>
  );
}

function PlaceholderTab({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600">
      {text}
    </div>
  );
}
