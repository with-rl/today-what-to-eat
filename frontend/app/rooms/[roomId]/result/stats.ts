import type { RoomResultCandidate } from "@/lib/types/domain";

export function getTotalVotes(candidates: RoomResultCandidate[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.votesCount, 0);
}

export function getMaxVotes(candidates: RoomResultCandidate[]): number {
  return candidates.reduce(
    (max, candidate) => Math.max(max, candidate.votesCount),
    0,
  );
}

