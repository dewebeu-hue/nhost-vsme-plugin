import { redirect } from "next/navigation";

type BuyerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function BuyerRequestDetailPage({ params }: BuyerRequestDetailPageProps) {
  const { id } = await params;
  redirect(`/en/dashboard/buyer-requests/${id}`);
}
