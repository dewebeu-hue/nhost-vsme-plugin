export function getReadinessVisualState(readiness: number) {
  const normalizedReadiness = Math.max(0, Math.min(100, readiness));
  const isComplete = normalizedReadiness === 100;

  if (normalizedReadiness < 100 / 3) {
    return {
      tone: "red" as const,
      isComplete,
      cardClassName: "bg-gradient-to-br from-white via-red-50/80 to-white ring-1 ring-red-200",
      trackClassName: "stroke-red-100",
      progressClassName: "stroke-red-500",
      valueClassName: "text-red-700",
      labelClassName: "text-red-600",
      helperClassName: "text-red-500",
      footerClassName: "border-red-100 bg-red-50 text-red-700",
      barClassName: "[&>div]:bg-red-500",
    };
  }

  if (normalizedReadiness <= 200 / 3) {
    return {
      tone: "amber" as const,
      isComplete,
      cardClassName: "bg-gradient-to-br from-white via-amber-50/80 to-white ring-1 ring-amber-200",
      trackClassName: "stroke-amber-100",
      progressClassName: "stroke-amber-500",
      valueClassName: "text-amber-700",
      labelClassName: "text-amber-600",
      helperClassName: "text-amber-500",
      footerClassName: "border-amber-100 bg-amber-50 text-amber-700",
      barClassName: "[&>div]:bg-amber-500",
    };
  }

  return {
    tone: "emerald" as const,
    isComplete,
    cardClassName: "bg-gradient-to-br from-white via-emerald-50/80 to-white ring-1 ring-emerald-200",
    trackClassName: "stroke-emerald-100",
    progressClassName: "stroke-emerald-500",
    valueClassName: "text-emerald-700",
    labelClassName: "text-emerald-600",
    helperClassName: "text-emerald-500",
    footerClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
    barClassName: "[&>div]:bg-emerald-500",
  };
}
