import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HistoryItem } from "@/lib/types/domain";

interface GetRecentHistoryOptions {
  teamId?: string | null;
  limit?: number;
}

type RecentHistoryRow = {
  id: string;
  decided_at: string;
  room_id: string;
  menu_candidates?: { name?: string | null } | null;
  vote_rooms?: { team_id?: string | null } | { team_id?: string | null }[] | null;
};

function getTeamIdFromRow(row: RecentHistoryRow): string | null {
  const rawVoteRooms = row.vote_rooms;
  if (rawVoteRooms == null) return null;
  if (Array.isArray(rawVoteRooms)) return rawVoteRooms[0]?.team_id ?? null;
  return rawVoteRooms.team_id ?? null;
}

export async function getRecentHistory(
  options: GetRecentHistoryOptions = {},
): Promise<HistoryItem[]> {
  const { teamId = null } = options;
  const limit = Number.isFinite(options.limit) && (options.limit ?? 0) > 0
    ? Math.min(Math.max(options.limit ?? 10, 1), 50)
    : 10;

  const supabase = getSupabaseServerClient();

  if (teamId && teamId.trim().length > 0) {
    const keyword = teamId.trim();
    const { data, error } = await supabase
      .from("meal_history")
      .select(
        "id, decided_at, room_id, final_candidate_id, vote_rooms!inner(team_id), menu_candidates!inner(name)",
      )
      .ilike("vote_rooms.team_id", `%${keyword}%`)
      .order("decided_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      throw error ?? new Error("Failed to load meal history with team filter");
    }

    return (data as RecentHistoryRow[]).map((row) => ({
      id: row.id,
      decidedAt: row.decided_at,
      roomId: row.room_id,
      teamId: getTeamIdFromRow(row),
      menuName: row.menu_candidates?.name ?? "",
    }));
  }

  const { data, error } = await supabase
    .from("meal_history")
    .select(
      "id, decided_at, room_id, final_candidate_id, vote_rooms(team_id), menu_candidates(name)",
    )
    .order("decided_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    throw error ?? new Error("Failed to load meal history");
  }

  return (data as RecentHistoryRow[]).map((row) => ({
    id: row.id,
    decidedAt: row.decided_at,
    roomId: row.room_id,
    teamId: getTeamIdFromRow(row),
    menuName: row.menu_candidates?.name ?? "",
  }));
}

