import { redirect } from "next/navigation";
import { QuestionnairePageClient } from "@/components/questionnaire/questionnaire-page-client";

export const dynamic = "force-dynamic";


export function QuestionnairePageContent() {
  return <QuestionnairePageClient />;
}

export default function QuestionnairePage() {
  redirect("/en/dashboard/questionnaire");
}
