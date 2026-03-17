import { NextResponse } from "next/server";
import { getRoomResult } from "@/lib/server/rooms";
import type { RoomResult } from "@/lib/types/domain";
import { isUuid } from "@/lib/utils/uuid";

interface RoomParams {
  params: {
    roomId: string;
  };
}

export async function GET(
  _request: Request,
  { params }: RoomParams,
): Promise<NextResponse<RoomResult | { message: string }>> {
  const { roomId } = params;

  if (!isUuid(roomId)) {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const result = await getRoomResult(roomId);

    if (!result) {
      return NextResponse.json(
        { message: "해당 투표 방을 찾을 수 없어요." },
        { status: 404 },
      );
    }

    return NextResponse.json<RoomResult>(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "투표 결과를 계산하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

