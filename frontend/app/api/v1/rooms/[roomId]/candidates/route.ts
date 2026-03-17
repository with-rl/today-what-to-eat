import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MenuCandidate } from "@/lib/types/domain";
import { isUuid } from "@/lib/utils/uuid";
import { isExpired } from "@/lib/utils/date";
import { parseJsonBody } from "@/lib/utils/route";
import { z } from "zod";

interface CreateCandidateResponseBody {
  candidate: MenuCandidate;
}

interface RoomParams {
  params: {
    roomId: string;
  };
}

export async function POST(
  request: Request,
  { params }: RoomParams,
): Promise<NextResponse<CreateCandidateResponseBody | { message: string }>> {
  const { roomId } = params;

  if (!isUuid(roomId)) {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const parsed = await parseJsonBody(
      request,
      z.object({
        name: z.preprocess(
          (value) => (typeof value === "string" ? value : ""),
          z.string().trim().min(1, "메뉴 이름은 필수입니다."),
        ),
        description: z
          .union([z.string(), z.null()])
          .optional()
          .transform((value) => {
            if (value == null) return null;
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
          }),
      }),
    );

    if (!parsed.ok) {
      return parsed.response;
    }

    const rawName = parsed.data.name;
    const rawDescription = parsed.data.description ?? null;

    if (!rawName) {
      return NextResponse.json(
        { message: "메뉴 이름은 필수입니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: roomRow, error: roomError } = await supabase
      .from("vote_rooms")
      .select("expires_at, status")
      .eq("id", roomId)
      .maybeSingle();

    if (roomError) {
      return NextResponse.json(
        {
          message:
            "투표 방 상태를 확인하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    if (!roomRow) {
      return NextResponse.json(
        { message: "해당 투표 방을 찾을 수 없어요." },
        { status: 404 },
      );
    }

    if (
      roomRow.status === "closed" ||
      isExpired((roomRow.expires_at as string | null) ?? null)
    ) {
      return NextResponse.json(
        { message: "이미 마감된 투표 방이라 메뉴 후보를 추가할 수 없어요." },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("menu_candidates")
      .insert({
        room_id: roomId,
        name: rawName,
        description: rawDescription,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          message:
            "메뉴 후보를 추가하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    const candidate: MenuCandidate = {
      id: data.id,
      roomId: data.room_id,
      name: data.name,
      description: data.description,
    };

    return NextResponse.json<CreateCandidateResponseBody>(
      { candidate },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "요청을 처리하는 동안 알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

