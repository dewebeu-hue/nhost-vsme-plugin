"use client";

import { openCookieSettings } from "@/components/legal/cookie-consent-manager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CookieSettingsButtonProps = {
  className?: string;
  label: string;
  variant?: "primary" | "sidebar";
};

export function CookieSettingsButton({
  className,
  label,
  variant = "primary",
}: CookieSettingsButtonProps) {
  return (
    <Button
      type="button"
      onClick={openCookieSettings}
      variant={variant === "sidebar" ? "ghost" : undefined}
      className={cn(
        variant === "sidebar"
          ? "h-9 w-full justify-start rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          : "mt-6 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700",
        className,
      )}
    >
      {label}
    </Button>
  );
}
