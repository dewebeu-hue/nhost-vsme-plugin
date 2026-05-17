import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default function AdminSettingsPage() {
  redirect("/en/admin/settings");
}
