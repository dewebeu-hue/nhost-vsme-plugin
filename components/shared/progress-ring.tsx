import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  label: string;
  helper?: string;
  size?: number;
  stroke?: number;
  className?: string;
};

export function ProgressRing({
  value,
  label,
  helper,
  size = 148,
  stroke = 12,
  className,
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
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0B5CFF"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-950">
          {normalizedValue}%
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        {helper ? <span className="mt-1 text-xs text-slate-500">{helper}</span> : null}
      </div>
    </div>
  );
}
