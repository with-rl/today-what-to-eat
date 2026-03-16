import { NextResponse } from "next/server";
import { getRecentHistory } from "@/lib/server/history";
import type { HistoryItem } from "@/lib/types/domain";

interface HistoryResponseBody {
  items: HistoryItem[];
}

export async function GET(
  request: Request,
): Promise<NextResponse<HistoryResponseBody | { message: string }>> {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");
  const limitParam = url.searchParams.get("limit");

  let limit: number | undefined;
  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return NextResponse.json(
        { message: "limit 파라미터는 1 이상의 정수여야 합니다." },
        { status: 400 },
      );
    }
    limit = parsed;
  }

  try {
    const items = await getRecentHistory({
      teamId,
      limit,
    });

    return NextResponse.json<HistoryResponseBody>(
      { items },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "최근 메뉴 이력을 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

