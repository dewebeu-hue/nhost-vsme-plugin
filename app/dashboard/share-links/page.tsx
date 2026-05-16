import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { activeShareLinks } from "@/lib/mock-data";

export default function ShareLinksPage() {
  return (
    <DashboardPlaceholder
      title="Share Links"
      subtitle="Manage secure passport links for buyers and procurement teams."
      primaryAction="Create share link"
      cards={[
        {
          title: "Active links",
          description: "Buyer share links include expiry controls and access levels.",
          icon: "link",
          metric: `${activeShareLinks.length} links`,
          progress: 68,
        },
        {
          title: "Permissioned access",
          description: "Share links are designed for secure, read-only passport review.",
          icon: "lock",
          metric: "Secure",
        },
        {
          title: "Expiry tracking",
          description: "Time-bound access helps keep buyer review windows controlled.",
          icon: "timer",
          metric: "May 28",
        },
      ]}
    />
  );
}
