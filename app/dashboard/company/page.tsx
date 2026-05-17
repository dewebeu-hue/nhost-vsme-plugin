import { redirect } from "next/navigation";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { currentOrganization } from "@/lib/mock-data";

export const dynamic = "force-dynamic";


export function CompanyProfilePageContent() {
  return (
    <DashboardPlaceholder
      title="Company Profile"
      subtitle="Maintain the verified company facts that appear in buyer-facing passport views."
      primaryAction="Edit profile"
      cards={[
        {
          title: currentOrganization.name,
          description: `${currentOrganization.city}, ${currentOrganization.country} · ${currentOrganization.industry}`,
          icon: "building",
          metric: "Verified",
        },
        {
          title: "Operating footprint",
          description: `${currentOrganization.employeeCount} employees across the supplier profile scope.`,
          icon: "globe",
          metric: "Active",
        },
        {
          title: "Plan details",
          description: `Starter plan renewal is scheduled for May 12, 2025.`,
          icon: "shield",
          metric: currentOrganization.plan,
        },
      ]}
    />
  );
}

export default function CompanyProfilePage() {
  redirect("/en/dashboard/company");
}
