import { getMessages, setRequestLocale } from "next-intl/server";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

type DocumentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as { documents?: Partial<DocumentsLabels> };
  const source = messages.documents ?? {};

  const labels: DocumentsLabels = {
    ...defaultDocumentsLabels,
    ...source,
    statuses: { ...defaultDocumentsLabels.statuses, ...source.statuses },
    answerStatuses: { ...defaultDocumentsLabels.answerStatuses, ...source.answerStatuses },
    documentTypes: { ...defaultDocumentsLabels.documentTypes, ...source.documentTypes },
    sections: { ...defaultDocumentsLabels.sections, ...source.sections },
    questionTitles: { ...defaultDocumentsLabels.questionTitles, ...source.questionTitles },
  };

  return <DocumentsPageClient labels={labels} />;
}
