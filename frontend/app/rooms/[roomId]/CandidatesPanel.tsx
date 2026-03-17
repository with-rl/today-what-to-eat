import type { CandidateWithVotes } from "@/lib/types/domain";
import { CandidatesSection } from "./CandidatesSection";

interface CandidatesPanelProps {
  roomId: string;
  candidates: CandidateWithVotes[];
  myVoteCandidateId: string | null;
  isClosed: boolean;
  totalVotes: number;
}

export function CandidatesPanel({
  roomId,
  candidates,
  myVoteCandidateId,
  isClosed,
  totalVotes,
}: CandidatesPanelProps) {
  const hasCandidates = candidates.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          메뉴 후보 및 현재 득표 상황
        </h2>
        {hasCandidates && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            현재 총 <span className="font-semibold">{totalVotes}</span>표가 모였어요.
          </p>
        )}
      </div>

      <CandidatesSection
        roomId={roomId}
        initialCandidates={candidates}
        initialMyVoteCandidateId={myVoteCandidateId}
        isClosed={isClosed}
      />
    </section>
  );
}

