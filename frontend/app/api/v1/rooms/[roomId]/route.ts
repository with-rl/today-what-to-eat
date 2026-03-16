import { NextResponse } from "next/server";
import { getRoomDetail } from "@/lib/server/rooms";
import type { RoomDetail } from "@/lib/types/domain";

interface RoomDetailParams {
  params: Promise<{
    roomId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RoomDetailParams,
): Promise<NextResponse<RoomDetail | { message: string }>> {
  const { roomId } = await params;

  if (!roomId || typeof roomId !== "string") {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const detail = await getRoomDetail(roomId);

    if (!detail) {
      return NextResponse.json(
        { message: "해당 투표 방을 찾을 수 없어요." },
        { status: 404 },
      );
    }

    return NextResponse.json<RoomDetail>(detail, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "투표 방 정보를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

