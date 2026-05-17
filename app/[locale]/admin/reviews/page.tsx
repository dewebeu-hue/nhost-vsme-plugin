import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

type AdminReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReviewsPage({ params }: AdminReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <AdminPlaceholder
      title={t("reviewsTitle")}
      subtitle={t("reviewsSubtitle")}
      workspaceTitle={t("reviewsWorkspaceTitle")}
      workspaceDescription={t("workspaceDescription")}
      mockNote={t("mockNote")}
      openOrganizationsLabel={t("openOrganizations")}
    />
  );
}
