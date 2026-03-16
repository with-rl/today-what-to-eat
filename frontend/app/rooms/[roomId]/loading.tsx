export default function RoomLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white/70 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:bg-slate-950/70 dark:ring-slate-800/70">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-64 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1.1fr)]">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            {Array.from({ length: 3 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

