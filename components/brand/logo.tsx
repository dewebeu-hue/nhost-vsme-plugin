import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
};

export function Logo({ className, markClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-blue-600/20",
          markClassName,
        )}
      >
        <ShieldCheck aria-hidden="true" className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold tracking-tight text-slate-950">
          Supplier Passport
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          VSME Ready
        </span>
      </div>
    </div>
  );
}
