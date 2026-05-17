import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

type AdminPassportsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPassportsPage({ params }: AdminPassportsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <AdminPlaceholder
      title={t("passportsTitle")}
      subtitle={t("passportsSubtitle")}
      workspaceTitle={t("passportsWorkspaceTitle")}
      workspaceDescription={t("workspaceDescription")}
      mockNote={t("mockNote")}
      openOrganizationsLabel={t("openOrganizations")}
    />
  );
}
