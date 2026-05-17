"use client";

import { useTranslations } from "next-intl";
import type { BillingCycle } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type BillingToggleProps = {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
  getHref?: (value: BillingCycle) => string;
};

export function BillingToggle({ value, onChange, getHref }: BillingToggleProps) {
  const t = useTranslations("pricing.billing");
  const options: Array<{ value: BillingCycle; label: string }> = [
    { value: "monthly", label: t("monthly") },
    { value: "annual", label: t("annual") },
  ];

  return (
    <div
      className="inline-flex w-full max-w-md rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-inner shadow-slate-200/70 sm:w-auto"
      role="radiogroup"
      aria-label="Pricing billing cycle"
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <a
            key={option.value}
            href={getHref?.(option.value) ?? "#"}
            role="radio"
            aria-checked={selected}
            onPointerDown={() => onChange(option.value)}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition sm:min-w-36",
              selected
                ? "bg-white text-blue-700 shadow-[0_10px_25px_rgba(15,23,42,0.12)]"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <span>{option.label}</span>
            {option.value === "annual" ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  selected ? "bg-emerald-50 text-emerald-700" : "bg-white/70 text-emerald-700",
                )}
              >
                {t("save")}
              </span>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
