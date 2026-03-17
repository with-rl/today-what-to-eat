import type { RoomResultWinner } from "@/lib/types/domain";

interface WinnerCardProps {
  winner: RoomResultWinner | null;
  isClosed: boolean;
  decidedAt: string | null;
}

export function WinnerCard({ winner, isClosed, decidedAt }: WinnerCardProps) {
  return (
    <div className="rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:ring-emerald-700/60">
      {winner ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              {isClosed ? "최종 선택된 메뉴" : "현재 1등 메뉴"}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-emerald-900 dark:text-emerald-50">
              {winner.name}
            </p>
            {winner.description ? (
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-100/80">
                {winner.description}
              </p>
            ) : null}
            {isClosed && decidedAt ? (
              <p className="mt-2 text-[11px] text-emerald-800/70 dark:text-emerald-100/70">
                {decidedAt} 확정
              </p>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-50 shadow-sm">
              {winner.votesCount}표
            </span>
            <span className="hidden text-[11px] text-emerald-800/80 sm:inline dark:text-emerald-100/80">
              동점일 경우 먼저 제안된 메뉴가 선택돼요.
            </span>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            {isClosed ? "최종 메뉴를 결정할 수 없어요" : "아직 1등 메뉴가 없어요"}
          </p>
          <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-100/80">
            {isClosed
              ? "투표가 없거나 모든 메뉴의 득표수가 0표라서 최종 메뉴를 결정할 수 없어요."
              : "투표가 없거나 모든 메뉴의 득표수가 0표라서 현재 1등을 결정할 수 없어요. 조금 더 투표가 모이면 다시 확인해 주세요."}
          </p>
        </div>
      )}
    </div>
  );
}

