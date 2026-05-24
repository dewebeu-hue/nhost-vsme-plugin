"use client";

import { useEffect, useMemo, useState } from "react";

type TypingSegment = {
  text: string;
  className: string;
};

type SegmentedTypingHeadlineProps = {
  segments: TypingSegment[];
};

const typingDelayMs = 18;

export function SegmentedTypingHeadline({ segments }: SegmentedTypingHeadlineProps) {
  const fullText = useMemo(() => segments.map((segment) => segment.text).join(""), [segments]);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame: number | undefined;

    if (prefersReducedMotion) {
      frame = window.requestAnimationFrame(() => {
        setVisibleCharacters(fullText.length);
        setIsTyping(false);
      });
      return () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
        }
      };
    }

    let index = 0;
    let doneTimer: number | undefined;

    const interval = window.setInterval(() => {
      index += 1;
      setVisibleCharacters(index);

      if (index >= fullText.length) {
        window.clearInterval(interval);
        doneTimer = window.setTimeout(() => setIsTyping(false), 120);
      }
    }, typingDelayMs);

    return () => {
      window.clearInterval(interval);

      if (doneTimer) {
        window.clearTimeout(doneTimer);
      }
    };
  }, [fullText.length]);

  return (
    <span className="relative inline-block max-w-full align-bottom" aria-label={fullText}>
      <span aria-hidden="true" className="invisible">
        {segments.map((segment, index) => (
          <span key={`${segment.text}-${index}`} className={segment.className}>
            {segment.text}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-normal">
        {renderVisibleSegments(segments, visibleCharacters)}
        {isTyping ? (
          <span className="ml-1 inline-block h-[0.9em] w-px translate-y-0.5 animate-pulse bg-teal-500 align-baseline" />
        ) : null}
      </span>
    </span>
  );
}

function renderVisibleSegments(segments: TypingSegment[], visibleCharacters: number) {
  let remainingCharacters = visibleCharacters;

  return segments.map((segment, index) => {
    const visibleText = segment.text.slice(0, Math.max(0, remainingCharacters));
    remainingCharacters -= segment.text.length;

    return (
      <span key={`${segment.text}-${index}`} className={segment.className}>
        {visibleText}
      </span>
    );
  });
}
