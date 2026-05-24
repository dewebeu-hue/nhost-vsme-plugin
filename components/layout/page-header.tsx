import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  subtitle: ReactNode;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-base leading-7 text-slate-600">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
