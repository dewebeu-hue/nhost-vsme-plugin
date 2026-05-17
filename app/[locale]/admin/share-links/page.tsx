import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

type AdminShareLinksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminShareLinksPage({ params }: AdminShareLinksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <AdminPlaceholder
      title={t("shareLinksTitle")}
      subtitle={t("shareLinksSubtitle")}
      workspaceTitle={t("shareLinksWorkspaceTitle")}
      workspaceDescription={t("workspaceDescription")}
      mockNote={t("mockNote")}
      openOrganizationsLabel={t("openOrganizations")}
    />
  );
}
