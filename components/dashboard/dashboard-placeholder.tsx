import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  Bell,
  BellRing,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileCheck2,
  FileText,
  FileWarning,
  Globe2,
  History,
  Link2,
  ListChecks,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Target,
  Timer,
  TimerReset,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";

type PlaceholderCard = {
  title: string;
  description: string;
  icon: IconKey;
  metric?: string;
  progress?: number;
};

type DashboardPlaceholderProps = {
  title: string;
  subtitle: string;
  cards: PlaceholderCard[];
  primaryAction?: string;
};

type IconKey =
  | "activity"
  | "alert"
  | "archive"
  | "bell"
  | "bell-ring"
  | "building"
  | "clipboard-check"
  | "clipboard-list"
  | "eye"
  | "file-check"
  | "file-text"
  | "file-warning"
  | "globe"
  | "history"
  | "link"
  | "list-checks"
  | "lock"
  | "settings"
  | "shield"
  | "target"
  | "timer"
  | "timer-reset"
  | "users";

const iconMap: Record<IconKey, LucideIcon> = {
  activity: Activity,
  alert: AlertTriangle,
  archive: Archive,
  bell: Bell,
  "bell-ring": BellRing,
  building: Building2,
  "clipboard-check": ClipboardCheck,
  "clipboard-list": ClipboardList,
  eye: Eye,
  "file-check": FileCheck2,
  "file-text": FileText,
  "file-warning": FileWarning,
  globe: Globe2,
  history: History,
  link: Link2,
  "list-checks": ListChecks,
  lock: LockKeyhole,
  settings: Settings,
  shield: ShieldCheck,
  target: Target,
  timer: Timer,
  "timer-reset": TimerReset,
  users: Users,
};

export function DashboardPlaceholder({
  title,
  subtitle,
  cards,
  primaryAction,
}: DashboardPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={primaryAction ? (
          <Button className="shadow-lg shadow-blue-600/15">
            {primaryAction}
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : undefined}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <DashboardPlaceholderCard key={card.title} card={card} />
        ))}
      </section>
    </div>
  );
}

function DashboardPlaceholderCard({ card }: { card: PlaceholderCard }) {
  const Icon = iconMap[card.icon];

  return (
    <Card className="supplier-surface rounded-2xl border-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">
                  {card.title}
                </CardTitle>
              </div>
              {card.metric ? (
                <Badge className="rounded-full bg-teal-50 text-teal-700" variant="secondary">
                  {card.metric}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-6 text-slate-600">
                {card.description}
              </CardDescription>
              {typeof card.progress === "number" ? (
                <div className="mt-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-950">{card.progress}%</span>
                  </div>
                  <Progress value={card.progress} className="h-2" />
                </div>
              ) : null}
            </CardContent>
          </Card>
  );
}
