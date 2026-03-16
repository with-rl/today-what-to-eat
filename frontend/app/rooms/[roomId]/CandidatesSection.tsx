'use client';

import { useEffect, useState } from "react";
import type {
  CandidateWithVotes,
  MenuCandidate,
  VoteSummary,
  VoteSummaryCandidate,
} from "@/lib/types/domain";

interface CandidatesSectionProps {
  roomId: string;
  initialCandidates: CandidateWithVotes[];
  initialMyVoteCandidateId: string | null;
}

interface CreateVoteResponse {
  summary: VoteSummary;
}

export function CandidatesSection({
  roomId,
  initialCandidates,
  initialMyVoteCandidateId,
}: CandidatesSectionProps) {
  const [candidates, setCandidates] =
    useState<CandidateWithVotes[]>(initialCandidates);
  const [myVoteCandidateId, setMyVoteCandidateId] = useState<
    string | null
  >(initialMyVoteCandidateId);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCreated = (event: Event) => {
      const customEvent = event as CustomEvent<MenuCandidate>;
      const created = customEvent.detail;
      if (!created) return;

      setCandidates((prev) => {
        const exists = prev.some((candidate) => candidate.id === created.id);
        if (exists) {
          return prev;
        }

        const next: CandidateWithVotes = {
          id: created.id,
          roomId: created.roomId,
          name: created.name,
          description: created.description,
          votesCount: 0,
        };

        return [...prev, next];
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("candidate:created", handleCreated);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("candidate:created", handleCreated);
      }
    };
  }, []);

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.votesCount,
    0,
  );

  const applySummaryToCandidates = (summary: VoteSummary) => {
    const countsById = new Map<string, number>();
    summary.candidates.forEach(
      (item: VoteSummaryCandidate) =>
        countsById.set(item.candidateId, item.votesCount),
    );

    setCandidates((prev) =>
      prev.map((candidate) => ({
        ...candidate,
        votesCount: countsById.get(candidate.id) ?? 0,
      })),
    );
    setMyVoteCandidateId(summary.myVote?.candidateId ?? null);
  };

  const handleVote = async (candidateId: string) => {
    setErrorMessage(null);
    setIsVoting(candidateId);
    try {
      const response = await fetch(`/api/v1/rooms/${roomId}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidateId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setErrorMessage(
          payload?.message ??
            "투표에 실패했어요. 잠시 후 다시 시도해주세요.",
        );
        setIsVoting(null);
        return;
      }

      const data = (await response.json()) as CreateVoteResponse;
      applySummaryToCandidates(data.summary);
      setIsVoting(null);
    } catch (error) {
      setErrorMessage(
        "네트워크 오류가 발생했어요. 인터넷 연결을 확인한 뒤 다시 시도해주세요.",
      );
      setIsVoting(null);
    }
  };

  const hasCandidates = candidates.length > 0;

  if (!hasCandidates) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-[13px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <p className="font-medium">
          아직 등록된 메뉴 후보가 없어요. 팀원들과 함께 첫 메뉴를 제안해볼까요?
        </p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          아래 폼에서 메뉴를 추가하면 이곳에 후보 목록이 쌓이고, 나중에 투표 기능을
          통해 가장 먹고 싶은 메뉴를 고를 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-500/60 dark:bg-rose-900/40 dark:text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/60 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
        {candidates.map((candidate) => {
          const isMyVote = myVoteCandidateId === candidate.id;
          const percentage =
            totalVotes > 0
              ? Math.round((candidate.votesCount / totalVotes) * 100)
              : 0;

          return (
            <li
              key={candidate.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                  {candidate.name}
                </p>
                {candidate.description ? (
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {candidate.description}
                  </p>
                ) : null}
                {isMyVote ? (
                  <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    내가 선택한 메뉴예요
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                    {candidate.votesCount}표
                  </p>
                  {totalVotes > 0 ? (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {percentage}%
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      아직 투표 없음
                    </p>
                  )}
                </div>
                <div className="h-8 w-1 rounded-full bg-slate-200 dark:bg-slate-700">
                  {totalVotes > 0 && candidate.votesCount > 0 ? (
                    <div
                      className="h-full w-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                      style={{
                        transformOrigin: "bottom",
                        transform: `scaleY(${
                          Math.max(
                            0.1,
                            candidate.votesCount / totalVotes,
                          ) || 0.1
                        })`,
                      }}
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleVote(candidate.id)}
                  disabled={isVoting !== null}
                  className={`inline-flex cursor-pointer items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
                    isMyVote
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-400"
                      : "bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-indigo-500 dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  } ${
                    isVoting ? "disabled:cursor-wait disabled:opacity-70" : ""
                  }`}
                >
                  {isVoting === candidate.id
                    ? "투표 중..."
                    : isMyVote
                    ? "내 투표 변경"
                    : "이 메뉴에 투표"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

