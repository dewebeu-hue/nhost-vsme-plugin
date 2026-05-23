"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContextualHelpCardProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

type TerminologyTooltipProps = {
  label: string;
  text: string;
  className?: string;
};

export function ContextualHelpCard({
  title,
  text,
  actionLabel,
  onAction,
  className,
}: ContextualHelpCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-teal-50/50 p-5 text-blue-950 shadow-sm shadow-blue-950/5",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <Info aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-blue-900/80">{text}</p>
          {actionLabel && onAction ? (
            <Button
              type="button"
              variant="outline"
              className="restart-guide-cta mt-4 h-9 rounded-full px-4 font-semibold"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function RestartOnboardingGuideButton({ children }: { children: ReactNode }) {
  return (
    <ContextualHelpAction
      onAction={() => {
        window.dispatchEvent(new CustomEvent("supplier-passport-tour:restart"));
      }}
    >
      {children}
    </ContextualHelpAction>
  );
}

export function TerminologyTooltip({ label, text, className }: TerminologyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((current) => !current);
        }}
      >
        <HelpCircle aria-hidden="true" className="size-3.5" />
      </button>
      {isOpen ? (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-700 shadow-xl shadow-slate-950/10"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function ContextualHelpAction({
  children,
  onAction,
}: {
  children: ReactNode;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      className="restart-guide-cta inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition"
      onClick={onAction}
    >
      {children}
    </button>
  );
}
