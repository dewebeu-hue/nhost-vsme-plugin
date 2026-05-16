import {
  ArrowUpRight,
  CalendarDays,
  Download,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { publicSharePassport } from "@/lib/mock-data";

type PublicSharePageProps = {
  passport: typeof publicSharePassport;
};

export function PublicSharePage({ passport }: PublicSharePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Logo />
          <div className="flex flex-wrap items-center gap-2">
            {passport.statusChips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
              >
                {chip}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">Powered by Supplier Passport</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-xl font-semibold tracking-[0.16em] text-white shadow-lg shadow-slate-300">
                  ACME
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
                      Shared Supplier Passport
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-teal-200 bg-teal-50 px-3 py-1 text-teal-700"
                    >
                      <ShieldCheck aria-hidden="true" />
                      Verified supplier
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    {passport.company.name}
                  </h1>
                </div>
              </div>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">{passport.heroText}</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CalendarDays aria-hidden="true" />
                  Last updated: {passport.lastUpdated}
                </div>
                <Button className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700">
                  <Mail data-icon="inline-start" />
                  Request additional information
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                About this passport
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {passport.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-500">{detail.label}</span>
                    <span className="text-right text-sm font-semibold text-slate-950">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <LockKeyhole aria-hidden="true" className="mt-0.5 text-blue-700" />
                <p className="text-sm leading-6 text-slate-600">
                  Access is permissioned and this shared passport is read-only.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <ProgressRing value={passport.readinessScore} label="ready" size={156} />
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <InfoBlock label="Industries" value={passport.company.industries.join(", ")} />
                <InfoBlock label="Countries served" value={passport.company.countriesServed} />
                <InfoBlock label="Employee count" value={passport.company.employeeCount} />
                <InfoBlock label="Headquarters" value={passport.company.headquarters} />
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-3 text-sm font-semibold text-slate-950">Key certifications</p>
              <div className="flex flex-wrap gap-2">
                {passport.company.certifications.map((certification) => (
                  <Badge
                    key={certification}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
                  >
                    {certification}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Company overview
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              A structured VSME / ESG profile prepared by the supplier and shared for buyer review.
            </p>
            <div className="mt-5 rounded-2xl bg-teal-50 p-4 text-sm font-semibold text-teal-800">
              Secure. Structured. Trusted.
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {passport.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70"
            >
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                {section.title}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {section.metricLabel}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                  {section.metricValue}
                </p>
              </div>
              <Button variant="outline" className="mt-5 w-full rounded-xl bg-white">
                {section.actionLabel}
                <ArrowUpRight data-icon="inline-end" />
              </Button>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Approved documents
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Evidence files reviewed and approved for this shared passport.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit rounded-full border-teal-200 bg-teal-50 px-3 py-1 text-teal-700"
            >
              <FileText aria-hidden="true" />
              Approved only
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="pl-6">Document name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>File type</TableHead>
                <TableHead>Date uploaded</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passport.documents.map((document) => (
                <TableRow key={document.id} className="border-slate-100">
                  <TableCell className="min-w-56 py-4 pl-6 font-semibold text-slate-950">
                    {document.name}
                  </TableCell>
                  <TableCell className="text-slate-600">{document.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-full border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {document.fileType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{document.uploaded}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye data-icon="inline-start" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white">
                        <Download data-icon="inline-start" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 lg:px-8">
          <p className="text-base font-semibold text-slate-950">Secure. Structured. Trusted.</p>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            {passport.footerDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
