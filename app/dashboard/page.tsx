import { redirect } from "next/navigation";
import { DashboardOverviewPage } from "@/components/dashboard/dashboard-overview-page";

export const dynamic = "force-dynamic";


export function DashboardPageContent() {
  return <DashboardOverviewPage />;
}

export default function DashboardPage() {
  redirect("/en/dashboard");
}
