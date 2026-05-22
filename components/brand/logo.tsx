import { cn } from "@/lib/utils";

type LogoProps = {
  ariaLabel?: string;
  className?: string;
  markClassName?: string;
  size?: "sm" | "md" | "lg";
  theme?: "auto" | "light" | "dark";
  variant?: "full" | "icon";
};

const logoSizeClasses = {
  sm: {
    root: "gap-2",
    mark: "size-8 rounded-xl",
    icon: "size-5",
    title: "text-sm leading-5",
    subtitle: "text-[0.62rem] leading-4 tracking-[0.15em]",
  },
  md: {
    root: "gap-2.5",
    mark: "size-10 rounded-xl",
    icon: "size-6",
    title: "text-[0.95rem] leading-5",
    subtitle: "text-[0.68rem] leading-4 tracking-[0.17em]",
  },
  lg: {
    root: "gap-3",
    mark: "size-12 rounded-2xl",
    icon: "size-7",
    title: "text-lg leading-6",
    subtitle: "text-xs leading-4 tracking-[0.2em]",
  },
} as const;

const logoThemeClasses = {
  auto: {
    mark: "ring-white/70 shadow-blue-600/20",
    title: "text-slate-950",
    subtitle: "text-slate-500",
  },
  light: {
    mark: "ring-white/70 shadow-blue-600/20",
    title: "text-slate-950",
    subtitle: "text-slate-500",
  },
  dark: {
    mark: "ring-cyan-100/35 shadow-cyan-950/30",
    title: "text-white",
    subtitle: "text-cyan-100/75",
  },
} as const;

export function Logo({
  ariaLabel = "Supplier Passport",
  className,
  markClassName,
  size = "md",
  theme = "auto",
  variant = "full",
}: LogoProps) {
  const sizeClasses = logoSizeClasses[size];
  const themeClasses = logoThemeClasses[theme];

  return (
    <div
      aria-label={variant === "icon" ? ariaLabel : undefined}
      className={cn("brand-logo flex min-w-0 items-center", sizeClasses.root, className)}
      role={variant === "icon" ? "img" : undefined}
    >
      <SupplierPassportMark
        className={cn(
          "brand-logo-mark",
          sizeClasses.mark,
          themeClasses.mark,
          markClassName,
        )}
        iconClassName={sizeClasses.icon}
      />
      {variant === "full" ? (
        <div className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate font-semibold tracking-tight",
              themeClasses.title,
              sizeClasses.title,
            )}
            data-brand-title
          >
            Supplier Passport
          </span>
          <span
            className={cn(
              "truncate font-medium uppercase",
              themeClasses.subtitle,
              sizeClasses.subtitle,
            )}
            data-brand-subtitle
          >
            VSME READY
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SupplierPassportMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 text-white shadow-lg ring-1",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("drop-shadow-sm", iconClassName)}
      >
        <path
          d="M9.25 5.5h10.7l4.8 4.8v16.2a2 2 0 0 1-2 2H9.25a2 2 0 0 1-2-2v-19a2 2 0 0 1 2-2Z"
          fill="rgb(255 255 255 / 0.18)"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <path
          d="M19.75 5.85v4.2a1 1 0 0 0 1 1h4.1"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18.25" r="5.35" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10.95 18.25h10.1M16 12.9c1.45 1.55 2.15 3.3 2.15 5.35S17.45 22.05 16 23.6M16 12.9c-1.45 1.55-2.15 3.3-2.15 5.35s.7 3.8 2.15 5.35"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="pointer-events-none absolute inset-x-2 top-1 h-px bg-white/55" />
    </span>
  );
}
