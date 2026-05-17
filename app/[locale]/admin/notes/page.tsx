import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { StateCard } from "@/components/shared/state-card";

type AdminNotesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminNotesPage({ params }: AdminNotesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.placeholders");

  return (
    <div className="flex flex-col gap-6">
      <AdminPlaceholder
        title={t("notesTitle")}
        subtitle={t("notesSubtitle")}
        workspaceTitle={t("notesWorkspaceTitle")}
        workspaceDescription={t("workspaceDescription")}
        mockNote={t("mockNote")}
        openOrganizationsLabel={t("openOrganizations")}
      />
      <StateCard
        title={t("noNotesTitle")}
        description={t("noNotesText")}
        tone="secure"
      />
    </div>
  );
}
