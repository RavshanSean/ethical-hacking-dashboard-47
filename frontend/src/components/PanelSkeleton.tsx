export function PanelSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] ${className}`}
    >
      <div className="h-full min-h-[8rem] rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent" />
    </div>
  );
}

export function AuthSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-white">
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.45em] text-[var(--accent)]">
          EHD #47
        </p>
        <p className="mt-3 text-sm text-white/50">Preparing your workspace</p>
      </div>
    </div>
  );
}
