import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { missingDataSummary } from "@/lib/mock-data";

export default function MissingDataPage() {
  const totalMissing = missingDataSummary.reduce((total, item) => total + item.count, 0);

  return (
    <DashboardPlaceholder
      title="Missing Data"
      subtitle="Prioritize open evidence gaps and incomplete questionnaire answers before buyer review."
      primaryAction="Resolve gaps"
      cards={[
        {
          title: "Open gaps",
          description: "Missing data points are grouped by module and severity.",
          icon: "alert",
          metric: `${totalMissing} gaps`,
          progress: 46,
        },
        {
          title: "Evidence required",
          description: "High-impact evidence requests are ready for task assignment.",
          icon: "clipboard-list",
          metric: "3 categories",
          progress: 52,
        },
        {
          title: "Buyer readiness",
          description: "Closing these gaps will improve the passport before sharing.",
          icon: "target",
          metric: "Next focus",
          progress: 64,
        },
      ]}
    />
  );
}
