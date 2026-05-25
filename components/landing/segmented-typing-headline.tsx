"use client";

import { useEffect, useMemo, useState } from "react";

type TypingSegment = {
  text: string;
  className: string;
};

type SegmentedTypingHeadlineProps = {
  segments: TypingSegment[];
};

const wordTypingDelayMs = 72;

export function SegmentedTypingHeadline({ segments }: SegmentedTypingHeadlineProps) {
  const fullText = useMemo(() => segments.map((segment) => segment.text).join(""), [segments]);
  const typingSteps = useMemo(() => createTypingSteps(fullText), [fullText]);
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

    let stepIndex = 0;
    let doneTimer: number | undefined;

    const interval = window.setInterval(() => {
      const nextVisibleCharacters = typingSteps[stepIndex] ?? fullText.length;
      setVisibleCharacters(nextVisibleCharacters);
      stepIndex += 1;

      if (nextVisibleCharacters >= fullText.length) {
        window.clearInterval(interval);
        doneTimer = window.setTimeout(() => setIsTyping(false), 120);
      }
    }, wordTypingDelayMs);

    return () => {
      window.clearInterval(interval);

      if (doneTimer) {
        window.clearTimeout(doneTimer);
      }
    };
  }, [fullText.length, typingSteps]);

  return (
    <span className="relative block w-full max-w-full align-bottom" aria-label={fullText}>
      <span aria-hidden="true" className="invisible block w-full whitespace-normal">
        {segments.map((segment, index) => (
          <span key={`${segment.text}-${index}`} className={segment.className}>
            {segment.text}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block w-full whitespace-normal">
        {renderVisibleSegments(segments, visibleCharacters)}
        {isTyping ? (
          <span className="ml-1 inline-block h-[0.9em] w-px translate-y-0.5 animate-pulse bg-teal-500 align-baseline" />
        ) : null}
      </span>
    </span>
  );
}

function createTypingSteps(value: string) {
  const wordSteps = [...value.matchAll(/\S+\s*/g)].map((match) => match.index + match[0].length);

  return wordSteps.length ? wordSteps : Array.from({ length: value.length }, (_, index) => index + 1);
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
