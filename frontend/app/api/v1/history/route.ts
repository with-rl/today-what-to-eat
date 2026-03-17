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
  const rawTeamId = url.searchParams.get("teamId");
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

  let teamId: string | null = null;
  if (rawTeamId != null) {
    const trimmed = rawTeamId.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 40) {
        return NextResponse.json(
          { message: "teamId는 40자 이하로 입력해주세요." },
          { status: 400 },
        );
      }

      // 허용: 한글/영문/숫자/공백/하이픈/언더스코어/점
      // (LIKE escape/쿼리 안전 처리는 lib/server/history.ts에서 계속 수행)
      const allowed = /^[0-9A-Za-z가-힣 ._-]+$/;
      if (!allowed.test(trimmed)) {
        return NextResponse.json(
          { message: "teamId에는 한글, 영문, 숫자, 공백, . _ - 만 사용할 수 있어요." },
          { status: 400 },
        );
      }

      teamId = trimmed;
    }
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

