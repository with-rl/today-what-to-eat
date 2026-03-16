import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HistoryItem } from "@/lib/types/domain";

interface GetRecentHistoryOptions {
  teamId?: string | null;
  limit?: number;
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
    const { data, error } = await supabase
      .from("meal_history")
      .select(
        "id, decided_at, room_id, final_candidate_id, vote_rooms!inner(team_id), menu_candidates!inner(name)",
      )
      .eq("vote_rooms.team_id", teamId.trim())
      .order("decided_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      throw error ?? new Error("Failed to load meal history with team filter");
    }

    return data.map((row: any) => ({
      id: row.id,
      decidedAt: row.decided_at,
      roomId: row.room_id,
      menuName: row.menu_candidates?.name ?? "",
    }));
  }

  const { data, error } = await supabase
    .from("meal_history")
    .select("id, decided_at, room_id, final_candidate_id, menu_candidates(name)")
    .order("decided_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    throw error ?? new Error("Failed to load meal history");
  }

  return data.map((row: any) => ({
    id: row.id,
    decidedAt: row.decided_at,
    roomId: row.room_id,
    menuName: row.menu_candidates?.name ?? "",
  }));
}

