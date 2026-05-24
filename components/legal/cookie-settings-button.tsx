"use client";

import { openCookieSettings } from "@/components/legal/cookie-consent-manager";
import { Button } from "@/components/ui/button";

type CookieSettingsButtonProps = {
  label: string;
};

export function CookieSettingsButton({ label }: CookieSettingsButtonProps) {
  return (
    <Button
      type="button"
      onClick={openCookieSettings}
      className="mt-6 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
    >
      {label}
    </Button>
  );
}
