import { Bell, Settings, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrimaryOrganizationForUserWithAdmin } from "@/lib/data/organizations";
import { defaultSettingsLabels, type SettingsLabels } from "@/lib/operational-labels";

export const dynamic = "force-dynamic";

type SettingsPageContentProps = {
  labels?: SettingsLabels;
};

export async function SettingsPageContent({ labels = defaultSettingsLabels }: SettingsPageContentProps) {
  const user = await getCurrentUser();
  const organization = user
    ? await getPrimaryOrganizationForUserWithAdmin(user.id).catch(() => null)
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader title={labels.title} subtitle={labels.subtitle} />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SettingsCard
          title={labels.workspaceSettings}
          description={
            organization?.name
              ? `${organization.name}. ${labels.workspaceSettingsDescription}`
              : labels.workspaceSettingsDescription
          }
          helper={labels.workspaceSettingsUnavailable}
          icon={Settings}
        />
        <SettingsCard
          title={labels.teamAccess}
          description={user?.email || labels.teamAccessDescription}
          helper={labels.teamAccessDescription}
          icon={Users}
        />
        <SettingsCard
          title={labels.notifications}
          description={labels.notificationsDescription}
          helper={labels.comingLater}
          icon={Bell}
        />
      </section>
    </div>
  );
}

type SettingsCardProps = {
  title: string;
  description: string;
  helper: string;
  icon: typeof Settings;
};

function SettingsCard({ title, description, helper, icon: Icon }: SettingsCardProps) {
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
          <CardDescription className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          {helper}
        </p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return <SettingsPageContent />;
}
