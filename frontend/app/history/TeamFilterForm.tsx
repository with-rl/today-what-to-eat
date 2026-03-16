'use client';

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function TeamFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("teamId") ?? "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("teamId", trimmed);
    } else {
      params.delete("teamId");
    }

    router.push(`/history?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:gap-3 sm:text-xs"
    >
      <div className="flex-1">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="팀 이름으로 이력을 검색해보세요. 예: 디팀, 디자"
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>
      <button
        type="submit"
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
      >
        팀 이름으로 이력 검색
      </button>
    </form>
  );
}

