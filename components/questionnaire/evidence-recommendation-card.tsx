import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type EvidenceRecommendationCardProps = {
  recommendations: readonly string[];
};

export function EvidenceRecommendationCard({
  recommendations,
}: EvidenceRecommendationCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-slate-950">
        Evidence recommendations
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {recommendations.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" />
            {item}
          </li>
        ))}
      </ul>
      <Button className="mt-5 w-full shadow-lg shadow-blue-600/15">
        <Upload data-icon="inline-start" />
        Upload evidence
      </Button>
    </section>
  );
}
