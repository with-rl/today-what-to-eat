export type UUID = string;

export interface Team {
  id: string;
  name: string;
}

export interface VoteRoom {
  id: UUID;
  title: string;
  teamId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface MenuCandidate {
  id: UUID;
  roomId: UUID;
  name: string;
  description: string | null;
}

export interface Vote {
  id: UUID;
  roomId: UUID;
  candidateId: UUID;
  voterId: string | null;
  createdAt: string;
}

export interface MealHistory {
  id: UUID;
  roomId: UUID;
  finalCandidateId: UUID;
  decidedAt: string;
}

export interface CandidateWithVotes extends MenuCandidate {
  votesCount: number;
}

export interface RoomDetail {
  room: VoteRoom;
  candidates: CandidateWithVotes[];
  myVote: {
    candidateId: UUID;
  } | null;
}

export interface VoteSummaryCandidate {
  candidateId: UUID;
  votesCount: number;
}

export interface VoteSummary {
  candidates: VoteSummaryCandidate[];
  myVote: {
    candidateId: UUID;
  } | null;
}

export interface RoomResultWinner {
  candidateId: UUID;
  name: string;
  description: string | null;
  votesCount: number;
}

export interface RoomResultCandidate {
  candidateId: UUID;
  name: string;
  votesCount: number;
}

export interface RoomResult {
  roomId: UUID;
  winner: RoomResultWinner | null;
  tieBreakRule: "earliest" | "random" | string;
  candidates: RoomResultCandidate[];
}

export interface HistoryItem {
  id: UUID;
  decidedAt: string;
  roomId: UUID;
  menuName: string;
}

