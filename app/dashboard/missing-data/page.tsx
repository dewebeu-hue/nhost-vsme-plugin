import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MissingDataPage() {
  redirect("/en/dashboard/missing-data");
}
