import { redirect } from "next/navigation";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { currentUser } from "@/lib/mock-data";
import { defaultSettingsLabels, interpolate, type SettingsLabels } from "@/lib/operational-labels";

export const dynamic = "force-dynamic";


export function SettingsPageContent({
  labels = defaultSettingsLabels,
}: {
  labels?: SettingsLabels;
}) {
  return (
    <DashboardPlaceholder
      title={labels.title}
      subtitle={labels.subtitle}
      primaryAction={labels.openSettings}
      cards={[
        {
          title: labels.workspaceSettings,
          description: labels.workspaceSettingsDescription,
          icon: "settings",
          metric: labels.starter,
        },
        {
          title: labels.teamAccess,
          description: interpolate(labels.teamAccessDescription, { name: currentUser.name }),
          icon: "users",
          metric: labels.oneUser,
        },
        {
          title: labels.notifications,
          description: labels.notificationsDescription,
          icon: "bell-ring",
          metric: labels.planned,
        },
      ]}
    />
  );
}

export default function SettingsPage() {
  redirect("/en/dashboard/settings");
}
