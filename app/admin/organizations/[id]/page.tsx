import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type AdminOrganizationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrganizationDetailPage({ params }: AdminOrganizationDetailPageProps) {
  const { id } = await params;
  redirect(`/en/admin/organizations/${id}`);
}
