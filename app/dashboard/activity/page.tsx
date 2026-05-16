import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { recentActivity } from "@/lib/mock-data";

export default function ActivityPage() {
  return (
    <DashboardPlaceholder
      title="Activity"
      subtitle="Track recent uploads, buyer requests, reviews, and passport sharing events."
      primaryAction="View activity log"
      cards={[
        {
          title: "Recent activity",
          description: "The dashboard can surface the latest organization events from mock data.",
          icon: "activity",
          metric: `${recentActivity.length} events`,
          progress: 70,
        },
        {
          title: "Notifications",
          description: "Buyer requests and expiring evidence will become notification events.",
          icon: "bell",
          metric: "3 updates",
        },
        {
          title: "Audit trail",
          description: "A timeline-style audit trail will support review and collaboration.",
          icon: "history",
          metric: "Planned",
        },
      ]}
    />
  );
}
