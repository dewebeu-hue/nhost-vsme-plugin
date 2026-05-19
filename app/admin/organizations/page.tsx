import { redirect } from "next/navigation";
import { AdminOrganizationsClient } from "@/components/admin/admin-organizations-client";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

export const dynamic = "force-dynamic";

export function AdminOrganizationsPageContent({
  labels = defaultAdminLabels,
}: {
  labels?: AdminLabels;
}) {
  return <AdminOrganizationsClient labels={labels} />;
}

export default function AdminOrganizationsPage() {
  redirect("/en/admin/organizations");
}
