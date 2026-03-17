import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { VoteRoom } from "@/lib/types/domain";

interface CreateRoomRequestBody {
  title?: string;
  teamId?: string | null;
  expiresAt?: string | null;
}

interface CreateRoomResponseBody {
  room: VoteRoom;
}

export async function POST(request: Request): Promise<NextResponse<CreateRoomResponseBody | { message: string }>> {
  try {
    const body = (await request.json()) as CreateRoomRequestBody;

    const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
    const rawTeamId =
      typeof body.teamId === "string" && body.teamId.trim().length > 0
        ? body.teamId.trim()
        : null;
    const rawExpiresAt =
      typeof body.expiresAt === "string" && body.expiresAt.trim().length > 0
        ? body.expiresAt.trim()
        : null;

    if (!rawTitle) {
      return NextResponse.json(
        { message: "방 제목은 필수입니다." },
        { status: 400 },
      );
    }

    let normalizedExpiresAt: string | null = null;
    if (rawExpiresAt) {
      // 브라우저에서 넘어오는 datetime-local 값(타임존 정보 없음)을 KST 기준으로 해석
      const kstIsoString = `${rawExpiresAt}:00+09:00`;
      const parsed = new Date(kstIsoString);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { message: "유효한 마감 시간을 입력해주세요." },
          { status: 400 },
        );
      }
      normalizedExpiresAt = parsed.toISOString();
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("vote_rooms")
      .insert({
        title: rawTitle,
        team_id: rawTeamId,
        expires_at: normalizedExpiresAt,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "투표 방 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    const room: VoteRoom = {
      id: data.id,
      title: data.title,
      teamId: data.team_id,
      expiresAt: data.expires_at,
      status: data.status ?? "open",
      closedAt: data.closed_at ?? null,
      createdAt: data.created_at,
    };

    return NextResponse.json<CreateRoomResponseBody>({ room }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "요청을 처리하는 동안 알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}

