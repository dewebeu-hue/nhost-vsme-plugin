import { Quote } from "lucide-react";
import { socialProofCopy } from "@/lib/copy";

export function SocialProof() {
  return (
    <section id="resources" className="px-6 py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          {socialProofCopy.logos.map((logo) => (
            <div
              key={logo}
              className="flex min-h-20 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm font-semibold text-slate-500"
            >
              {logo}
            </div>
          ))}
        </div>

        <figure className="supplier-surface grid gap-8 rounded-[2rem] border-0 p-8 lg:grid-cols-[auto_1fr] lg:p-10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Quote aria-hidden="true" className="size-7" />
          </div>
          <div>
            <blockquote className="text-2xl font-semibold leading-10 tracking-tight text-slate-950">
              “{socialProofCopy.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm font-medium text-slate-600">
              {socialProofCopy.person}, {socialProofCopy.role}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
