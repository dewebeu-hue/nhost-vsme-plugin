import { Filter, Plus, Search, Star } from "lucide-react";
import { AdminStatsWidget } from "@/components/admin/admin-stats-widget";
import { OrganizationDetailPanel } from "@/components/admin/organization-detail-panel";
import { OrganizationsTable } from "@/components/admin/organizations-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminChecklist,
  adminOrganizationRows,
  adminRecentActivityFeed,
  adminStatsWidgets,
  selectedAdminOrganization,
} from "@/lib/mock-data";

export default function AdminOrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Organizations
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Manage and support your client organizations.
          </p>
        </div>
        <Button className="h-11 w-fit rounded-xl bg-blue-600 px-5 hover:bg-blue-700">
          <Plus data-icon="inline-start" />
          Add Organization
        </Button>
      </div>

      <section className="supplier-surface flex flex-col gap-3 rounded-2xl border-0 p-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search organizations, owners, or domains..."
            className="h-11 rounded-xl bg-slate-50 pl-10"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_160px_160px_160px_auto_auto]">
          <Input placeholder="Search organizations..." className="h-11 rounded-xl bg-white" />
          <FilterSelect placeholder="All status" values={["All status", "Verified", "Issues"]} />
          <FilterSelect
            placeholder="All owners"
            values={["All owners", "Anna Müller", "Sarah Johnson", "Michael Chen", "James Wilson"]}
          />
          <FilterSelect
            placeholder="All industries"
            values={["All industries", "Manufacturing", "Technology", "Packaging", "Textiles"]}
          />
          <Button variant="outline" className="h-11 rounded-xl bg-white">
            <Filter data-icon="inline-start" />
            More filters
          </Button>
          <Button variant="outline" className="h-11 rounded-xl bg-white">
            <Star data-icon="inline-start" />
            Saved views
          </Button>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px_310px]">
        <div className="min-w-0">
          <OrganizationsTable
            organizations={adminOrganizationRows}
            selectedOrganizationId={selectedAdminOrganization.id}
          />
        </div>

        <OrganizationDetailPanel
          organization={selectedAdminOrganization}
          checklist={adminChecklist}
        />

        <aside className="flex flex-col gap-6">
          {adminStatsWidgets.map((widget) => (
            <AdminStatsWidget key={widget.title} widget={widget} />
          ))}

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">
              Recent activity
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {adminRecentActivityFeed.map((item) => (
                <div key={`${item.organization}-${item.action}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">{item.organization}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.action}</p>
                </div>
              ))}
            </div>
            <Badge
              variant="outline"
              className="mt-4 rounded-full border-blue-200 bg-blue-50 text-blue-700"
            >
              Live queue preview
            </Badge>
          </section>
        </aside>
      </div>
    </div>
  );
}

function FilterSelect({ placeholder, values }: { placeholder: string; values: string[] }) {
  return (
    <Select defaultValue={values[0]}>
      <SelectTrigger className="h-11 rounded-xl bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
