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
    let timeoutId = window.setTimeout(updateTargetRect, 140);

    function updateTargetRect() {
      if (cancelled) {
        return;
      }

      if (!currentStep.target) {
        setTargetRect(null);
        return;
      }

      const element = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`);

      if (!element) {
        setTargetRect(null);
        return;
      }

      element.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: Math.max(12, rect.top - 10),
          left: Math.max(12, rect.left - 10),
          width: Math.min(window.innerWidth - 24, rect.width + 20),
          height: Math.min(window.innerHeight - 24, rect.height + 20),
          borderRadius: getSpotlightBorderRadius(element),
        });
      }, 260);
    }

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
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

    const width = Math.min(380, window.innerWidth - 32);
    const preferredTop = targetRect.top + targetRect.height + 16;
    const top =
      preferredTop + 220 < window.innerHeight
        ? preferredTop
        : Math.max(16, targetRect.top - 236);
    const left = Math.min(
      Math.max(16, targetRect.left),
      Math.max(16, window.innerWidth - width - 16),
    );

    return { top, left, width };
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
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[61] border-2 border-blue-300 shadow-[0_0_0_6px_rgba(37,99,235,0.18),0_0_35px_rgba(37,99,235,0.28)]"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: targetRect.borderRadius,
              }}
            />
          ) : null}
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-[70] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#002B36] p-5 text-white shadow-2xl shadow-slate-950/30",
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

  const bottomTop = targetRect.top + targetRect.height;
  const rightLeft = targetRect.left + targetRect.width;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[60] bg-slate-950/55 backdrop-blur-[1px]" style={{ height: targetRect.top }} />
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-950/55 backdrop-blur-[1px]" style={{ top: bottomTop }} />
      <div className="fixed z-[60] bg-slate-950/55 backdrop-blur-[1px]" style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }} />
      <div className="fixed z-[60] bg-slate-950/55 backdrop-blur-[1px]" style={{ top: targetRect.top, left: rightLeft, right: 0, height: targetRect.height }} />
    </>
  );
}

function getSpotlightBorderRadius(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const rawRadius =
    styles.borderRadius ||
    styles.borderTopLeftRadius ||
    styles.borderTopRightRadius ||
    styles.borderBottomRightRadius ||
    styles.borderBottomLeftRadius;

  const firstPixelRadius = rawRadius.match(/[\d.]+px/)?.[0];

  if (!firstPixelRadius) {
    return "22px";
  }

  const radius = Number.parseFloat(firstPixelRadius);

  if (!Number.isFinite(radius)) {
    return "22px";
  }

  if (radius > 1000) {
    return "9999px";
  }

  return `${Math.max(18, radius + 10)}px`;
}
