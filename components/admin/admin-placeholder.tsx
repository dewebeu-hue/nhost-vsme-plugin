import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminPlaceholderProps = {
  title: string;
  subtitle: string;
  workspaceTitle?: string;
  workspaceDescription?: string;
  mockNote?: string;
  note?: string;
  openOrganizationsLabel?: string;
  openOrganizationsHref?: string;
};

export function AdminPlaceholder({
  title,
  subtitle,
  workspaceTitle = `${title} workspace`,
  workspaceDescription = "This admin surface is ready for concierge workflows in a later step.",
  mockNote,
  note = "This admin area is not available yet. Use Organizations for the active concierge workspace.",
  openOrganizationsLabel = "Open organizations",
  openOrganizationsHref = "/en/admin/organizations",
}: AdminPlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{subtitle}</p>
      </div>
      <Card className="supplier-surface rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight text-slate-950">
            {workspaceTitle}
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-500">
            {workspaceDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            {mockNote ?? note}
          </p>
          <Button variant="outline" className="w-fit rounded-xl bg-white">
            <Link href={openOrganizationsHref} className="inline-flex items-center gap-1.5">
              {openOrganizationsLabel}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
