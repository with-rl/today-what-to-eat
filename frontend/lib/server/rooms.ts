import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CandidateWithVotes,
  RoomDetail,
  RoomResult,
  RoomResultCandidate,
  RoomResultWinner,
  VoteRoom,
} from "@/lib/types/domain";

export async function getRoomDetail(roomId: string): Promise<RoomDetail | null> {
  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_id")?.value ?? null;

  const supabase = getSupabaseServerClient();

  const { data: roomRow, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !roomRow) {
    if (roomError?.code === "PGRST116" || roomError?.code === "PGRST123") {
      return null;
    }
    throw roomError ?? new Error("Failed to load vote room");
  }

  const { data: candidateRows, error: candidatesError } = await supabase
    .from("menu_candidates")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (candidatesError || !candidateRows) {
    throw candidatesError ?? new Error("Failed to load menu candidates");
  }

  const { data: voteRows, error: votesError } = await supabase
    .from("votes")
    .select("candidate_id, voter_id")
    .eq("room_id", roomId);

  if (votesError || !voteRows) {
    throw votesError ?? new Error("Failed to load votes");
  }

  const voteCountByCandidateId = new Map<string, number>();
  let myCandidateId: string | null = null;
  for (const vote of voteRows) {
    const key = vote.candidate_id as string;
    voteCountByCandidateId.set(key, (voteCountByCandidateId.get(key) ?? 0) + 1);
    if (voterId && vote.voter_id === voterId) {
      myCandidateId = key;
    }
  }

  const room: VoteRoom = {
    id: roomRow.id,
    title: roomRow.title,
    teamId: roomRow.team_id,
    expiresAt: roomRow.expires_at,
    createdAt: roomRow.created_at,
  };

  const candidates: CandidateWithVotes[] = candidateRows.map((candidate) => ({
    id: candidate.id,
    roomId: candidate.room_id,
    name: candidate.name,
    description: candidate.description,
    votesCount: voteCountByCandidateId.get(candidate.id) ?? 0,
  }));

  return {
    room,
    candidates,
    myVote: myCandidateId
      ? {
          candidateId: myCandidateId,
        }
      : null,
  };
}

export async function getRoomResult(roomId: string): Promise<RoomResult | null> {
  const supabase = getSupabaseServerClient();

  const { data: roomRow, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !roomRow) {
    if (roomError?.code === "PGRST116" || roomError?.code === "PGRST123") {
      return null;
    }
    throw roomError ?? new Error("Failed to load vote room");
  }

  const { data: candidateRows, error: candidatesError } = await supabase
    .from("menu_candidates")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (candidatesError || !candidateRows) {
    throw candidatesError ?? new Error("Failed to load menu candidates");
  }

  const { data: voteRows, error: votesError } = await supabase
    .from("votes")
    .select("candidate_id")
    .eq("room_id", roomId);

  if (votesError || !voteRows) {
    throw votesError ?? new Error("Failed to load votes");
  }

  const voteCountByCandidateId = new Map<string, number>();
  for (const vote of voteRows) {
    const key = vote.candidate_id as string;
    voteCountByCandidateId.set(key, (voteCountByCandidateId.get(key) ?? 0) + 1);
  }

  const candidates: RoomResultCandidate[] = candidateRows.map((candidate) => ({
    candidateId: candidate.id,
    name: candidate.name,
    votesCount: voteCountByCandidateId.get(candidate.id) ?? 0,
  }));

  let winner: RoomResultWinner | null = null;

  if (candidates.length > 0) {
    const sortedByVotesAndCreatedAt = [...candidateRows].sort((a, b) => {
      const aVotes = voteCountByCandidateId.get(a.id) ?? 0;
      const bVotes = voteCountByCandidateId.get(b.id) ?? 0;

      if (bVotes !== aVotes) {
        return bVotes - aVotes;
      }

      const aCreated = new Date(a.created_at).getTime();
      const bCreated = new Date(b.created_at).getTime();

      return aCreated - bCreated;
    });

    const topCandidate = sortedByVotesAndCreatedAt[0];
    const topVotes = voteCountByCandidateId.get(topCandidate.id) ?? 0;

    if (topVotes > 0) {
      winner = {
        candidateId: topCandidate.id,
        name: topCandidate.name,
        description: topCandidate.description,
        votesCount: topVotes,
      };
    }
  }

  const result: RoomResult = {
    roomId: roomRow.id,
    winner,
    tieBreakRule: "earliest",
    candidates,
  };

  return result;
}

