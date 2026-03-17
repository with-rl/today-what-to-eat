import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { VoteRoom } from "@/lib/types/domain";
import { parseJsonBody } from "@/lib/utils/route";
import { z } from "zod";

interface CreateRoomRequestBody {
  title?: string;
  teamId?: string | null;
  expiresAt?: string | null;
}

interface CreateRoomResponseBody {
  room: VoteRoom;
}

function hasTimezoneDesignator(value: string): boolean {
  // Examples: 2026-03-17T03:06:00.000Z, 2026-03-17T12:30:00+09:00, 2026-03-17T12:30:00-05:00
  return /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
}

function normalizeExpiresAtToUtcIso(rawExpiresAt: string): string | null {
  const trimmed = rawExpiresAt.trim();
  if (!trimmed) return null;

  // If timezone is provided, trust it.
  if (hasTimezoneDesignator(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  // datetime-local (no timezone). Interpret as KST (+09:00).
  // - "YYYY-MM-DDTHH:mm"      -> add ":00+09:00"
  // - "YYYY-MM-DDTHH:mm:ss"   -> add "+09:00"
  const kstSource = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)
    ? `${trimmed}:00+09:00`
    : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)
      ? `${trimmed}+09:00`
      : `${trimmed}:00+09:00`;

  const parsed = new Date(kstSource);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function POST(
  request: Request,
): Promise<NextResponse<CreateRoomResponseBody | { message: string }>> {
  try {
    const parsed = await parseJsonBody(
      request,
      z.object({
        title: z.preprocess(
          (value) => (typeof value === "string" ? value : ""),
          z.string().trim().min(1, "방 제목은 필수입니다."),
        ),
        teamId: z
          .union([z.string(), z.null()])
          .optional()
          .transform((value) => {
            if (value == null) return null;
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
          }),
        expiresAt: z
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

    const rawTitle = parsed.data.title;
    const rawTeamId = parsed.data.teamId ?? null;
    const rawExpiresAt = parsed.data.expiresAt ?? null;

    if (!rawTitle) {
      return NextResponse.json(
        { message: "방 제목은 필수입니다." },
        { status: 400 },
      );
    }

    const normalizedExpiresAt = rawExpiresAt
      ? normalizeExpiresAtToUtcIso(rawExpiresAt)
      : null;

    if (rawExpiresAt && !normalizedExpiresAt) {
        return NextResponse.json(
          { message: "유효한 마감 시간을 입력해주세요." },
          { status: 400 },
        );
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

