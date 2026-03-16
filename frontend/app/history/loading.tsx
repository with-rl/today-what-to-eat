export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-3xl bg-white/70 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:bg-slate-950/70 dark:ring-slate-800/70">
      <div className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-64 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-full max-w-md rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

