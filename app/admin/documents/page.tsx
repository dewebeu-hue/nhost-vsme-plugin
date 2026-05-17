import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default function AdminDocumentsPage() {
  redirect("/en/admin/documents");
}
