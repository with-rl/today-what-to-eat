import Link from "next/link";
import type { VoteRoom } from "@/lib/types/domain";

interface RoomHeaderProps {
  roomId: string;
  room: VoteRoom;
  prettyExpiresAt: string | null;
  isClosed: boolean;
  hasCandidates: boolean;
}

export function RoomHeader({
  roomId,
  room,
  prettyExpiresAt,
  isClosed,
  hasCandidates,
}: RoomHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
          오늘 뭐 먹지 · 투표 방
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {room.title}
        </h1>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          {room.teamId ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {room.teamId}
            </span>
          ) : null}
          {prettyExpiresAt ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {prettyExpiresAt} 마감
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              마감 시간 없음 · 자유 투표
            </span>
          )}
          {isClosed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/25 dark:text-rose-200 dark:ring-rose-700/60">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              마감된 투표
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-200 dark:ring-emerald-700/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              투표 진행 중
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {hasCandidates ? "메뉴 후보가 등록되어 있어요" : "아직 등록된 메뉴 후보가 없어요"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 text-[11px] text-slate-600 sm:flex-col sm:items-end dark:text-slate-300">
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-right text-slate-50 shadow-sm dark:bg-slate-900/90">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            공유 링크
          </p>
          <p className="mt-1 font-mono text-[11px] text-slate-100">
            /rooms/{roomId}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            href={`/rooms/${roomId}/result`}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-medium text-slate-50 shadow-sm transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            투표 결과 보기
          </Link>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
          >
            다른 방 만들기
          </Link>
        </div>
      </div>
    </header>
  );
}

