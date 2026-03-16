import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HistoryItem } from "@/lib/types/domain";
import { getRecentHistory } from "./history";

export interface LatestRoomSummary {
  id: string;
  title: string;
  teamId: string | null;
  expiresAt: string | null;
  createdAt: string;
  totalCandidates: number;
  totalParticipants: number;
}

export interface LatestResultSummary {
  roomId: string;
  decidedAt: string;
  menuName: string;
  votesCount: number;
}

export interface HomeSummary {
  latestRoom: LatestRoomSummary | null;
  latestResult: LatestResultSummary | null;
  recentHistory: HistoryItem[];
}

export async function getHomeSummary(): Promise<HomeSummary> {
  const supabase = getSupabaseServerClient();

  // 1) 가장 최근에 생성된 투표 방 하나 조회
  const { data: roomRow, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let latestRoom: LatestRoomSummary | null = null;

  if (roomError) {
    throw roomError;
  }

  if (roomRow) {
    const roomId = roomRow.id as string;

    const [{ data: candidateRows }, { data: voteRows }] = await Promise.all([
      supabase
        .from("menu_candidates")
        .select("id")
        .eq("room_id", roomId),
      supabase
        .from("votes")
        .select("voter_id")
        .eq("room_id", roomId),
    ]);

    const totalCandidates = candidateRows?.length ?? 0;
    const participantIds = new Set<string>();
    (voteRows ?? []).forEach((row: any) => {
      if (row.voter_id) {
        participantIds.add(row.voter_id as string);
      }
    });

    latestRoom = {
      id: roomRow.id,
      title: roomRow.title,
      teamId: roomRow.team_id,
      expiresAt: roomRow.expires_at,
      createdAt: roomRow.created_at,
      totalCandidates,
      totalParticipants: participantIds.size,
    };
  }

  // 2) 최근 확정된 결과 한 건 + 해당 메뉴의 득표 수
  const { data: historyRow, error: historyError } = await supabase
    .from("meal_history")
    .select(
      "id, room_id, final_candidate_id, decided_at, menu_candidates(name)",
    )
    .order("decided_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyError) {
    throw historyError;
  }

  let latestResult: LatestResultSummary | null = null;

  if (historyRow) {
    const { data: votesForWinner, error: votesError } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("room_id", historyRow.room_id)
      .eq("candidate_id", historyRow.final_candidate_id);

    if (votesError) {
      throw votesError;
    }

    latestResult = {
      roomId: historyRow.room_id,
      decidedAt: historyRow.decided_at,
      menuName: historyRow.menu_candidates?.name ?? "",
      votesCount: votesForWinner?.length ?? 0,
    };
  }

  // 3) 최근 메뉴 이력 2개
  const recentHistory = await getRecentHistory({ limit: 2 });

  return {
    latestRoom,
    latestResult,
    recentHistory,
  };
}

