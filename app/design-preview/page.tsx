"use client";

import {
  ArrowRight,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileText,
  LockKeyhole,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricCard } from "@/components/shared/metric-card";
import { PageShell } from "@/components/shared/page-shell";
import { ProgressRing } from "@/components/shared/progress-ring";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  activityFeed,
  activeShareLinks,
  currentUser,
  evidenceDocuments,
  readinessMetrics,
  readinessTimeline,
} from "@/lib/mock-data";

const palette = [
  { name: "Background", value: "#F8FAFC" },
  { name: "Surface", value: "#FFFFFF" },
  { name: "Border", value: "#E2E8F0" },
  { name: "Primary text", value: "#0F172A" },
  { name: "Secondary", value: "#475569" },
  { name: "Primary blue", value: "#0B5CFF" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Green", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
];

export default function DesignPreviewPage() {
  const primaryShareLink = activeShareLinks[0];

  return (
    <PageShell
      eyebrow="Design system preview"
      title="Premium compliance workspace foundation"
      description="Reusable visual primitives for a secure VSME / ESG passport product: calm enterprise surfaces, sharp data hierarchy, and confident blue-green readiness signals."
    >
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <SectionCard
          title="Brand and palette"
          description="Core brand elements and semantic colors for a high-trust supplier workspace."
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:flex-row sm:items-center">
              <Logo />
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-slate-200">
                  <AvatarImage src={currentUser.avatarUrl} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500">{currentUser.title}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {palette.map((color) => (
                <div
                  key={color.value}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div
                    className="mb-3 h-16 rounded-lg border border-slate-200"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-sm font-semibold text-slate-950">{color.name}</p>
                  <p className="font-mono text-xs text-slate-500">{color.value}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Actions"
          description="Primary actions are blue, secondary controls stay quiet and precise."
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-3">
              <Button className="shadow-lg shadow-blue-600/20">
                <Send data-icon="inline-start" />
                Share passport
              </Button>
              <Button variant="outline">
                <Download data-icon="inline-start" />
                Export
              </Button>
              <Button variant="secondary">
                Review gaps
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
                  <MoreHorizontal />
                  <span className="sr-only">More actions</span>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="completed" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="needs_evidence" />
              <StatusBadge status="reviewed" />
              <Badge className="rounded-full bg-blue-50 text-blue-700" variant="secondary">
                VSME draft
              </Badge>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {readinessMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Readiness overview"
          description="Compact executive summary for supplier teams and buyer-facing reviews."
        >
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <ProgressRing value={78} label="Ready" helper="VSME" />
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Passport status</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    Buyer-ready after 3 gaps
                  </p>
                </div>
                <StatusBadge status="in_progress" />
              </div>
              <Progress value={78} className="h-2" />
              <div className="grid gap-3 sm:grid-cols-3">
                {["Environment", "Social", "Governance"].map((item, index) => (
                  <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {item}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {[82, 74, 91][index]}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Readiness trend"
          description="Recharts installed and themed for calm compliance analytics."
        >
          <div className="w-full overflow-x-auto">
            <AreaChart
              width={620}
              height={260}
              data={readinessTimeline}
              margin={{ left: -24, right: 8, top: 10, bottom: 0 }}
            >
                <defs>
                  <linearGradient id="score" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0B5CFF" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#0B5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <ChartTooltip
                  cursor={{ stroke: "#0B5CFF", strokeOpacity: 0.18 }}
                  contentStyle={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0B5CFF"
                  strokeWidth={3}
                  fill="url(#score)"
                />
            </AreaChart>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Evidence register"
          description="Sample table row treatment for data-room documents and review states."
          action={
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                Actions
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <FileText />
                    Create request
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink />
                    Open audit log
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-950">{document.name}</span>
                        <span className="text-xs text-slate-500">{document.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{document.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={document.status} />
                    </TableCell>
                    <TableCell className="text-slate-600">{document.owner}</TableCell>
                    <TableCell className="text-right text-slate-500">{document.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard
          title="Secure share link"
          description="Buyer-facing passport link card with trust and expiry cues."
        >
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <LockKeyhole aria-hidden="true" className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Buyer access link</p>
                    <p className="text-sm text-slate-500">
                      Expires{" "}
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(primaryShareLink.expiresAt))}
                    </p>
                  </div>
                </div>
                <StatusBadge status="in_progress" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white p-2 shadow-sm">
                <Input
                  readOnly
                  value={primaryShareLink.url.replace("https://", "")}
                  className="border-0 bg-transparent shadow-none"
                />
                <Button size="icon" aria-label="Copy secure link">
                  <Copy />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="controls" className="flex flex-col gap-4">
              <TabsList>
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              <TabsContent value="controls" className="m-0">
                <div className="grid gap-3">
                  <Select defaultValue="buyer">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="buyer">Buyer review access</SelectItem>
                        <SelectItem value="auditor">Auditor evidence access</SelectItem>
                        <SelectItem value="internal">Internal draft access</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <Checkbox defaultChecked />
                    Require email verification before opening
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="review" className="m-0">
                <Textarea
                  defaultValue="Please review Environment and Governance sections before sharing with the buyer."
                  className="min-h-24 resize-none"
                />
              </TabsContent>
            </Tabs>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Workspace activity"
          description="Small status timeline patterns for review progress and buyer updates."
        >
          <div className="flex flex-col gap-4">
            {activityFeed.map((activity) => (
              <div key={activity.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-700">
                  <activity.icon aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{activity.title}</p>
                  <p className="text-sm leading-6 text-slate-500">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Overlay patterns"
          description="Dialog and sheet primitives are installed and styled for future workflows."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Dialog>
              <DialogTrigger render={<Button className="h-24 flex-col gap-2" />}>
                <Sparkles />
                Open approval dialog
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Approve passport section</DialogTitle>
                  <DialogDescription>
                    Confirm that the company profile and attached evidence are ready for buyer review.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  The actual approval flow will be added in later product steps.
                </div>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="h-24 flex-col gap-2" />}>
                <ShieldCheck />
                Open evidence sheet
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Evidence checklist</SheetTitle>
                  <SheetDescription>
                    A future drawer for reviewing required files and disclosure coverage.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-3">
                  {["Company profile", "Energy data", "Policy documents"].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"
                    >
                      <Checkbox defaultChecked={item !== "Policy documents"} />
                      {item}
                    </label>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}
