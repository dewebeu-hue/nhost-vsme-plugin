import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("supplier-surface rounded-2xl border-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-6 pb-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-sm leading-6 text-slate-500">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
