import type { RoomResultCandidate, RoomResultWinner } from "@/lib/types/domain";

interface CandidateBreakdownProps {
  candidates: RoomResultCandidate[];
  winner: RoomResultWinner | null;
  maxVotes: number;
}

export function CandidateBreakdown({
  candidates,
  winner,
  maxVotes,
}: CandidateBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          후보별 득표 현황
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          막대 길이는 각 메뉴의 상대적인 득표수를 나타내요.
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700">
          아직 등록된 메뉴 후보가 없어요. 먼저 투표 방에서 메뉴를 제안해보세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {candidates.map((candidate) => {
            const isWinner =
              !!winner && candidate.candidateId === winner.candidateId;
            const ratio = maxVotes > 0 ? candidate.votesCount / maxVotes : 0;
            const widthPercent = `${Math.max(ratio * 100, 8)}%`;

            return (
              <li
                key={candidate.candidateId}
                className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isWinner ? (
                      <span className="inline-flex h-5 items-center rounded-full bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-700/70">
                        오늘의 메뉴
                      </span>
                    ) : null}
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                      {candidate.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    {candidate.votesCount}표
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isWinner ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                    }`}
                    style={{ width: widthPercent }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

