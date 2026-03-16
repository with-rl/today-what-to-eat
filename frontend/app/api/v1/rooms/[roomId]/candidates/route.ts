import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MenuCandidate } from "@/lib/types/domain";

interface CreateCandidateRequestBody {
  name?: string;
  description?: string | null;
}

interface CreateCandidateResponseBody {
  candidate: MenuCandidate;
}

interface RoomParams {
  params: Promise<{
    roomId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RoomParams,
): Promise<NextResponse<CreateCandidateResponseBody | { message: string }>> {
  const { roomId } = await params;

  if (!roomId || typeof roomId !== "string") {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as CreateCandidateRequestBody;

    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const rawDescription =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : null;

    if (!rawName) {
      return NextResponse.json(
        { message: "메뉴 이름은 필수입니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();

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

