import type { CandidateWithVotes } from "@/lib/types/domain";

export function getTotalVotes(candidates: CandidateWithVotes[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.votesCount, 0);
}

