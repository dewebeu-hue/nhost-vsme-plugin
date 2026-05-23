import { CheckCheck, FilePlus2, Mail, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";

const actions = [
  { label: "Mark reviewed", icon: CheckCheck },
  { label: "Add note", icon: NotebookPen },
  { label: "Update passport", icon: FilePlus2 },
  { label: "Email client", icon: Mail },
];

export function AdminQuickActions({ labels = defaultAdminLabels }: { labels?: AdminLabels }) {
  const labelMap: Record<string, string> = {
    "Mark reviewed": labels.markReviewed,
    "Add note": labels.addNote,
    "Update passport": labels.generatePassport,
    "Email client": labels.emailClient,
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.label}
            variant={action.label === "Mark reviewed" ? "default" : "outline"}
            className="h-10 justify-start rounded-xl"
          >
            <Icon data-icon="inline-start" />
            {labelMap[action.label] ?? action.label}
          </Button>
        );
      })}
    </div>
  );
}
