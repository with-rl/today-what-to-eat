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

type VoteRoomRow = {
  id: string;
  title: string;
  team_id: string | null;
  expires_at: string | null;
  status?: string | null;
  closed_at?: string | null;
  created_at: string;
};

function isExpired(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() <= now.getTime();
}

async function closeRoomIfExpired(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  roomRow: VoteRoomRow,
): Promise<VoteRoomRow> {
  const currentStatus = (roomRow.status ?? "open").toString();
  if (currentStatus === "closed") {
    return roomRow;
  }

  if (!isExpired(roomRow.expires_at)) {
    return roomRow;
  }

  const { data: updatedRoom, error: updateError } = await supabase
    .from("vote_rooms")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", roomRow.id)
    .eq("status", "open")
    .select("*")
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }

  return (updatedRoom as VoteRoomRow | null) ?? roomRow;
}

type MealHistoryRow = {
  id: string;
  room_id: string;
  final_candidate_id: string;
  decided_at: string;
};

export async function ensureMealHistoryForClosedRoom(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  roomId: string,
  finalCandidateId: string,
): Promise<MealHistoryRow | null> {
  const { data: existing, error: existingError } = await supabase
    .from("meal_history")
    .select("id, room_id, final_candidate_id, decided_at")
    .eq("room_id", roomId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing as MealHistoryRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("meal_history")
    .insert({
      room_id: roomId,
      final_candidate_id: finalCandidateId,
    })
    .select("id, room_id, final_candidate_id, decided_at")
    .single();

  if (insertError) {
    // UNIQUE 제약(방 당 1회 확정)에 걸렸으면 다시 조회해서 반환
    if ((insertError as { code?: string } | null)?.code === "23505") {
      const { data: duplicated, error: duplicatedError } = await supabase
        .from("meal_history")
        .select("id, room_id, final_candidate_id, decided_at")
        .eq("room_id", roomId)
        .single();

      if (duplicatedError) {
        throw duplicatedError;
      }

      return duplicated as MealHistoryRow;
    }

    throw insertError;
  }

  return (inserted as MealHistoryRow | null) ?? null;
}

export async function getRoomDetail(roomId: string): Promise<RoomDetail | null> {
  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_id")?.value ?? null;

  const supabase = getSupabaseServerClient();

  const { data: rawRoomRow, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !rawRoomRow) {
    if (roomError?.code === "PGRST116" || roomError?.code === "PGRST123") {
      return null;
    }
    throw roomError ?? new Error("Failed to load vote room");
  }

  const roomRow = await closeRoomIfExpired(
    supabase,
    rawRoomRow as VoteRoomRow,
  );

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
    status: roomRow.status ?? "open",
    closedAt: roomRow.closed_at ?? null,
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

  const { data: rawRoomRow, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !rawRoomRow) {
    if (roomError?.code === "PGRST116" || roomError?.code === "PGRST123") {
      return null;
    }
    throw roomError ?? new Error("Failed to load vote room");
  }

  const roomRow = await closeRoomIfExpired(
    supabase,
    rawRoomRow as VoteRoomRow,
  );

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

  const status = roomRow.status ?? "open";
  const isClosed = status === "closed" || isExpired(roomRow.expires_at);
  let decidedAt: string | null = null;

  if (isClosed && winner) {
    const history = await ensureMealHistoryForClosedRoom(
      supabase,
      roomRow.id,
      winner.candidateId,
    );
    decidedAt = history?.decided_at ?? null;
  } else {
    // closed인데 winner가 없으면(투표 0표 등) 이력은 만들지 않음
    const { data: existingHistory, error: existingHistoryError } = await supabase
      .from("meal_history")
      .select("decided_at")
      .eq("room_id", roomRow.id)
      .maybeSingle();

    if (existingHistoryError) {
      throw existingHistoryError;
    }

    decidedAt = (existingHistory as { decided_at?: string } | null)?.decided_at ?? null;
  }

  const result: RoomResult = {
    roomId: roomRow.id,
    status,
    decidedAt,
    winner,
    tieBreakRule: "earliest",
    candidates,
  };

  return result;
}

