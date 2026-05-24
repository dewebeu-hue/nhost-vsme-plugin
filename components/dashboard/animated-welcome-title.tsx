"use client";

import { useEffect, useState } from "react";

type AnimatedWelcomeTitleProps = {
  text: string;
  onDone?: () => void;
};

const typingDelayMs = 18;

export function AnimatedWelcomeTitle({ text, onDone }: AnimatedWelcomeTitleProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame: number | undefined;

    if (prefersReducedMotion) {
      frame = window.requestAnimationFrame(() => {
        setDisplayText(text);
        setIsTyping(false);
        onDone?.();
      });
      return;
    }

    let index = 0;
    let doneTimer: number | undefined;

    const interval = window.setInterval(() => {
      index += 1;
      setDisplayText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
        doneTimer = window.setTimeout(() => {
          setIsTyping(false);
          onDone?.();
        }, 120);
      }
    }, typingDelayMs);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.clearInterval(interval);

      if (doneTimer) {
        window.clearTimeout(doneTimer);
      }
    };
  }, [onDone, text]);

  return (
    <span className="relative inline-block max-w-full align-bottom" aria-label={text}>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-normal">
        {displayText}
        {isTyping ? (
          <span className="ml-1 inline-block h-[0.9em] w-px translate-y-0.5 animate-pulse bg-blue-600 align-baseline" />
        ) : null}
      </span>
    </span>
  );
}
