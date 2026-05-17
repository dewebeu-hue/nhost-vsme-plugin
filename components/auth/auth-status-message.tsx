import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthStatusMessageProps = {
  tone: "info" | "success" | "error";
  message: string;
};

const toneStyles = {
  info: "border-blue-100 bg-blue-50 text-blue-800",
  success: "border-teal-100 bg-teal-50 text-teal-800",
  error: "border-red-100 bg-red-50 text-red-800",
};

export function AuthStatusMessage({ tone, message }: AuthStatusMessageProps) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-6", toneStyles[tone])}>
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
