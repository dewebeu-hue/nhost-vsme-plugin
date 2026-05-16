import { CheckCheck, FilePlus2, Mail, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Mark reviewed", icon: CheckCheck },
  { label: "Add note", icon: NotebookPen },
  { label: "Generate passport", icon: FilePlus2 },
  { label: "Email client", icon: Mail },
];

export function AdminQuickActions() {
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
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
