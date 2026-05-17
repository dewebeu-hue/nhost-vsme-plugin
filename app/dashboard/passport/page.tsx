import { redirect } from "next/navigation";
import { PassportPageClient } from "@/components/passport/passport-page-client";
import { defaultPassportLabels, type PassportLabels } from "@/lib/passport-labels";

export const dynamic = "force-dynamic";

type PassportPageContentProps = {
  labels?: PassportLabels;
};

export function PassportPageContent({ labels = defaultPassportLabels }: PassportPageContentProps) {
  return <PassportPageClient labels={labels} />;
}

export default function PassportPage() {
  redirect("/en/dashboard/passport");
}
