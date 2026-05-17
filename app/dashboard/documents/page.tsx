import { redirect } from "next/navigation";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";

export const dynamic = "force-dynamic";


export function DocumentsPageContent() {
  return <DocumentsPageClient />;
}

export default function DocumentsPage() {
  redirect("/en/dashboard/documents");
}
