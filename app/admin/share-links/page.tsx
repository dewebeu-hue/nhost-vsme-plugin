import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default function AdminShareLinksPage() {
  redirect("/en/admin/share-links");
}
