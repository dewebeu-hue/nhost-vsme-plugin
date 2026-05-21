import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  label: string;
  helper?: string;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
};

export function ProgressRing({
  value,
  label,
  helper,
  size = 148,
  stroke = 12,
  className,
  trackClassName,
  progressClassName,
  valueClassName,
  labelClassName,
  helperClassName,
}: ProgressRingProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${normalizedValue}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("stroke-slate-200", trackClassName)}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("stroke-blue-600", progressClassName)}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("text-3xl font-semibold tracking-tight text-slate-950", valueClassName)}>
          {normalizedValue}%
        </span>
        <span
          className={cn(
            "mt-0.5 max-w-[70%] text-center text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.08em] text-slate-500 break-words",
            labelClassName,
          )}
        >
          {label}
        </span>
        {helper ? (
          <span className={cn("mt-1 text-xs text-slate-500", helperClassName)}>{helper}</span>
        ) : null}
      </div>
    </div>
  );
}
