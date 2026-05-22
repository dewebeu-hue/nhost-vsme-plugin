"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionHelpProps = {
  closeLabel: string;
  label: string;
  text: string;
  className?: string;
};

export function QuestionHelp({ closeLabel, label, text, className }: QuestionHelpProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={cn("relative inline-flex shrink-0 align-middle", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex size-6 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700 shadow-sm shadow-blue-950/5 transition-colors hover:border-blue-200 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
      >
        <Info aria-hidden="true" className="size-3.5" />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 pr-9 text-left text-xs font-medium leading-5 text-slate-700 shadow-xl shadow-slate-950/10"
        >
          {text}
          <button
            type="button"
            aria-label={closeLabel}
            className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      ) : null}
    </span>
  );
}
