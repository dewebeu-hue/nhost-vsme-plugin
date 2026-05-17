import { redirect } from "next/navigation";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { StateCard } from "@/components/shared/state-card";
import { activeShareLinks } from "@/lib/mock-data";

export const dynamic = "force-dynamic";


export function ShareLinksPageContent() {
  return (
    <div className="flex flex-col gap-6">
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
      <StateCard
        title="No live share links yet"
        description="Create a permissioned passport link after the passport is generated. Mock links are shown above for demo context only."
        tone="info"
      />
    </div>
  );
}

export default function ShareLinksPage() {
  redirect("/en/dashboard/share-links");
}
