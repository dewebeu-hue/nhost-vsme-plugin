type RouteLoadingSkeletonProps = {
  variant?: "dashboard" | "detail" | "public";
};

export function RouteLoadingSkeleton({ variant = "dashboard" }: RouteLoadingSkeletonProps) {
  if (variant === "public") {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-6">
          <SkeletonBlock className="h-36" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4">
              <SkeletonBlock className="h-48" />
              <SkeletonBlock className="h-64" />
            </div>
            <SkeletonBlock className="h-72" />
          </div>
        </div>
      </main>
    );
  }

  if (variant === "detail") {
    return (
      <div className="grid gap-6">
        <SkeletonHeader />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <SkeletonBlock className="h-44" />
            <SkeletonBlock className="h-80" />
          </div>
          <div className="grid gap-4">
            <SkeletonBlock className="h-36" />
            <SkeletonBlock className="h-52" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SkeletonHeader />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="grid gap-3">
      <SkeletonBlock className="h-9 w-full max-w-sm" />
      <SkeletonBlock className="h-5 w-full max-w-2xl" />
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/5 ${className}`}
    />
  );
}
