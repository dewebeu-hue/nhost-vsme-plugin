import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminOrganizationRow } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type OrganizationsTableProps = {
  organizations: AdminOrganizationRow[];
  selectedOrganizationId: string;
};

export function OrganizationsTable({
  organizations,
  selectedOrganizationId,
}: OrganizationsTableProps) {
  return (
    <section className="supplier-surface overflow-hidden rounded-2xl border-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="pl-5">Company</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Evidence Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization) => {
            const selected = organization.id === selectedOrganizationId;
            const hasIssues = organization.evidenceStatus !== "All good";

            return (
              <TableRow
                key={organization.id}
                data-state={selected ? "selected" : undefined}
                className={cn("border-slate-100", selected && "bg-blue-50/70")}
              >
                <TableCell className="min-w-64 py-4 pl-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-950">{organization.company}</p>
                      {organization.verified ? (
                        <Badge
                          variant="outline"
                          className="rounded-full border-teal-200 bg-teal-50 text-teal-700"
                        >
                          Verified
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {organization.domain}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="min-w-40">
                  <div className="flex items-center gap-3">
                    <Progress value={organization.completion} className="h-2 w-24 bg-slate-100" />
                    <span className="text-sm font-semibold text-slate-950">
                      {organization.completion}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit rounded-full px-2.5 py-1 font-medium",
                        hasIssues
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-teal-200 bg-teal-50 text-teal-700",
                      )}
                    >
                      {organization.evidenceStatus}
                    </Badge>
                    <span className="text-xs font-medium text-slate-500">
                      {organization.documentCount} docs
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-600">{organization.owner}</TableCell>
                <TableCell className="text-slate-600">{organization.lastUpdated}</TableCell>
                <TableCell className="pr-5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${organization.company}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
