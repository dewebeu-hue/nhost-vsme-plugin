"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type SupplierOnboardingTourLabels = {
  startGuide: string;
  skipForNow: string;
  restartGuide: string;
  next: string;
  back: string;
  skip: string;
  finish: string;
  stepLabel: string;
  promptTitle: string;
  promptText: string;
  missingTargetText: string;
  steps: Array<{
    title: string;
    text: string;
  }>;
};

type SupplierOnboardingTourProps = {
  locale: AppLocale;
  labels: SupplierOnboardingTourLabels;
};

type TourStep = {
  route: string;
  target?: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
};

type PopoverRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const storagePrefix = "supplierPassportTour:v1";
const completedKey = `${storagePrefix}:completed`;
const dismissedKey = `${storagePrefix}:dismissed`;
const stepKey = `${storagePrefix}:step`;

const tourSteps: TourStep[] = [
  { route: "/dashboard" },
  { route: "/dashboard", target: "dashboard-readiness" },
  { route: "/dashboard", target: "dashboard-next-step" },
  { route: "/dashboard/questionnaire?section=company_basics", target: "questionnaire-company-basics" },
  { route: "/dashboard/questionnaire", target: "questionnaire-sections" },
  { route: "/dashboard/questionnaire", target: "questionnaire-save" },
  { route: "/dashboard/documents", target: "documents-page" },
  { route: "/dashboard/documents", target: "documents-upload" },
  { route: "/dashboard/documents", target: "documents-link-evidence" },
  { route: "/dashboard/passport", target: "passport-summary" },
  { route: "/dashboard/share", target: "share-public-link" },
  { route: "/dashboard/passport", target: "passport-pdf" },
];

export function SupplierOnboardingTour({ locale, labels }: SupplierOnboardingTourProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const currentStep = tourSteps[stepIndex] ?? tourSteps[0];
  const currentCopy = labels.steps[stepIndex] ?? labels.steps[0];
  const isLastStep = stepIndex === tourSteps.length - 1;

  const localizedRoute = useCallback(
    (route: string) => `/${locale}${route}`,
    [locale],
  );

  const startTour = useCallback(() => {
    window.localStorage.removeItem(completedKey);
    window.localStorage.removeItem(dismissedKey);
    window.localStorage.setItem(stepKey, "0");
    setStepIndex(0);
    setIsPromptOpen(false);
    setIsRunning(true);
  }, []);

  const dismissTour = useCallback(() => {
    window.localStorage.setItem(dismissedKey, "true");
    window.localStorage.removeItem(stepKey);
    setIsPromptOpen(false);
    setIsRunning(false);
  }, []);

  const finishTour = useCallback(() => {
    window.localStorage.setItem(completedKey, "true");
    window.localStorage.removeItem(dismissedKey);
    window.localStorage.removeItem(stepKey);
    setIsRunning(false);
  }, []);

  const goToStep = useCallback((nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), tourSteps.length - 1);
    window.localStorage.setItem(stepKey, String(boundedIndex));
    setStepIndex(boundedIndex);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsReady(true);

      const completed = window.localStorage.getItem(completedKey) === "true";
      const dismissed = window.localStorage.getItem(dismissedKey) === "true";
      const savedStep = Number(window.localStorage.getItem(stepKey));

      if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < tourSteps.length) {
        setStepIndex(savedStep);
      }

      if (!completed && !dismissed) {
        setIsPromptOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    function handleRestart() {
      startTour();
    }

    window.addEventListener("supplier-passport-tour:restart", handleRestart);

    return () => {
      window.removeEventListener("supplier-passport-tour:restart", handleRestart);
    };
  }, [startTour]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const targetRoute = localizedRoute(currentStep.route);
    const currentUrl = `${pathname}${window.location.search}`;

    if (currentUrl !== targetRoute) {
      router.push(targetRoute);
      return;
    }

    let cancelled = false;
    let retryTimeoutId: number | null = null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    function clearRetryTimeout() {
      if (retryTimeoutId !== null) {
        window.clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
    }

    function clearAnimationFrame() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function measureElementAfterLayout(element: HTMLElement, shouldScrollIntoView = false) {
      if (cancelled) {
        return;
      }

      if (shouldScrollIntoView) {
        element.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      }

      clearAnimationFrame();
      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = window.requestAnimationFrame(() => {
          if (cancelled) {
            return;
          }

          const rect = element.getBoundingClientRect();
          setTargetRect(createSpotlightRect(element, rect));
        });
      });
    }

    function observeTarget(element: HTMLElement) {
      resizeObserver?.disconnect();

      if (!("ResizeObserver" in window)) {
        return;
      }

      resizeObserver = new ResizeObserver(() => {
        measureElementAfterLayout(element);
      });
      resizeObserver.observe(element);
    }

    function findTargetAndMeasure(startedAt = performance.now()) {
      if (cancelled) {
        return;
      }

      if (!currentStep.target) {
        setTargetRect(null);
        return;
      }

      const element = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`);

      if (!element) {
        if (performance.now() - startedAt < 2000) {
          retryTimeoutId = window.setTimeout(() => findTargetAndMeasure(startedAt), 50);
        } else {
          setTargetRect(null);
        }
        return;
      }

      clearRetryTimeout();
      observeTarget(element);
      measureElementAfterLayout(element, true);
    }

    function remeasureVisibleTarget() {
      if (!currentStep.target) {
        return;
      }

      const element = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`);

      if (element) {
        measureElementAfterLayout(element);
      }
    }

    findTargetAndMeasure();
    window.addEventListener("resize", remeasureVisibleTarget);
    window.addEventListener("scroll", remeasureVisibleTarget, { passive: true });

    return () => {
      cancelled = true;
      clearRetryTimeout();
      clearAnimationFrame();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", remeasureVisibleTarget);
      window.removeEventListener("scroll", remeasureVisibleTarget);
    };
  }, [currentStep, isRunning, localizedRoute, pathname, router]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismissTour();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissTour, isRunning]);

  const popoverStyle = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (!targetRect) {
      return undefined;
    }

    const rect = getSmartPopoverRect(targetRect, window.innerWidth, window.innerHeight);

    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(180, window.innerHeight - 32),
    };
  }, [targetRect]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      {!isRunning && !isPromptOpen ? (
        <button
          type="button"
          onClick={startTour}
          className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg shadow-slate-950/10 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <HelpCircle aria-hidden="true" className="size-4" />
          {labels.restartGuide}
        </button>
      ) : null}

      {isPromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#002B36] p-6 text-white shadow-2xl shadow-slate-950/30"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Supplier Passport
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {labels.promptTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/85">{labels.promptText}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={dismissTour}>
                {labels.skipForNow}
              </Button>
              <Button type="button" onClick={startTour}>
                {labels.startGuide}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isRunning ? (
        <>
          <TourOverlay targetRect={targetRect} />
          {targetRect ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-[61]"
                style={getSpotlightGlowStyle(targetRect)}
              >
                <svg
                  className="tour-spotlight-svg size-full overflow-visible"
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${targetRect.width + 20} ${targetRect.height + 20}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="tour-spotlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6EA8FF" />
                      <stop offset="45%" stopColor="#7CF0D2" />
                      <stop offset="72%" stopColor="#B8D8FF" />
                      <stop offset="100%" stopColor="#6EA8FF" />
                      <animateTransform
                        attributeName="gradientTransform"
                        type="rotate"
                        from={`0 ${(targetRect.width + 20) / 2} ${(targetRect.height + 20) / 2}`}
                        to={`360 ${(targetRect.width + 20) / 2} ${(targetRect.height + 20) / 2}`}
                        dur="4.8s"
                        repeatCount="indefinite"
                      />
                    </linearGradient>
                  </defs>
                  <rect
                    x="10"
                    y="10"
                    width={Math.max(0, targetRect.width)}
                    height={Math.max(0, targetRect.height)}
                    rx={getSvgBorderRadius(targetRect.borderRadius)}
                    ry={getSvgBorderRadius(targetRect.borderRadius)}
                    fill="none"
                    stroke="url(#tour-spotlight-gradient)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    className="tour-spotlight-ring"
                  />
                  <rect
                    x="10"
                    y="10"
                    width={Math.max(0, targetRect.width)}
                    height={Math.max(0, targetRect.height)}
                    rx={getSvgBorderRadius(targetRect.borderRadius)}
                    ry={getSvgBorderRadius(targetRect.borderRadius)}
                    fill="none"
                    stroke="#DBEAFE"
                    strokeOpacity="0.75"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-[62] border border-blue-200/90 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                style={{
                  top: targetRect.top,
                  left: targetRect.left,
                  width: targetRect.width,
                  height: targetRect.height,
                  borderRadius: targetRect.borderRadius,
                }}
              />
            </>
          ) : null}
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-[70] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#002B36] p-5 text-white shadow-2xl shadow-slate-950/30",
              targetRect ? "" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            )}
            style={popoverStyle}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                {labels.stepLabel
                  .replace("{current}", String(stepIndex + 1))
                  .replace("{total}", String(tourSteps.length))}
              </p>
              <button
                type="button"
                onClick={dismissTour}
                aria-label={labels.skip}
                className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {currentCopy.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/85">{currentCopy.text}</p>
            {currentStep.target && !targetRect ? (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/85">
                {labels.missingTargetText}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" className="text-white/85 hover:bg-white/10 hover:text-white" onClick={dismissTour}>
                {labels.skip}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/70 bg-white text-[#002B36] hover:border-white hover:bg-slate-100 hover:text-slate-950 focus-visible:border-white focus-visible:ring-white/60 disabled:bg-white/60 disabled:text-slate-700 disabled:opacity-60"
                  disabled={stepIndex === 0}
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  <ArrowLeft data-icon="inline-start" />
                  {labels.back}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (isLastStep) {
                      finishTour();
                    } else {
                      goToStep(stepIndex + 1);
                    }
                  }}
                >
                  {isLastStep ? labels.finish : labels.next}
                  {!isLastStep ? <ArrowRight data-icon="inline-end" /> : null}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

function TourOverlay({ targetRect }: { targetRect: TargetRect | null }) {
  if (!targetRect) {
    return <div className="fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-[1px]" />;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[60]"
      style={{
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: targetRect.borderRadius,
        boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.55)",
      }}
    />
  );
}

function createSpotlightRect(element: HTMLElement, rect: DOMRect): TargetRect {
  const padding = 10;
  const left = Math.max(0, rect.left - padding);
  const top = Math.max(0, rect.top - padding);
  const right = Math.min(window.innerWidth, rect.right + padding);
  const bottom = Math.min(window.innerHeight, rect.bottom + padding);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    top,
    left,
    width,
    height,
    borderRadius: getSpotlightBorderRadius(element, width, height, padding),
  };
}

function getSpotlightGlowStyle(targetRect: TargetRect) {
  const padding = 10;

  return {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    borderRadius: `calc(${targetRect.borderRadius} + ${padding}px)`,
  };
}

function getSvgBorderRadius(borderRadius: string) {
  const radius = Number.parseFloat(borderRadius);
  return Number.isFinite(radius) ? radius : 18;
}

function getSpotlightBorderRadius(
  element: HTMLElement,
  spotlightWidth: number,
  spotlightHeight: number,
  padding: number,
) {
  const styles = window.getComputedStyle(element);
  const radii = [
    styles.borderTopLeftRadius,
    styles.borderTopRightRadius,
    styles.borderBottomRightRadius,
    styles.borderBottomLeftRadius,
    styles.borderRadius,
  ].flatMap((value) => value.match(/[\d.]+px/g) ?? []);
  const largestRadius = radii
    .map((value) => Number.parseFloat(value))
    .filter(Number.isFinite)
    .reduce((largest, radius) => Math.max(largest, radius), 0);
  const expandedRadius = Math.max(16, largestRadius + padding);
  const maxRadius = Math.max(0, Math.min(spotlightWidth, spotlightHeight) / 2);

  return `${Math.min(expandedRadius, maxRadius)}px`;
}

function getSmartPopoverRect(
  targetRect: TargetRect,
  viewportWidth: number,
  viewportHeight: number,
): PopoverRect {
  const margin = 16;
  const gap = 16;
  const width = Math.min(380, Math.max(280, viewportWidth - margin * 2));
  const height = Math.min(300, Math.max(220, viewportHeight - margin * 2));
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const targetRight = targetRect.left + targetRect.width;
  const targetBottom = targetRect.top + targetRect.height;
  const available = {
    top: Math.max(0, targetRect.top - margin),
    bottom: Math.max(0, viewportHeight - targetBottom - margin),
    left: Math.max(0, targetRect.left - margin),
    right: Math.max(0, viewportWidth - targetRight - margin),
  };
  const candidates = [
    createPopoverCandidate({
      placement: "bottom",
      rect: {
        top: targetBottom + gap,
        left: targetCenterX - width / 2,
        width,
        height,
      },
      availableSize: available.bottom,
      availableArea: available.bottom * viewportWidth,
      neededSize: height + gap,
      targetRect,
      viewportWidth,
      viewportHeight,
      margin,
    }),
    createPopoverCandidate({
      placement: "top",
      rect: {
        top: targetRect.top - gap - height,
        left: targetCenterX - width / 2,
        width,
        height,
      },
      availableSize: available.top,
      availableArea: available.top * viewportWidth,
      neededSize: height + gap,
      targetRect,
      viewportWidth,
      viewportHeight,
      margin,
    }),
    createPopoverCandidate({
      placement: "right",
      rect: {
        top: targetCenterY - height / 2,
        left: targetRight + gap,
        width,
        height,
      },
      availableSize: available.right,
      availableArea: available.right * viewportHeight,
      neededSize: width + gap,
      targetRect,
      viewportWidth,
      viewportHeight,
      margin,
    }),
    createPopoverCandidate({
      placement: "left",
      rect: {
        top: targetCenterY - height / 2,
        left: targetRect.left - gap - width,
        width,
        height,
      },
      availableSize: available.left,
      availableArea: available.left * viewportHeight,
      neededSize: width + gap,
      targetRect,
      viewportWidth,
      viewportHeight,
      margin,
    }),
  ];

  candidates.sort((a, b) => {
    if (a.hasEnoughSpace !== b.hasEnoughSpace) {
      return a.hasEnoughSpace ? -1 : 1;
    }

    if (a.overlapArea !== b.overlapArea) {
      return a.overlapArea - b.overlapArea;
    }

    return b.availableArea - a.availableArea;
  });

  return candidates[0]?.rect ?? createCenteredPopoverRect(width, height, viewportWidth, viewportHeight, margin);
}

function createPopoverCandidate({
  rect,
  availableSize,
  availableArea,
  neededSize,
  targetRect,
  viewportWidth,
  viewportHeight,
  margin,
}: {
  placement: "top" | "bottom" | "left" | "right";
  rect: PopoverRect;
  availableSize: number;
  availableArea: number;
  neededSize: number;
  targetRect: TargetRect;
  viewportWidth: number;
  viewportHeight: number;
  margin: number;
}) {
  const clampedRect = clampPopoverRect(rect, viewportWidth, viewportHeight, margin);

  return {
    rect: clampedRect,
    availableArea,
    hasEnoughSpace: availableSize >= neededSize,
    overlapArea: getRectOverlapArea(clampedRect, targetRect),
  };
}

function clampPopoverRect(
  rect: PopoverRect,
  viewportWidth: number,
  viewportHeight: number,
  margin: number,
) {
  const maxLeft = Math.max(margin, viewportWidth - rect.width - margin);
  const maxTop = Math.max(margin, viewportHeight - rect.height - margin);

  return {
    ...rect,
    left: clamp(rect.left, margin, maxLeft),
    top: clamp(rect.top, margin, maxTop),
  };
}

function createCenteredPopoverRect(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  margin: number,
) {
  return clampPopoverRect(
    {
      top: viewportHeight / 2 - height / 2,
      left: viewportWidth / 2 - width / 2,
      width,
      height,
    },
    viewportWidth,
    viewportHeight,
    margin,
  );
}

function getRectOverlapArea(a: PopoverRect, b: TargetRect) {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.top + a.height, b.top + b.height);

  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
