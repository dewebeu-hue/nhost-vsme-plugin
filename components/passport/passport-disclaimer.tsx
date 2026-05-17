import { Info } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";

type PassportDisclaimerProps = {
  text: string;
  title?: string;
};

export function PassportDisclaimer({ text, title = "Important disclaimer" }: PassportDisclaimerProps) {
  return (
    <SectionCard
      title={title}
      action={
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Info aria-hidden="true" />
        </div>
      }
    >
      <p className="text-sm leading-7 text-slate-600">{text}</p>
    </SectionCard>
  );
}
