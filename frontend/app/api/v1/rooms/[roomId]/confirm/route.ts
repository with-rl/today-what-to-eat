import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MealHistory } from "@/lib/types/domain";
import { isUuid } from "@/lib/utils/uuid";

interface ConfirmResultRequestBody {
  finalCandidateId?: string;
}

interface ConfirmResultResponseBody {
  history: MealHistory;
}

interface RoomParams {
  params: Promise<{
    roomId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RoomParams,
): Promise<NextResponse<ConfirmResultResponseBody | { message: string }>> {
  const { roomId } = await params;

  if (!isUuid(roomId)) {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as ConfirmResultRequestBody;
    const rawFinalCandidateId =
      typeof body.finalCandidateId === "string"
        ? body.finalCandidateId.trim()
        : "";

    if (!rawFinalCandidateId) {
      return NextResponse.json(
        { message: "최종 선택된 메뉴 후보 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();

    // 1) 이미 확정된 이력이 있는지 먼저 확인 (중복 확정 방지)
    const {
      data: existingHistory,
      error: existingHistoryError,
    } = await supabase
      .from("meal_history")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    if (existingHistoryError) {
      return NextResponse.json(
        {
          message:
            "이전 확정 이력을 확인하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    if (existingHistory) {
      const history: MealHistory = {
        id: existingHistory.id,
        roomId: existingHistory.room_id,
        finalCandidateId: existingHistory.final_candidate_id,
        decidedAt: existingHistory.decided_at,
      };

      return NextResponse.json<ConfirmResultResponseBody>(
        {
          history,
        },
        { status: 409 },
      );
    }

    // 2) 최종 후보가 실제로 해당 방에 속한 메뉴인지 검증
    const { data: candidateRow, error: candidateError } = await supabase
      .from("menu_candidates")
      .select("id, room_id")
      .eq("id", rawFinalCandidateId)
      .eq("room_id", roomId)
      .maybeSingle();

    if (candidateError) {
      return NextResponse.json(
        {
          message:
            "최종 메뉴 후보를 확인하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    if (!candidateRow) {
      return NextResponse.json(
        {
          message:
            "해당 투표 방에 속하지 않은 메뉴 후보입니다. 다시 확인해주세요.",
        },
        { status: 400 },
      );
    }

    // 3) MealHistory 레코드 생성
    const { data, error } = await supabase
      .from("meal_history")
      .insert({
        room_id: roomId,
        final_candidate_id: rawFinalCandidateId,
      })
      .select("*")
      .single();

    if (error || !data) {
      // UNIQUE 제약 조건(이미 확정된 방)에 걸린 경우, 기존 이력을 다시 조회해서 반환
      if ((error as { code?: string } | null)?.code === "23505") {
        const { data: duplicatedHistory } = await supabase
          .from("meal_history")
          .select("*")
          .eq("room_id", roomId)
          .single();

        if (duplicatedHistory) {
          const history: MealHistory = {
            id: duplicatedHistory.id,
            roomId: duplicatedHistory.room_id,
            finalCandidateId: duplicatedHistory.final_candidate_id,
            decidedAt: duplicatedHistory.decided_at,
          };

          return NextResponse.json<ConfirmResultResponseBody>(
            {
              history,
            },
            { status: 409 },
          );
        }
      }

      return NextResponse.json(
        {
          message:
            "결과를 확정하고 이력을 저장하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    const history: MealHistory = {
      id: data.id,
      roomId: data.room_id,
      finalCandidateId: data.final_candidate_id,
      decidedAt: data.decided_at,
    };

    return NextResponse.json<ConfirmResultResponseBody>(
      { history },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "요청을 처리하는 동안 알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

