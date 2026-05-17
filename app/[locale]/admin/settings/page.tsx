import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <AdminPlaceholder
      title={t("settingsTitle")}
      subtitle={t("settingsSubtitle")}
      workspaceTitle={t("settingsWorkspaceTitle")}
      workspaceDescription={t("workspaceDescription")}
      mockNote={t("mockNote")}
      openOrganizationsLabel={t("openOrganizations")}
    />
  );
}
