import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  ariaLabel?: string;
  className?: string;
  markClassName?: string;
  size?: "sm" | "md" | "lg" | "sidebar" | "landing";
  theme?: "auto" | "light" | "dark";
  variant?: "full" | "icon";
};

const logoSizeClasses = {
  sm: {
    root: "h-9 w-[150px] rounded-lg",
    image: "h-9 w-[150px]",
  },
  md: {
    root: "h-11 w-[184px] rounded-xl",
    image: "h-11 w-[184px]",
  },
  lg: {
    root: "h-14 w-[234px] rounded-2xl",
    image: "h-14 w-[234px]",
  },
  sidebar: {
    root: "h-14 w-[168px] rounded-xl",
    image: "h-14 w-[168px]",
  },
} as const;

const markSizeClasses = {
  sm: "size-8 rounded-xl",
  md: "size-10 rounded-xl",
  lg: "size-12 rounded-2xl",
  sidebar: "size-11 rounded-[14px]",
  landing: "size-11 rounded-[14px] md:size-12 md:rounded-2xl",
} as const;

const logoThemeClasses = {
  auto: "",
  light: "",
  dark: "",
} as const;

export function Logo({
  ariaLabel = "Supplier Passport",
  className,
  markClassName,
  size = "md",
  theme = "auto",
  variant = "full",
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(
          "brand-logo brand-logo-mark relative inline-flex shrink-0 overflow-hidden bg-white shadow-lg ring-1",
          markSizeClasses[size],
          logoThemeClasses[theme],
          markClassName,
          className,
        )}
        role="img"
      >
        <Image
          src="/brand/supplier-passport-mark.svg"
          alt=""
          fill
          sizes={size === "sidebar" ? "44px" : "48px"}
          className="object-contain"
          priority={size === "lg" || size === "sidebar"}
        />
      </span>
    );
  }

  if (size === "sidebar" || size === "landing") {
    const isLanding = size === "landing";
    const isDark = theme === "dark";

    return (
      <span
        className={cn(
          "brand-logo inline-flex min-w-0 shrink-0 items-center",
          isLanding
            ? "brand-logo-landing gap-3"
            : "brand-logo-sidebar gap-3",
          logoThemeClasses[theme],
          className,
        )}
      >
        <span
          className={cn(
            "brand-logo-mark relative inline-flex shrink-0 overflow-hidden bg-white shadow-md ring-1 ring-slate-200",
            isLanding ? "size-11 rounded-[14px] md:size-12 md:rounded-2xl" : "size-11 rounded-[14px]",
            markClassName,
          )}
        >
          <Image
            src="/brand/supplier-passport-mark.svg"
            alt=""
            fill
            sizes={isLanding ? "(min-width: 768px) 48px, 44px" : "44px"}
            className="object-contain"
            priority
          />
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-bold text-slate-950",
              isLanding
                ? "brand-logo-landing-title text-[15px] leading-5 md:text-[17px] md:leading-[22px]"
                : "brand-logo-sidebar-title text-[16px] leading-5",
              isDark && "text-white",
            )}
          >
            Supplier Passport
          </span>
          <span
            className={cn(
              "mt-0.5 block truncate font-semibold uppercase text-slate-500",
              isLanding
                ? "brand-logo-landing-subtitle text-[10px] leading-[13px] tracking-[0.18em] md:text-[11px] md:leading-[14px]"
                : "brand-logo-sidebar-subtitle text-[11px] leading-[14px] tracking-[0.18em]",
              isDark && "text-slate-300",
            )}
          >
            VSME READY
          </span>
        </span>
      </span>
    );
  }

  const sizeClasses = logoSizeClasses[size];

  return (
    <span
      className={cn(
        "brand-logo relative inline-flex shrink-0 overflow-hidden",
        sizeClasses.root,
        logoThemeClasses[theme],
        className,
      )}
    >
      {theme !== "dark" ? (
        <Image
          src="/brand/supplier-passport-logo.svg"
          alt={ariaLabel}
          fill
          sizes={getLogoSizes(size)}
          className={cn(
            "brand-logo-light-auto object-contain",
            sizeClasses.image,
          )}
          priority={size === "lg"}
        />
      ) : null}
      {theme !== "light" ? (
        <Image
          src="/brand/supplier-passport-logo-dark.svg"
          alt={theme === "dark" ? ariaLabel : ""}
          fill
          sizes={getLogoSizes(size)}
          className={cn(
            "object-contain",
            theme === "auto" ? "brand-logo-dark-auto hidden" : "block",
            sizeClasses.image,
          )}
          priority={size === "lg"}
        />
      ) : null}
    </span>
  );
}

function getLogoSizes(size: NonNullable<LogoProps["size"]>) {
  if (size === "lg") {
    return "234px";
  }

  if (size === "sidebar") {
    return "168px";
  }

  if (size === "sm") {
    return "150px";
  }

  return "184px";
}
