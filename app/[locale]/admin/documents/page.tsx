import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

type AdminDocumentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDocumentsPage({ params }: AdminDocumentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <AdminPlaceholder
      title={t("documentsTitle")}
      subtitle={t("documentsSubtitle")}
      workspaceTitle={t("documentsWorkspaceTitle")}
      workspaceDescription={t("workspaceDescription")}
      mockNote={t("mockNote")}
      openOrganizationsLabel={t("openOrganizations")}
    />
  );
}
