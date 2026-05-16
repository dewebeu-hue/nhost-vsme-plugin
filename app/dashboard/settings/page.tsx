import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { currentUser } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      subtitle="Prepare organization, team, notification, and sharing settings for future app steps."
      primaryAction="Open settings"
      cards={[
        {
          title: "Workspace settings",
          description: "Manage organization preferences and buyer-facing profile defaults.",
          icon: "settings",
          metric: "Starter",
        },
        {
          title: "Team access",
          description: `${currentUser.name} is the mock workspace owner for this phase.`,
          icon: "users",
          metric: "1 user",
        },
        {
          title: "Notifications",
          description: "Future notification preferences will support buyer requests and evidence expiry.",
          icon: "bell-ring",
          metric: "Planned",
        },
      ]}
    />
  );
}
