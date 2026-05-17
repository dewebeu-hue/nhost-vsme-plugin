import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default function AdminPassportsPage() {
  redirect("/en/admin/passports");
}
